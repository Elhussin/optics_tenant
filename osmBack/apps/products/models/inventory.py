# models.py - Enhanced Models
from django.db import models, transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.db.models import Sum, F
from django.contrib.auth.models import User
from apps.branches.models import Branch, BranchUsers
from apps.crm.models import Customer
from core.models import BaseModel
from apps.products.models import Product, ProductVariant
from apps.prescriptions.models import PrescriptionRecord
from decimal import Decimal
import datetime
import uuid

# --- Managers & QuerySets ---


class StockQuerySet(models.QuerySet):
    def for_branch(self, branch):
        return self.filter(branch=branch)

    def low_stock(self):
        return self.filter(quantity_in_stock__lte=models.F('reorder_level'))

    def out_of_stock(self):
        return self.filter(quantity_in_stock__lte=models.F('reserved_quantity'))

    def in_stock(self):
        return self.filter(quantity_in_stock__gt=models.F('reserved_quantity'))


class StockManager(models.Manager):
    def get_queryset(self):
        return StockQuerySet(self.model, using=self._db)

    def for_branch(self, branch):
        return self.get_queryset().for_branch(branch)

    def low_stock(self):
        return self.get_queryset().low_stock()

    def get_total_stock(self, variant):
        """Get total stock across all branches for a variant"""
        return self.filter(variant=variant).aggregate(
            total=models.Sum('quantity_in_stock')
        )['total'] or 0

    def get_available_branches(self, variant, min_quantity=1):
        """Get branches that have the variant in stock"""
        return self.filter(
            variant=variant,
            quantity_in_stock__gte=min_quantity + models.F('reserved_quantity')
        ).select_related('branch')

# --- Models ---


class Stock(BaseModel):
    branch = models.ForeignKey("branches.Branch", on_delete=models.CASCADE)
    variant = models.ForeignKey(
        "ProductVariant", on_delete=models.CASCADE, related_name='stocks')
    # Stock quantities
    quantity_in_stock = models.PositiveIntegerField(default=0)
    reserved_quantity = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=5)
    max_stock_level = models.PositiveIntegerField(default=100)
    min_stock_level = models.PositiveIntegerField(default=0)
    average_cost = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    last_cost = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, help_text=_("Last purchase cost per unit"))
    # Stock tracking
    last_restocked = models.DateTimeField(null=True, blank=True)
    last_sale = models.DateTimeField(null=True, blank=True)
    allow_backorder = models.BooleanField(default=False)
    is_consignment = models.BooleanField(
        default=False, verbose_name=_("Consignment Stock"),
        help_text=_("Indicates if stock is vendor consignment inventory")
    )


    objects = StockManager()

    class Meta:
        unique_together = [('branch', 'variant')]
        indexes = [
            models.Index(fields=['branch', 'quantity_in_stock']),
            models.Index(fields=['branch', 'is_active']),
        ]

    def __str__(self):
        return f"{self.branch.name} - {self.variant} ({self.available_quantity} available)"

    @property
    def available_quantity(self):
        return max(0, self.quantity_in_stock - self.reserved_quantity)

    @property
    def stock_status(self):
        if self.available_quantity <= 0:
            return _("Out of Stock")
        elif self.available_quantity <= self.reorder_level:
            return _("Low Stock")
        elif self.quantity_in_stock > self.max_stock_level:
            return _("Overstocked")
        return _("In Stock")




class StockMovement(BaseModel):
    """Track all stock movements for audit purposes"""
    class MovementType(models.TextChoices):
        PURCHASE = 'purchase', _('Purchase/Restock')
        SALE = 'sale', _('Sale')
        TRANSFER_IN = 'transfer_in', _('Transfer In')
        TRANSFER_OUT = 'transfer_out', _('Transfer Out')
        ADJUSTMENT = 'adjustment', _('Stock Adjustment')
        DAMAGE = 'damage', _('Damage/Loss')
        RETURN = 'return', _('Customer Return')
        RETURN_TO_SUPPLIER = 'return_to_supplier', _('Return to Supplier')
        RESERVE = 'reserve', _('Reserve Stock')
        RELEASE = 'release', _('Release Reserved')

    stock = models.ForeignKey(
        "Stock", on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(
        max_length=20, choices=MovementType.choices)
    quantity = models.IntegerField()
    quantity_before = models.PositiveIntegerField()
    quantity_after = models.PositiveIntegerField()
    reference_number = models.CharField(max_length=50, blank=True)
    invoice = models.ForeignKey(
        'sales.Invoice', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='stock_movements', help_text=_("Related Invoice")
    )
    purchase_order = models.ForeignKey(
        'products.PurchaseOrder', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='stock_movements', help_text=_("Related Purchase Order")
    )
    notes = models.TextField(blank=True)
    movement_date = models.DateTimeField(auto_now_add=True)
    cost_per_unit = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    created_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='stock_movements', help_text=_("User who created this movement")
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['stock', '-created_at']),
            models.Index(fields=['movement_type', '-created_at']),
            models.Index(fields=['reference_number']),
            models.Index(fields=['invoice']),
            models.Index(fields=['purchase_order']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.stock} - {self.movement_type} ({self.quantity})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.movement_type == 'purchase' and self.cost_per_unit > 0 and hasattr(self, 'stock'):
            variant = self.stock.variant
            if variant:
                variant.last_purchase_price = self.cost_per_unit
                variant.save(update_fields=['last_purchase_price'])


class StockTransfer(BaseModel):
    """Stock transfers between branches"""

    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        SUBMITTED = 'submitted', _('Submitted')
        SHIPPED = 'shipped', _('Shipped')
        RECEIVED = 'received', _('Received')
        COMPLETED = 'completed', _('Completed')
        CANCELLED = 'cancelled', _('Cancelled')

    from_branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name='outgoing_transfers')
    to_branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name='incoming_transfers')
    transfer_number = models.CharField(
        max_length=50, unique=True, editable=False)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING)
    requested_by = models.CharField(max_length=100, blank=True)
    approved_by = models.CharField(max_length=100, blank=True)

    # Dates
    requested_date = models.DateTimeField(auto_now_add=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    shipped_date = models.DateTimeField(null=True, blank=True)
    received_date = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.transfer_number:
            self.transfer_number = f"TRF-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transfer_number} | {self.from_branch.code} → {self.to_branch.code}"




class StockTransferItem(BaseModel):
    transfer = models.ForeignKey(
        StockTransfer, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity_requested = models.PositiveIntegerField()
    quantity_sent = models.PositiveIntegerField(default=0)
    quantity_received = models.PositiveIntegerField(default=0)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.variant} x {self.quantity_requested}"
