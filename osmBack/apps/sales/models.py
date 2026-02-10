# models.py - Refactored for Thread Safety

from apps.accounting.models.tax import TaxRate
from django.db import models, transaction, IntegrityError
from django.utils.translation import gettext_lazy as _
from apps.crm.models import Customer
from apps.branches.models import Branch, BranchUsers
from core.models import BaseModel
from apps.products.models import ProductVariant
from apps.prescriptions.models import PrescriptionRecord
from decimal import Decimal
import time

# Services (Assuming they exist as imported)
# Services imports moved to methods to avoid circular dependency
# from apps.sales.services.order_service import confirm_order, cancel_order, calculate_order_totals
# from apps.sales.services.invoice_service import confirm_invoice, calculate_invoice_totals
# from apps.sales.services.payment_service import apply_payment
from apps.products.models.pricing_policy import PricingPolicy
from apps.accounting.models.chart_of_accounts import ChartOfAccounts
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class BaseDocument(BaseModel):
    branch = models.ForeignKey(
        Branch, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='%(class)s_branch',
        verbose_name=_("Branch")
    )
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE,
        related_name='%(class)s_customer',
        verbose_name=_("Customer")
    )

    subtotal = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Subtotal")
    )
    tax_rate = models.DecimalField(
        max_digits=5, decimal_places=4, default=Decimal('0.15'),
        verbose_name=_("Tax Rate")
    )
    tax_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Tax Amount")
    )
    discount_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Discount Amount")
    )
    total_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Total Amount")
    )
    paid_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Paid Amount")
    )

    class Meta:
        abstract = True

    @property
    def remaining_amount(self):
        return self.total_amount - self.paid_amount

    @property
    def is_fully_paid(self):
        return self.paid_amount >= self.total_amount


class BaseItem(BaseModel):
    product_variant = models.ForeignKey(
        ProductVariant, on_delete=models.SET_NULL, null=True,
        related_name='%(class)s_variant',
        verbose_name=_("Product")
    )
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Quantity")
    )
    unit_price = models.DecimalField(
        max_digits=12, decimal_places=2,
        verbose_name=_("Unit Price")
    )
    total_price = models.DecimalField(
        max_digits=12, decimal_places=2, editable=False,
        verbose_name=_("Total Price")
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class InvoiceType(BaseModel):
    name = models.CharField(
        max_length=100, verbose_name=_("Invoice Type Name"))
    code = models.SlugField(max_length=50, unique=True, verbose_name=_("Code"))
    pricing_policy = models.ForeignKey(
        PricingPolicy,
        on_delete=models.PROTECT,
        verbose_name=_("Pricing Policy")
    )
    revenue_account = models.ForeignKey(
        ChartOfAccounts,
        on_delete=models.PROTECT,
        limit_choices_to={'account_type': 'revenue'},
        verbose_name=_("Revenue GL Account")
    )
    is_active = models.BooleanField(default=True, verbose_name=_("Active"))

    class Meta:
        verbose_name = _("Invoice Type")
        verbose_name_plural = _("Invoice Types")

    def __str__(self):
        return f"{self.name} ({self.code})"


class PaymentMethod(BaseModel):
    """
    Dynamic Payment Methods (e.g., Mada, Visa, Tabby, Apple Pay)
    Allows adding new methods without code changes.
    """
    name_ar = models.CharField(
        max_length=100, verbose_name=_("Name (Arabic)"))
    name_en = models.CharField(
        max_length=100, verbose_name=_("Name (English)"))
    code = models.SlugField(unique=True, verbose_name=_(
        "Code"))  # e.g., 'tabby', 'mada'
    is_active = models.BooleanField(default=True, verbose_name=_("Active"))
    icon = models.ImageField(
        upload_to='payment_icons/', null=True, blank=True,
        verbose_name=_("Icon")
    )
    provider_fees_percent = models.DecimalField(
        max_digits=5, decimal_places=2, default=0.0,
        help_text=_("Percentage fee charged by the provider (e.g., 2.5)")
    )
    is_installment = models.BooleanField(
        default=False, verbose_name=_("Is Installment (BNPL)"))

    gl_account = models.ForeignKey(
        ChartOfAccounts,
        on_delete=models.PROTECT,
        null=True, blank=True,
        limit_choices_to={'account_type': 'asset'},
        verbose_name=_("GL Account (Asset)")
    )

    def __str__(self):
        return f"{self.name_en} ({self.name_ar})"

    class Meta:
        verbose_name = _("Payment Method")
        verbose_name_plural = _("Payment Methods")


class Order(BaseDocument):
    class OrderType(models.TextChoices):
        CASH = 'cash', _('Cash')
        CREDIT = 'credit', _('Credit')
        INSURANCE = 'insurance', _('Insurance')
        BNPL = 'bnpl', _('Installment')           # Tabby, Tamara
        CORPORATE = 'corporate', _('Corporate')
        WHOLESALE = 'wholesale', _('Wholesale')

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PARTIAL = 'partial', _('Partial Payment')
        PAID = 'paid', _('Paid')
        REFUNDED = 'refunded', _('Refunded')
        DISPUTED = 'disputed', _('Disputed')

    class OrderStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        CONFIRMED = 'confirmed', _('Confirmed')
        READY = 'ready', _('Ready')
        DELIVERED = 'delivered', _('Delivered')
        CANCELLED = 'cancelled', _('Cancelled')

    # Order type (determines workflow)
    order_type = models.CharField(
        max_length=20, choices=OrderType.choices, default=OrderType.CASH,
        verbose_name=_("Order Type")
    )
    order_number = models.CharField(
        max_length=20, unique=True, editable=False,
        verbose_name=_("Order Number")
    )
    status = models.CharField(
        max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING,
        verbose_name=_("Order Status")
    )

    # Payment
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING,
        verbose_name=_("Payment Status")
    )

    # Changed to ForeignKey for dynamic behavior
    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name=_("Payment Method")
    )

    # Link to Partner (Insurance/Installment/Corporate)
    partner = models.ForeignKey(
        'crm.Partner',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name=_("Partner")
    )
    customer_partner_link = models.ForeignKey(
        'crm.CustomerPartnerLink',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name=_("Customer Partner Link")
    )

    # Additional amounts for Insurance/Installment
    partner_share = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name=_("Partner Share"),
        help_text=_("Amount due from partner (insurance/installment)")
    )
    customer_share = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name=_("Customer Share"),
        help_text=_("Amount due from customer directly")
    )

    notes = models.TextField(
        blank=True,
        verbose_name=_("Notes")
    )
    internal_notes = models.TextField(
        blank=True,
        verbose_name=_("Internal Notes")
    )
    confirmed_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name=_("Confirmation Date")
    )
    delivered_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name=_("Delivery Date")
    )
    expected_delivery = models.DateTimeField(
        null=True, blank=True,
        verbose_name=_("Expected Delivery Date")
    )
    sales_person = models.ForeignKey(
        BranchUsers, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name=_("Sales Person")
    )

    class Meta:
        verbose_name = _("Order")
        verbose_name_plural = _("Orders")

    # Legacy compatibility
    @property
    def payment_type(self):
        return self.payment_method

    def __str__(self):
        return f"Order {self.order_number} - {self.customer.full_name}"

    def calculate_partner_shares(self):
        """Calculate amount distribution between Customer and Partner"""
        if self.order_type in ['insurance', 'bnpl', 'corporate'] and self.partner:
            if self.customer_partner_link:
                self.customer_share = self.customer_partner_link.get_patient_share(
                    self.total_amount)
            elif self.partner:
                percentage = self.partner.patient_share_percentage
                self.customer_share = self.total_amount * percentage / 100

            self.partner_share = self.total_amount - self.customer_share
        else:
            self.customer_share = self.total_amount
            self.partner_share = 0

        return self.customer_share, self.partner_share

    def save(self, *args, **kwargs):
        if not self.order_number:
            self._save_with_retry(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def _save_with_retry(self, *args, **kwargs):
        # Retry logic for unique constaint violation on order_number
        from apps.sales.utils import generate_serial_number
        max_retries = 5
        for i in range(max_retries):
            try:
                self.order_number = generate_serial_number(
                    Order, 'ORD', 'order_number')
                with transaction.atomic():
                    super().save(*args, **kwargs)
                return  # Success
            except IntegrityError:
                if i == max_retries - 1:
                    raise  # Give up
                time.sleep(0.1)  # Small backoff

    def calculate_totals(self):
        from apps.sales.services.order_service import calculate_order_totals
        return calculate_order_totals(self)

    def confirm(self, user):
        from apps.sales.services.order_service import confirm_order
        return confirm_order(self, user)

    def cancel(self, user):
        from apps.sales.services.order_service import cancel_order
        return cancel_order(self, user)


class OrderItem(BaseItem):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='items',
        verbose_name=_("Order")
    )
    prescription = models.ForeignKey(
        PrescriptionRecord, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='order_items',
        verbose_name=_("Prescription")
    )

    class Meta:
        verbose_name = _("Order Item")
        verbose_name_plural = _("Order Items")

    def __str__(self):
        return f"{self.product_variant.product.model} - {self.quantity}"


class Invoice(BaseDocument):
    INVOICE_TYPES = [
        ('purchase', _('Purchase')),
        ('sale', _('Sale')),
        ('return_purchase', _('Purchase Return')),
        ('return_sale', _('Sale Return'))
    ]
    INVOICE_STATUS = [
        ('draft', _('Draft')),
        ('paid', _('Paid')),
        ('partially_paid', _('Partially Paid')),
        ('overdue', _('Overdue')),
        ('confirmed', _('Confirmed'))
    ]

    invoice_number = models.CharField(
        max_length=50, unique=True, editable=False,
        verbose_name=_("Invoice Number")
    )
    invoice_type = models.ForeignKey(
        InvoiceType, on_delete=models.PROTECT, null=True,
        verbose_name=_("Invoice Type")
    )
    # Legacy field, kept for migration but should be deprecated or synced
    invoice_type_code = models.CharField(
        max_length=20, choices=INVOICE_TYPES, default='sale',
        verbose_name=_("Invoice Type Code (Legacy)")
    )

    pricing_policy_snapshot = models.JSONField(
        default=dict, blank=True, verbose_name=_("Pricing Policy Snapshot")
    )
    tax_snapshot = models.JSONField(
        default=dict, blank=True, verbose_name=_("Tax Snapshot")
    )

    # Multi-Currency Support
    currency = models.CharField(
        max_length=3, default='SAR', verbose_name=_("Currency")
    )
    exchange_rate = models.DecimalField(
        max_digits=10, decimal_places=6, default=1.0, verbose_name=_("Exchange Rate")
    )
    total_amount_base = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, verbose_name=_("Total Amount (Base)")
    )
    total_amount_foreign = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, verbose_name=_("Total Amount (Foreign)")
    )

    created_by = models.ForeignKey(
        BranchUsers, on_delete=models.SET_NULL, null=True,
        related_name='%(class)s_created_by',
        verbose_name=_("Created By")
    )
    order = models.ForeignKey(
        Order, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='%(class)s_order',
        verbose_name=_("Order")
    )
    due_date = models.DateField(
        null=True, blank=True,
        verbose_name=_("Due Date")
    )
    status = models.CharField(
        max_length=20, choices=INVOICE_STATUS, default='draft',
        verbose_name=_("Status")
    )
    notes = models.TextField(
        blank=True, null=True,
        verbose_name=_("Notes")
    )
    confirmed_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name=_("Confirmation Date")
    )

    class Meta:
        verbose_name = _("Invoice")
        verbose_name_plural = _("Invoices")

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.customer.first_name}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self._save_with_retry(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def _save_with_retry(self, *args, **kwargs):
        from apps.sales.utils import generate_serial_number
        max_retries = 5
        for i in range(max_retries):
            try:
                self.invoice_number = generate_serial_number(
                    Invoice, 'INV', 'invoice_number')
                with transaction.atomic():
                    super().save(*args, **kwargs)
                return
            except IntegrityError:
                if i == max_retries - 1:
                    raise
                time.sleep(0.1)

    def calculate_totals(self):
        from apps.sales.services.invoice_service import calculate_invoice_totals
        return calculate_invoice_totals(self)

    def confirm(self):
        from apps.sales.services.invoice_service import confirm_invoice
        return confirm_invoice(self)


class InvoiceItem(BaseItem):
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name='items',
        verbose_name=_("Invoice")
    )

    class Meta:
        verbose_name = _("Invoice Item")
        verbose_name_plural = _("Invoice Items")


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
        'Order', on_delete=models.CASCADE,
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

    # For Partner (Insurance/Installment) - Deprecate in favor of Generic Payer?
    # Keeping for backward compatibility for now
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
        target = self.invoice or self.order
        return f"Payment of {self.amount} {self.currency} via {self.get_payment_method_display()}"

    def save(self, *args, **kwargs):
        # Calculate installment amount
        if self.is_installment and self.installments_count > 1:
            self.installment_amount = self.amount / self.installments_count

        super().save(*args, **kwargs)

        # Update invoice upon payment completion
        if self.status == 'completed' and self.invoice:
            from apps.sales.services.payment_service import apply_payment
            apply_payment(self.invoice, self.amount)

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
            raise ValueError(
                _("Refund amount is greater than remaining amount"))

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


class InvoiceTax(BaseModel):
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE,
        related_name='taxes',
        verbose_name=_("Invoice")
    )
    tax = models.ForeignKey(
        TaxRate,
        on_delete=models.PROTECT,
        verbose_name=_("Tax Rate")
    )
    base_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        verbose_name=_("Base Amount")
    )
    tax_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        verbose_name=_("Tax Amount")
    )

    class Meta:
        verbose_name = _("Invoice Tax")
        verbose_name_plural = _("Invoice Taxes")
