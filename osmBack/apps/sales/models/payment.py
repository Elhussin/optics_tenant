from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel
from apps.sales.models.invoice import Invoice, InvoiceItem
from apps.sales.models.order import Order, PaymentMethod
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Payment(BaseModel):
    """
    Payment Model - Supports multiple payment methods and installments
    """
    # Link to Invoice or Order
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE,
        related_name='payments',
        null=True, blank=True,
        verbose_name=_("Invoice")
    )
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE,
        related_name='payments',
        null=True, blank=True,
        verbose_name=_("Order")
    )

    # Basic Payment Info
    amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        verbose_name=_("Amount")
    )
    amount_base = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Amount (Base Currency)")
    )
    amount_foreign = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Amount (Foreign Currency)")
    )
    currency = models.CharField(
        max_length=3, default='SAR',
        verbose_name=_("Currency")
    )
    exchange_rate = models.DecimalField(
        max_digits=10, decimal_places=6, default=1.0, verbose_name=_("Exchange Rate")
    )
    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        verbose_name=_("Payment Method")
    )
    status = models.CharField(
        max_length=20,
        choices=Order.PaymentStatus.choices,
        default=Order.PaymentStatus.PENDING,
        verbose_name=_("Status")
    )

    # Generic Payer Link
    payer_content_type = models.ForeignKey(
        ContentType, on_delete=models.SET_NULL, null=True, blank=True
    )
    payer_object_id = models.PositiveIntegerField(null=True, blank=True)
    payer = GenericForeignKey('payer_content_type', 'payer_object_id')

    # For Partner (Insurance/Installment)
    partner = models.ForeignKey(
        'crm.Partner',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='payments',
        verbose_name=_("Partner")
    )

    # Gateway Info
    gateway_transaction_id = models.CharField(
        max_length=100, blank=True,
        verbose_name=_("Transaction ID")
    )
    gateway_reference = models.CharField(
        max_length=100, blank=True,
        verbose_name=_("Reference")
    )
    gateway_response = models.JSONField(
        default=dict, blank=True,
        verbose_name=_("Gateway Response")
    )

    # Installment Info (BNPL)
    is_installment = models.BooleanField(
        default=False,
        verbose_name=_("Is Installment")
    )
    installments_count = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Installments Count")
    )
    installment_amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        verbose_name=_("Installment Amount")
    )
    bnpl_order_id = models.CharField(
        max_length=100, blank=True,
        verbose_name=_("BNPL Order ID")
    )

    # Card Info (Encrypted/Masked)
    card_last_four = models.CharField(
        max_length=4, blank=True,
        verbose_name=_("Card Last 4 Digits")
    )
    card_brand = models.CharField(
        max_length=20, blank=True,
        verbose_name=_("Card Brand")
    )

    # Cheque Info
    cheque_number = models.CharField(
        max_length=50, blank=True,
        verbose_name=_("Cheque Number")
    )
    cheque_bank = models.CharField(
        max_length=100, blank=True,
        verbose_name=_("Bank")
    )
    cheque_date = models.DateField(
        null=True, blank=True,
        verbose_name=_("Cheque Date")
    )

    # Bank Transfer Info
    transfer_reference = models.CharField(
        max_length=100, blank=True,
        verbose_name=_("Transfer Reference")
    )
    transfer_bank = models.CharField(
        max_length=100, blank=True,
        verbose_name=_("Bank")
    )

    # Dates
    paid_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name=_("Payment Date")
    )
    refunded_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name=_("Refund Date")
    )
    refund_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        default=0,
        verbose_name=_("Refund Amount")
    )

    notes = models.TextField(
        blank=True,
        verbose_name=_("Notes")
    )

    created_by = models.ForeignKey(
        'branches.BranchUsers',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments_created',
        verbose_name=_("Created By")
    )

    class Meta:
        verbose_name = _("Payment")
        verbose_name_plural = _("Payments")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['payment_method']),
            models.Index(fields=['invoice', 'status']),
        ]

    def __str__(self):
        method_name = self.payment_method.name_en if self.payment_method else "Unknown"
        return f"Payment {self.id} - {self.amount} {self.currency} via {method_name}"

    def save(self, *args, **kwargs):
        if self.is_installment and self.installments_count > 1:
            self.installment_amount = self.amount / self.installments_count
        super().save(*args, **kwargs)

    def mark_completed(self, transaction_id=None, response=None):
        """Update payment status to completed"""
        from django.utils import timezone
        self.status = 'completed'
        self.paid_at = timezone.now()
        if transaction_id:
            self.gateway_transaction_id = transaction_id
        if response:
            self.gateway_response = response
        self.save()

    def mark_failed(self, reason=None):
        """Update payment status to failed"""
        self.status = 'failed'
        if reason:
            self.notes += f"\nFailure Reason: {reason}"
        self.save()

    def refund(self, amount=None, reason=None):
        """Refund Payment"""
        from django.utils import timezone
        refund_amount = amount or self.amount
        if refund_amount > (self.amount - self.refund_amount):
            raise ValueError(_("Refund amount is greater than remaining amount"))

        self.refund_amount += refund_amount
        self.refunded_at = timezone.now()

        if self.refund_amount >= self.amount:
            self.status = 'refunded'
        else:
            self.status = 'partially_refunded'

        if reason:
            self.notes += f"\nRefund Reason: {reason}"

        self.save()
        return refund_amount


class Installment(BaseModel):
    """
    Payment Installments - to track BNPL installments
    """
    INSTALLMENT_STATUS = [
        ('pending', _('Pending')),
        ('due', _('Due')),
        ('paid', _('Paid')),
        ('overdue', _('Overdue')),
        ('cancelled', _('Cancelled')),
    ]

    payment = models.ForeignKey(
        Payment, on_delete=models.CASCADE,
        related_name='installments',
        verbose_name=_("Payment")
    )
    installment_number = models.PositiveIntegerField(
        verbose_name=_("Installment Number")
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        verbose_name=_("Amount")
    )
    due_date = models.DateField(
        verbose_name=_("Due Date")
    )
    status = models.CharField(
        max_length=20,
        choices=INSTALLMENT_STATUS,
        default='pending',
        verbose_name=_("Status")
    )
    paid_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name=_("Payment Date")
    )
    paid_amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0,
        verbose_name=_("Paid Amount")
    )

    class Meta:
        verbose_name = _("Installment")
        verbose_name_plural = _("Installments")
        ordering = ['payment', 'installment_number']
        unique_together = ['payment', 'installment_number']

    def __str__(self):
        return f"Installment {self.installment_number} of {self.payment}"

    def mark_paid(self, amount=None):
        """Record installment payment"""
        from django.utils import timezone
        self.status = 'paid'
        self.paid_at = timezone.now()
        self.paid_amount = amount or self.amount
        self.save()


class PaymentAllocation(BaseModel):
    """
    Allocates a Payment to one or more Invoices (or specific Invoice Items).
    """
    payment = models.ForeignKey(
        Payment, on_delete=models.CASCADE,
        related_name='allocations',
        verbose_name=_("Payment")
    )
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE,
        related_name='payment_allocations',
        verbose_name=_("Invoice")
    )
    invoice_item = models.ForeignKey(
        InvoiceItem, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='allocations',
        verbose_name=_("Invoice Item (Optional)")
    )
    amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        verbose_name=_("Allocated Amount")
    )

    class Meta:
        verbose_name = _("Payment Allocation")
        verbose_name_plural = _("Payment Allocations")
        unique_together = ('payment', 'invoice', 'invoice_item')

    def __str__(self):
        return f"Allocation of {self.amount} from {self.payment} to {self.invoice}"
