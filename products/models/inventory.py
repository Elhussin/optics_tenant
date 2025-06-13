# models.py - النماذج المحسنة
from django.db import models, transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models import Sum, F
from django.contrib.auth.models import User
from branches.models import Branch,BranchUsers
from CRM.models import Customer
from core.models import BaseModel
from products.models import Product, ProductVariant
from prescriptions.models import PrescriptionRecord
from decimal import Decimal
import datetime
import uuid

# class InventoryDocument(BaseModel):
#     DOCUMENT_TYPES = [
#         ('purchase', 'Purchase Receipt'),
#         ('sale', 'Sale Issue'),
#         ('adjustment', 'Adjustment'),
#         ('transfer', 'Transfer'),
#         ('return', 'Return'),
#         ('damage', 'Damage'),
#     ]

#     branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
#     document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
#     reference_number = models.CharField(max_length=100, blank=True)
#     notes = models.TextField(blank=True)
#     is_processed = models.BooleanField(default=False)
#     processed_at = models.DateTimeField(null=True, blank=True)
#     processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

#     def __str__(self):
#         return f"{self.get_document_type_display()} #{self.id}"

#     @transaction.atomic
#     def process_document(self, user):
#         """معالجة المستند وتطبيق التغييرات على المخزون"""
#         if self.is_processed:
#             raise ValidationError("Document already processed")
        
#         for line_item in self.line_items.all():
#             line_item.apply_to_stock()
        
#         self.is_processed = True
#         self.processed_at = timezone.now()
#         self.processed_by = user
#         self.save()


# class InventoryLineItem(models.Model):
#     document = models.ForeignKey(InventoryDocument, related_name="line_items", on_delete=models.CASCADE)
#     variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
#     quantity = models.IntegerField()
#     unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     from_branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='outgoing_items')
#     to_branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='incoming_items')

#     def __str__(self):
#         return f"{self.variant} x {self.quantity}"

#     def apply_to_stock(self):
#         """تطبيق التغيير على المخزون"""
#         movement_type_map = {
#             'purchase': 'in',
#             'sale': 'out',
#             'adjustment': 'adjustment',
#             'transfer': 'transfer_out' if self.from_branch else 'transfer_in',
#             'return': 'return',
#             'damage': 'damage',
#         }
        
#         movement_type = movement_type_map.get(self.document.document_type, 'adjustment')
        
#         # إنشاء حركة المخزون
#         StockMovement.objects.create(
#             branch=self.document.branch,
#             variant=self.variant,
#             movement_type=movement_type,
#             quantity=self.quantity,
#             reference_number=self.document.reference_number,
#             reference_type='manual',
#             notes=f"From document {self.document.id}",
#             created_by=self.document.processed_by or self.document.created_by,
#         )


# class Stock(models.Model):
#     branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
#     variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='stocks')
#     quantity_reserved = models.IntegerField(default=0)
#     stock_quantity = models.IntegerField(default=0)
#     minimum_stock_level = models.IntegerField(default=2)
#     max_stock_level = models.IntegerField(default=100)
#     average_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     last_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     last_updated = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ('branch', 'variant')
#         indexes = [
#             models.Index(fields=['branch', 'variant']),
#             models.Index(fields=['stock_quantity']),
#         ]

#     @property
#     def available_quantity(self):
#         return max(self.stock_quantity - self.quantity_reserved, 0)

#     @property
#     def needs_reorder(self):
#         return self.available_quantity <= self.minimum_stock_level

#     def reserve_stock(self, quantity):
#         """حجز المخزون"""
#         if quantity > self.available_quantity:
#             raise ValidationError(f"Cannot reserve {quantity}. Available: {self.available_quantity}")
#         self.quantity_reserved += quantity
#         self.save()

#     def release_reservation(self, quantity):
#         """إلغاء حجز المخزون"""
#         self.quantity_reserved = max(self.quantity_reserved - quantity, 0)
#         self.save()

#     def update_average_cost(self, new_quantity, new_cost):
#         """تحديث التكلفة المتوسطة"""
#         if self.stock_quantity > 0:
#             total_cost = (self.stock_quantity * self.average_cost) + (new_quantity * new_cost)
#             total_quantity = self.stock_quantity + new_quantity
#             self.average_cost = total_cost / total_quantity if total_quantity > 0 else new_cost
#         else:
#             self.average_cost = new_cost
#         self.last_cost = new_cost


# class StockMovement(models.Model):
#     MOVEMENT_TYPES = [
#         ('in', 'In'),
#         ('out', 'Out'),
#         ('adjustment', 'Adjustment'),
#         ('transfer_in', 'Transfer In'),
#         ('transfer_out', 'Transfer Out'),
#         ('return', 'Return'),
#         ('damage', 'Damage'),
#         ('reserve', 'Reserve'),
#         ('release', 'Release'),
#     ]
#     REFERENCE_TYPES = [
#         ('sale', 'Sale'),
#         ('purchase', 'Purchase'),
#         ('manual', 'Manual'),
#         ('order', 'Order'),
#         ('invoice', 'Invoice'),
#     ]

#     branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
#     variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
#     movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
#     quantity = models.IntegerField()
#     unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     reference_number = models.CharField(max_length=100, blank=True)
#     reference_type = models.CharField(max_length=20, choices=REFERENCE_TYPES)
#     notes = models.TextField(blank=True)
#     created_by = models.ForeignKey(User, on_delete=models.CASCADE)
#     movement_date = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         indexes = [
#             models.Index(fields=['branch', 'variant', 'movement_date']),
#             models.Index(fields=['reference_number', 'reference_type']),
#         ]

#     def clean(self):
#         if self.movement_type in ['out', 'damage', 'transfer_out']:
#             stock = Stock.objects.filter(branch=self.branch, variant=self.variant).first()
#             if stock and self.quantity > stock.available_quantity:
#                 raise ValidationError(f"Insufficient stock. Available: {stock.available_quantity}")

#     @transaction.atomic
#     def save(self, *args, **kwargs):
#         is_new = self._state.adding
#         if is_new:
#             self.full_clean()
        
#         super().save(*args, **kwargs)
        
#         if is_new:
#             self.apply_stock_change()

#     def apply_stock_change(self):
#         """تطبيق التغيير على المخزون"""
#         stock, created = Stock.objects.select_for_update().get_or_create(
#             branch=self.branch,
#             variant=self.variant,
#             defaults={
#                 'stock_quantity': 0,
#                 'quantity_reserved': 0,
#                 'average_cost': self.unit_cost or self.variant.cost_price,
#                 'last_cost': self.unit_cost or self.variant.cost_price,
#             }
#         )

#         if self.movement_type == 'in':
#             stock.stock_quantity += self.quantity
#             if self.unit_cost > 0:
#                 stock.update_average_cost(self.quantity, self.unit_cost)
#         elif self.movement_type in ['out', 'damage', 'transfer_out']:
#             stock.stock_quantity = max(stock.stock_quantity - self.quantity, 0)
#         elif self.movement_type in ['return', 'transfer_in']:
#             stock.stock_quantity += self.quantity
#         elif self.movement_type == 'adjustment':
#             stock.stock_quantity = self.quantity
#         elif self.movement_type == 'reserve':
#             stock.reserve_stock(self.quantity)
#         elif self.movement_type == 'release':
#             stock.release_reservation(self.quantity)

#         stock.save()



class Stocks(BaseModel):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    # Stock quantities
    quantity_in_stock = models.PositiveIntegerField(default=0)
    reserved_quantity = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=5)
    max_stock_level = models.PositiveIntegerField(default=100)
    min_stock_level = models.PositiveIntegerField(default=0)
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # Stock tracking
    last_restocked = models.DateTimeField(null=True, blank=True)
    last_sale = models.DateTimeField(null=True, blank=True)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    allow_backorder = models.BooleanField(default=False)

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
            return "Out of Stock"
        elif self.available_quantity <= self.reorder_level:
            return "Low Stock"
        elif self.quantity_in_stock > self.max_stock_level:
            return "Overstocked"
        return "In Stock"

    def update_quantity(self, delta, is_sale=False, cost_per_unit=None):
        """Generic quantity updater (used by restock/sale/adjustment/etc.)"""
        self.quantity_in_stock = F('quantity_in_stock') + delta
        if cost_per_unit is not None:
            self.cost_per_unit = cost_per_unit
        if is_sale:
            self.last_sale = timezone.now()
        else:
            self.last_restocked = timezone.now()
        self.save()

    def reserve(self, quantity):
        if self.available_quantity >= quantity or self.allow_backorder:
            self.reserved_quantity = F('reserved_quantity') + quantity
            self.save(update_fields=['reserved_quantity'])
            return True
        return False

    def release_reserve(self, quantity):
        self.reserved_quantity = max(0, self.reserved_quantity - quantity)
        self.save(update_fields=['reserved_quantity'])
    
    def update_average_cost(self, new_quantity, new_cost):
        """تحديث التكلفة المتوسطة"""
        if self.quantity_in_stock > 0:
            total_cost = (self.quantity_in_stock * self.average_cost) + (new_quantity * new_cost)
            total_quantity = self.quantity_in_stock + new_quantity
            self.average_cost = total_cost / total_quantity if total_quantity > 0 else new_cost
        else:
            self.average_cost = new_cost
        self.last_cost = new_cost
    


class StockMovements(BaseModel):
    """Track all stock movements for audit purposes"""
    class MovementType(models.TextChoices):
        PURCHASE = 'purchase', 'Purchase/Restock'
        SALE = 'sale', 'Sale'
        TRANSFER_IN = 'transfer_in', 'Transfer In'
        TRANSFER_OUT = 'transfer_out', 'Transfer Out'
        ADJUSTMENT = 'adjustment', 'Stock Adjustment'
        DAMAGE = 'damage', 'Damage/Loss'
        RETURN = 'return', 'Customer Return'
        RESERVE = 'reserve', 'Reserve Stock'
        RELEASE = 'release', 'Release Reserved'
    
    stocks = models.ForeignKey(Stocks, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity = models.IntegerField()
    quantity_before = models.PositiveIntegerField()
    quantity_after = models.PositiveIntegerField()
    reference_number = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    movement_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['stocks', '-created_at']),
            models.Index(fields=['movement_type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.inventory} - {self.movement_type} ({self.quantity})"



class StockTransfer(BaseModel):
    """Stock transfers between branches"""
    
    class Status(models.TextChoices):
        
        PENDING = 'pending', 'Pending'
        IN_TRANSIT = 'in_transit', 'In Transit'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        
    
    from_branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='outgoing_transfers')
    to_branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='incoming_transfers')
    transfer_number = models.CharField(max_length=50, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
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
    

    def execute_shipment(self):
        """ينفذ عملية الشحن (يخصم الكميات من الفرع المرسل)"""
        if self.status != 'submitted':
            raise ValueError("Only submitted transfers can be shipped.")

        with transaction.atomic():
            for item in self.items.select_for_update():
                # خصم من الفرع المرسل
                from_inventory = Inventory.objects.select_for_update().get(
                    branch=self.from_branch,
                    variant=item.variant
                )
                if from_inventory.quantity_in_stock < item.quantity_requested:
                    raise ValueError(f"Insufficient stock for variant {item.variant}")

                from_inventory.quantity_in_stock -= item.quantity_requested
                from_inventory.save()

                item.quantity_sent = item.quantity_requested
                item.save()

                # سجل الحركة
                StockMovements.objects.create(
                    inventory=from_inventory,
                    movement_type='transfer_out',
                    quantity=-item.quantity_requested,
                    quantity_before=from_inventory.quantity_in_stock + item.quantity_requested,
                    quantity_after=from_inventory.quantity_in_stock,
                    notes=f"Transfer {self.transfer_number}"
                )

            self.status = 'shipped'
            self.shipped_date = timezone.now()
            self.save()

    def execute_receiving(self):
        """ينفذ عملية الاستلام (يضيف الكميات للفرع المستلم)"""
        if self.status != 'shipped':
            raise ValueError("Only shipped transfers can be received.")

        with transaction.atomic():
            for item in self.items.select_for_update():
                to_inventory, _ = Inventory.objects.select_for_update().get_or_create(
                    branch=self.to_branch,
                    variant=item.variant,
                    defaults={'quantity_in_stock': 0}
                )
                to_inventory.quantity_in_stock += item.quantity_sent
                to_inventory.save()

                item.quantity_received = item.quantity_sent
                item.save()

                StockMovements.objects.create(
                    inventory=to_inventory,
                    movement_type='transfer_in',
                    quantity=item.quantity_sent,
                    quantity_before=to_inventory.quantity_in_stock - item.quantity_sent,
                    quantity_after=to_inventory.quantity_in_stock,
                    notes=f"Transfer {self.transfer_number}"
                )

            self.status = 'received'
            self.received_date = timezone.now()
            self.save()


class StockTransferItem(BaseModel):
    transfer = models.ForeignKey(StockTransfer, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity_requested = models.PositiveIntegerField()
    quantity_sent = models.PositiveIntegerField(default=0)
    quantity_received = models.PositiveIntegerField(default=0)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.variant} x {self.quantity_requested}"
