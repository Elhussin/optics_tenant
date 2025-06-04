from django.db import models
from django.contrib.auth.models import User
from users.models import Branch
from core.models import BaseModel
from .product import ProductVariant


class InventoryDocument(BaseModel):
    DOCUMENT_TYPES = [
        ('purchase', 'Purchase Receipt'),
        ('sale', 'Sale Issue'),
        ('adjustment', 'Adjustment'),
        ('transfer', 'Transfer'),
        ('return', 'Return'),
        ('damage', 'Damage'),
    ]

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.document_type} #{self.id}"

class InventoryLineItem(models.Model):
    document = models.ForeignKey(InventoryDocument, related_name="line_items", on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    from_branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='outgoing_items')
    to_branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='incoming_items')

    def __str__(self):
        return f"{self.variant} x {self.quantity}"

class Stock(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    variant = models.OneToOneField(ProductVariant, on_delete=models.CASCADE, related_name='stock')
    quantity_reserved = models.IntegerField(default=0)
    stock_quantity = models.IntegerField(default=0)
    minimum_stock_level = models.IntegerField(default=2)
    max_stock_level = models.IntegerField(default=100)
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        unique_together = ('branch', 'variant')

    @property
    def available_quantity(self):
        return self.stock_quantity - self.quantity_reserved

    @property
    def needs_reorder(self):
        return self.available_quantity <= self.minimum_stock_level


class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('in', 'In'),
        ('out', 'Out'),
        ('adjustment', 'Adjustment'),
        ('transfer_in', 'Transfer In'),
        ('transfer_out', 'Transfer Out'),
        ('return', 'Return'),
        ('damage', 'Damage'),
    ]
    REFERENCE_TYPES = [
        ('sale', 'Sale'),
        ('purchase', 'Purchase'),
        ('manual', 'Manual'),
    ]

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    reference_number = models.CharField(max_length=100, blank=True)
    reference_type = models.CharField(max_length=20, choices=REFERENCE_TYPES)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    movement_date = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.movement_type == 'out':
            stock = Stock.objects.filter(branch=self.branch, variant=self.variant).first()
            if stock and self.quantity > stock.available_quantity:
                raise ValidationError("Insufficient stock for this movement.")

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            self.apply_stock_change()

    def apply_stock_change(self):
        stock, _ = Stock.objects.get_or_create(
            branch=self.branch,
            variant=self.variant,
            defaults={
                'stock_quantity': 0,
                'quantity_reserved': 0,
                'average_cost': self.variant.cost_price,
                'last_cost': self.variant.cost_price,
            }
        )

        if self.movement_type == 'in':
            stock.stock_quantity += self.quantity
            stock.last_cost = self.variant.cost_price
        elif self.movement_type in ['out', 'damage']:
            stock.stock_quantity = max(stock.stock_quantity - self.quantity, 0)
        elif self.movement_type == 'return':
            stock.stock_quantity += self.quantity
        elif self.movement_type == 'adjustment':
            stock.stock_quantity = self.quantity

        stock.save()

# # Example function to handle transfer between branches
# def transfer_variant(variant, from_branch, to_branch, qty, user):
#     with transaction.atomic():
#         StockMovement.objects.create(
#             branch=from_branch,
#             variant=variant,
#             movement_type='transfer',
#             quantity=qty,
#             reference_type='manual',
#             created_by=user,
#             notes=f'Transfer to {to_branch}'
#         )
#         StockMovement.objects.create(
#             branch=to_branch,
#             variant=variant,
#             movement_type='in',
#             quantity=qty,
#             reference_type='manual',
#             created_by=user,
#             notes=f'Transfer from {from_branch}'
#         )

