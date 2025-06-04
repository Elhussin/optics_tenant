from core.models import BaseModel
from .suppliers import Supplier, Manufacturer, Brand
from .attributes import AttributeValue
from django.db import models
import hashlib
import json
from scripts.lens_power import spherical_lens_powers ,cylinder_lens_powers,additional_lens_powers
class Category(BaseModel):
    """Category for glasses"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class Product(BaseModel):
    """Product for glasses"""
    PRODUCT_TYPE_CHOICES = [
        ('contact_lenses', 'Contact Lenses'),
        ('spectacle_lenses', 'Spectacle Lenses'),
        ('sunglasses', 'Sunglasses'),
        ('eyewear', 'Eyewear'),
        ('accessories', 'Accessories'),
        ('other', 'Other'),
        ('devices', 'Devices')
    ]

    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE)
    # Basic information
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=50, choices=PRODUCT_TYPE_CHOICES)

    model = models.CharField(max_length=50)
    # Product description
    description = models.TextField(blank=True)
    # Main image
    main_image = models.ImageField(upload_to='products/', blank=True, null=True)

    class Meta:
        unique_together = ('name', 'brand', 'model','type')
    def __str__(self):
        return f"{self.brand.name} {self.name}"
    


class ProductVariant(BaseModel):
        
    FRAME_SHAPES = [
        ('round', 'Round'),
        ('square', 'Square'),
        ('rectangular', 'Rectangular'),
        ('aviator', 'Aviator'),
        ('cat_eye', 'Cat Eye'),
        ('oval', 'Oval')
    ]
    REPLACEMENT_SCHEDULE = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('two_weeks', 'Two Weeks'),
        ('monthly', 'Monthly'),
        ('three_months', 'Three Months'),
        ('six_months', 'Six Months'),
        ('yearly', 'Yearly')
    ]
    LENS_TYPES = [
        ('SV_Stock', 'SV Stock'),
        ('SV_Rx', 'SV Rx'),
        ('Bifocal', 'Bifocal'),
        ('Progressive', 'Progressive'),
        ('Digital', 'Digital'),
    ]

    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    sku = models.CharField(max_length=50, unique=True, editable=False)

    # Frame specifications 
    frame_shape = models.CharField(max_length=20, choices=FRAME_SHAPES)
    frame_material = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='variants_as_frame_material')
    frame_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='variants_as_frame_color')
    temple_length = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='variants_as_temple_length')
    bridge_width = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='variants_as_bridge_width')

    # specifications for lenses and frames
    lens_diameter = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='variants_as_lens_diameter')
    lens_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='variants_as_lens_color')
    lens_material = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='variants_as_lens_material')
    lens_base_curve = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='variants_as_lens_base_curve')

    # specifications for lenses 
    lens_type = models.CharField(max_length=20, choices=LENS_TYPES)
    lens_power_spherical = models.CharField(max_length=20, choices=spherical_lens_powers)
    lens_power_cylinder = models.CharField(max_length=20, choices=cylinder_lens_powers)
    lens_axis = models.IntegerField(default=0)
    lens_power_addition = models.CharField(max_length=20, choices=additional_lens_powers)
    lens_coating = models.JSONField(default=dict)

    # specifications for contact lenses
    lens_water_content = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    replacement_schedule = models.CharField(max_length=20, choices=REPLACEMENT_SCHEDULE)
    expiration_date = models.DateField()


    # Pricing
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # Extra information
    warranty = models.IntegerField(default=0)
    weight = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    dimensions = models.CharField(max_length=100, default='0x0x0')
    unique_hash = models.CharField(max_length=64, unique=True, editable=False)

    def _eyewear_fields(self):
        return [
            str(self.frame_color.id if self.frame_color else ''),
            str(self.temple_length.id if self.temple_length else ''),
            str(self.bridge_width.id if self.bridge_width else ''),
            str(self.lens_diameter.id if self.lens_diameter else ''),
            str(self.lens_color.id if self.lens_color else ''),
            str(self.lens_material.id if self.lens_material else ''),
        ]

    def _lenses_fields(self):
        coating_str = json.dumps(self.lens_coating, sort_keys=True) if self.lens_coating else ''
        return [
            coating_str,
            str(self.lens_diameter.id if self.lens_diameter else ''),
            str(self.lens_color.id if self.lens_color else ''),
            str(self.lens_material.id if self.lens_material else ''),
            str(self.lens_base_curve.id if self.lens_base_curve else ''),
            str(self.lens_type or ''),
            str(self.lens_power_spherical or ''),
            str(self.lens_power_cylinder or ''),
            str(self.lens_power_axis or ''),
            str(self.replacement_schedule or ''),
            str(self.lens_power_addition or ''),
        ]

    def generate_unique_hash(self):
        fields = [str(self.product.id or '')]

        if self.product.type in ['eyewear', 'sunglasses']:
            fields += self._eyewear_fields()
        elif self.product.type in ['spectacle_lenses', 'contact_lenses']:
            fields += self._lenses_fields()
        elif self.product.type in ['accessories', 'devices', 'other']:
            fields += [str(self.product.type or '')]

        base = "-".join(fields)
        return hashlib.sha256(base.encode()).hexdigest()


    def clean(self):
        """Ensure the unique_hash is not already used by another variant."""
        self.unique_hash = self.generate_unique_hash()
        exists = ProductVariant.objects.filter(unique_hash=self.unique_hash)

        if self.pk:
            exists = exists.exclude(pk=self.pk)

        if exists.exists():
            raise ValidationError("Variant with identical specifications already exists.")

    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = f"SKU-{uuid.uuid4().hex[:8].upper()}"
        self.full_clean()  # <-- This calls clean() and validates before saving
        super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.product.name}"

    @property
    def current_price(self):
        return self.discount_price if self.discount_price else self.selling_price

    @property
    def profit_margin(self):
        return ((self.current_price - self.cost_price) / self.cost_price) * 100 if self.cost_price else 0

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['unique_hash'], name='unique_variant_by_hash')
        ]
        verbose_name = "Product Variant"
        verbose_name_plural = "Product Variants"



class ProductImage(models.Model):
    """Additional product images"""
    variant = models.ForeignKey(ProductVariant, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/', unique=True)
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    def __str__(self):
        return f"{self.variant.product.name} - {self.variant.color}"


