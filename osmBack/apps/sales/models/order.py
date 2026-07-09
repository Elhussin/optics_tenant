from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel
from apps.sales.models.base import BaseDocument, BaseItem
from apps.branches.models import BranchUsers
from apps.prescriptions.models import PrescriptionRecord
from apps.accounting.models.chart_of_accounts import ChartOfAccounts
from apps.products.models import PricingPolicy

class PaymentMethod(BaseModel):
    """
    Dynamic Payment Methods (e.g., Mada, Visa, Tabby, Apple Pay)
    Allows adding new methods without code changes.
    """
    name_ar = models.CharField(
        max_length=100, verbose_name=_("Name (Arabic)"))
    name_en = models.CharField(
        max_length=100, verbose_name=_("Name (English)"))
    code = models.SlugField(unique=True, verbose_name=_("Code"))  # e.g., 'tabby', 'mada'
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

    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name=_("Payment Method")
    )

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
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['customer', '-created_at']),
            models.Index(fields=['branch', '-created_at']),
            models.Index(fields=['created_at']),
        ]

    @property
    def payment_type(self):
        return self.payment_method

    def __str__(self):
        customer_name = self.customer.full_name if self.customer else "Unknown"
        return f"Order {self.order_number} - {customer_name}"

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
            from apps.sales.utils import generate_serial_number
            self.order_number = generate_serial_number(Order, 'ORD', 'order_number')
        super().save(*args, **kwargs)


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
        variant_desc = self.product_variant.product.model if self.product_variant and self.product_variant.product else "Unknown Variant"
        return f"{variant_desc} - {self.quantity}"
