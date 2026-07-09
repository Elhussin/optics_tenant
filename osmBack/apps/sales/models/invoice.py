import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel
from apps.sales.models.base import BaseDocument, BaseItem
from apps.sales.models.order import Order
from apps.accounting.models.chart_of_accounts import ChartOfAccounts
from apps.products.models.pricing_policy import PricingPolicy
from apps.branches.models import BranchUsers

class InvoiceType(BaseModel):
    class ActionType(models.TextChoices):
        SALE = 'sale', _('Sale (Decrease Stock, Increase Revenue)')
        PURCHASE = 'purchase', _('Purchase (Increase Stock, Increase Payable)')
        RETURN_SALE = 'return_sale', _('Sale Return (Increase Stock, Decrease Revenue)')
        RETURN_PURCHASE = 'return_purchase', _('Purchase Return (Decrease Stock, Decrease Payable)')
        NEUTRAL = 'neutral', _('Neutral (No Stock Impact)')

    name = models.CharField(
        max_length=100, verbose_name=_("Invoice Type Name"))
    code = models.SlugField(max_length=50, unique=True, verbose_name=_("Code"))
    action_type = models.CharField(
        max_length=20,
        choices=ActionType.choices,
        default=ActionType.SALE,
        verbose_name=_("Action Type"),
        help_text=_("Defines how this invoice affects stock and accounting")
    )
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
        ('confirmed', _('Confirmed')),
        # ZATCA Statuses
        ('pending_clearance', _('Pending Clearance')),
        ('cleared', _('Cleared (ZATCA)')),
        ('rejected', _('Rejected (ZATCA)')),
        ('reported', _('Reported (ZATCA)'))
    ]

    invoice_number = models.CharField(
        max_length=50, unique=True, editable=False,
        verbose_name=_("Invoice Number (Draft/Internal)")
    )
    invoice_uuid = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False, null=True,
        verbose_name=_("Invoice UUID (ZATCA)")
    )
    zatca_tax_number = models.CharField(
        max_length=50, unique=True, null=True, blank=True, editable=False,
        verbose_name=_("ZATCA Tax Number (Final)")
    )
    previous_invoice_hash = models.CharField(
        max_length=255, blank=True, null=True, editable=False,
        verbose_name=_("Previous Invoice Hash (ZATCA)")
    )
    current_invoice_hash = models.CharField(
        max_length=255, blank=True, null=True, editable=False,
        verbose_name=_("Current Invoice Hash (ZATCA)")
    )
    invoice_type = models.ForeignKey(
        InvoiceType, on_delete=models.PROTECT, null=True,
        verbose_name=_("Invoice Type")
    )
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
    purchase_order = models.ForeignKey(
        'products.PurchaseOrder', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='invoices',
        verbose_name=_("Purchase Order")
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
         indexes = [
             models.Index(fields=['status', '-created_at']),
             models.Index(fields=['customer', '-created_at']),
             models.Index(fields=['branch', '-created_at']),
             models.Index(fields=['created_at']),
         ]

    def __str__(self):
        customer_name = self.customer.first_name if self.customer else "Unknown"
        return f"Invoice {self.invoice_number} - {customer_name}"

    def clean(self):
        super().clean()
        if self.pk:
            old_instance = Invoice.objects.get(pk=self.pk)
            if old_instance.status in ['confirmed', 'cleared', 'reported', 'pending_clearance']:
                allowed_fields = ['status', 'zatca_tax_number', 'previous_invoice_hash', 'current_invoice_hash', 'paid_amount', 'updated_at']
                for field in self._meta.fields:
                    if field.name not in allowed_fields:
                        old_val = getattr(old_instance, field.name)
                        new_val = getattr(self, field.name)
                        if old_val != new_val:
                            raise ValidationError(
                                _("Cannot modify confirmed invoice. Use Credit Note instead. (Field: {})".format(field.name))
                            )

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            from apps.sales.utils import generate_serial_number
            self.invoice_number = generate_serial_number(Invoice, 'INV', 'invoice_number')
        super().save(*args, **kwargs)


class InvoiceItem(BaseItem):
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name='items',
        verbose_name=_("Invoice")
    )

    class Meta:
        verbose_name = _("Invoice Item")
        verbose_name_plural = _("Invoice Items")


class InvoiceTax(BaseModel):
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name='taxes',
        verbose_name=_("Invoice")
    )
    tax_rate = models.ForeignKey(
        'accounting.TaxRate', on_delete=models.PROTECT,
        verbose_name=_("Tax Rate")
    )
    taxable_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        verbose_name=_("Taxable Amount")
    )
    tax_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        verbose_name=_("Tax Amount")
    )

    class Meta:
        verbose_name = _("Invoice Tax")
        verbose_name_plural = _("Invoice Taxes")


class CreditNote(BaseDocument):
    """
    Credit Note (إشعار دائن) used for correcting or refunding confirmed invoices.
    Required by ZATCA since confirmed invoices are immutable.
    """
    invoice = models.ForeignKey(
        Invoice, on_delete=models.PROTECT, related_name='credit_notes',
        verbose_name=_("Original Invoice")
    )
    credit_note_number = models.CharField(
        max_length=50, unique=True, editable=False,
        verbose_name=_("Credit Note Number")
    )
    credit_note_uuid = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False, null=True,
        verbose_name=_("Credit Note UUID (ZATCA)")
    )
    reason = models.CharField(
        max_length=255, verbose_name=_("Reason for Issuance")
    )
    status = models.CharField(
        max_length=20, choices=Invoice.INVOICE_STATUS, default='draft',
        verbose_name=_("Status")
    )
    created_by = models.ForeignKey(
        BranchUsers, on_delete=models.SET_NULL, null=True,
        related_name='created_credit_notes',
        verbose_name=_("Created By")
    )
    confirmed_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name=_("Confirmation Date")
    )
    zatca_tax_number = models.CharField(
        max_length=50, unique=True, null=True, blank=True, editable=False,
        verbose_name=_("ZATCA Tax Number (Final)")
    )
    previous_hash = models.CharField(
        max_length=255, blank=True, null=True, editable=False,
        verbose_name=_("Previous Hash (ZATCA)")
    )
    current_hash = models.CharField(
        max_length=255, blank=True, null=True, editable=False,
        verbose_name=_("Current Hash (ZATCA)")
    )

    class Meta:
        verbose_name = _("Credit Note")
        verbose_name_plural = _("Credit Notes")

    def __str__(self):
        return f"Credit Note {self.credit_note_number} for Invoice {self.invoice.invoice_number}"

    def clean(self):
        super().clean()
        if self.pk:
            old_instance = CreditNote.objects.get(pk=self.pk)
            if old_instance.status in ['confirmed', 'cleared', 'reported', 'pending_clearance']:
                allowed_fields = ['status', 'zatca_tax_number', 'previous_hash', 'current_hash', 'updated_at']
                for field in self._meta.fields:
                    if field.name not in allowed_fields:
                        old_val = getattr(old_instance, field.name)
                        new_val = getattr(self, field.name)
                        if old_val != new_val:
                            raise ValidationError(
                                _("Cannot modify confirmed credit note. (Field: {})".format(field.name))
                            )

    def save(self, *args, **kwargs):
        if not self.credit_note_number:
            from apps.sales.utils import generate_serial_number
            self.credit_note_number = generate_serial_number(CreditNote, 'CN', 'credit_note_number')
        super().save(*args, **kwargs)


class CreditNoteItem(BaseItem):
    credit_note = models.ForeignKey(
        CreditNote, on_delete=models.CASCADE, related_name='items',
        verbose_name=_("Credit Note")
    )

    class Meta:
        verbose_name = _("Credit Note Item")
        verbose_name_plural = _("Credit Note Items")

    def __str__(self):
        variant_desc = self.product_variant.product.model if self.product_variant and self.product_variant.product else "Unknown Variant"
        return f"{variant_desc} - {self.quantity} (CN {self.credit_note.id})"
