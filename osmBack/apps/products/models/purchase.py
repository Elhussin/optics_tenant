"""Purchase Order Models for managing supplier purchases"""
from django.db import models, transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from core.models import BaseModel
from decimal import Decimal
import uuid


class PurchaseOrder(BaseModel):
    """Purchase Order for tracking supplier purchases"""

    class Status(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        SUBMITTED = 'submitted', _('Submitted')
        APPROVED = 'approved', _('Approved')
        PARTIALLY_RECEIVED = 'partially_received', _('Partially Received')
        RECEIVED = 'received', _('Received')
        CANCELLED = 'cancelled', _('Cancelled')

    order_number = models.CharField(
        max_length=50, unique=True, editable=False,
        verbose_name=_("Order Number")
    )
    supplier = models.ForeignKey(
        'Supplier', on_delete=models.PROTECT,
        related_name='purchase_orders',
        verbose_name=_("Supplier")
    )
    branch = models.ForeignKey(
        'branches.Branch', on_delete=models.PROTECT,
        related_name='purchase_orders',
        verbose_name=_("Receiving Branch"),
        help_text=_("Branch that will receive the stock")
    )
    status = models.CharField(
        max_length=20, choices=Status.choices,
        default=Status.DRAFT,
        verbose_name=_("Status")
    )

    # Dates
    order_date = models.DateField(
        default=timezone.now,
        verbose_name=_("Order Date")
    )
    expected_date = models.DateField(
        null=True, blank=True,
        verbose_name=_("Expected Delivery Date")
    )
    received_date = models.DateTimeField(
        null=True, blank=True,
        verbose_name=_("Received Date")
    )

    # Users
    created_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_purchase_orders',
        verbose_name=_("Created By")
    )
    approved_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='approved_purchase_orders',
        verbose_name=_("Approved By")
    )
    approved_date = models.DateTimeField(
        null=True, blank=True,
        verbose_name=_("Approved Date")
    )

    # Financial
    subtotal = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Subtotal")
    )
    tax_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Tax Amount")
    )
    total_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Total Amount")
    )

    notes = models.TextField(blank=True, verbose_name=_("Notes"))

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Purchase Order")
        verbose_name_plural = _("Purchase Orders")
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['supplier', '-created_at']),
            models.Index(fields=['branch', '-created_at']),
        ]

    def __str__(self):
        return f"{self.order_number} - {self.supplier.name}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"PO-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)




class PurchaseOrderItem(BaseModel):
    """Individual line item in a purchase order"""

    order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_("Order")
    )
    variant = models.ForeignKey(
        'ProductVariant', on_delete=models.PROTECT,
        related_name='purchase_order_items',
        verbose_name=_("Product Variant")
    )
    quantity_ordered = models.PositiveIntegerField(
        verbose_name=_("Quantity Ordered")
    )
    quantity_received = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Quantity Received")
    )
    unit_cost = models.DecimalField(
        max_digits=10, decimal_places=2,
        verbose_name=_("Unit Cost")
    )
    notes = models.TextField(blank=True, verbose_name=_("Notes"))

    class Meta:
        verbose_name = _("Purchase Order Item")
        verbose_name_plural = _("Purchase Order Items")

    def __str__(self):
        return f"{self.variant} x {self.quantity_ordered}"

    @property
    def line_total(self) -> Decimal:
        """Calculate line total"""
        return Decimal(self.quantity_ordered) * self.unit_cost

    @property
    def remaining_quantity(self) -> int:
        """Quantity yet to be received"""
        return self.quantity_ordered - self.quantity_received

    @property
    def is_fully_received(self) -> bool:
        """Check if item is fully received"""
        return self.quantity_received >= self.quantity_ordered
