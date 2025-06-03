from django.db import models
from django.contrib.auth.models import User
from users.models import Branch
from .base import BaseModel
from .product import ProductVariant


class Stock(BaseModel):
    """Stock of products"""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    variant = models.OneToOneField(ProductVariant, on_delete=models.CASCADE, related_name='stock')
    quantity_reserved = models.IntegerField(default=0)
    stock_quantity = models.IntegerField(default=0)
    minimum_stock_level = models.IntegerField(default=2)
    max_stock_level = models.IntegerField(default=100)
    # Cost tracking
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        unique_together = ('branch', 'variant')  # Ensure one stock record per branch+variant

    @property
    def available_quantity(self):
        return self.stock_quantity - self.quantity_reserved
    
    @property
    def needs_reorder(self):
        return self.available_quantity <= self.minimum_stock_level

class StockMovement(BaseModel):
    """Stock movements"""
    MOVEMENT_TYPES = [
        ('in', 'in'),
        ('out', 'out'),
        ('adjustment', 'adjustment'),
        ('transfer', 'transfer'),
        ('return', 'Return'),
        ('damage', 'Damage'),
    ]
    ReferenceType = [
        ('sale', 'Sale'),
        ('purchase', 'Purchase'),
        ('manual', 'Manual'),
    ]
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    variant_id = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()

    reference_number = models.CharField(max_length=100, blank=True)  # رقم الفاتورة أو الطلب
    reference_type = models.CharField(max_length=20, choices=ReferenceType)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    movement_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.variant.product.name} - {self.movement_type} - {self.quantity}"

