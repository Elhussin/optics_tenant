from core.models import BaseModel
from .suppliers import Supplier, Manufacturer, Brand
from .attributes import AttributeValue
from django.db import models
import hashlib

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
        unique_together = ('name', 'brand', 'model')
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
        ('single_vision', 'Single Vision'),
        ('bifocal', 'Bifocal'),
        (' trifocal', 'Trifocal'),
        ('progressive', 'Progressive'),
    ]
    """Different shapes of the product (different colors for example)"""
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    sku = models.CharField(max_length=50, unique=True ,editable=False)
    sku = models.CharField(max_length=50, unique=True, editable=False)

    # Frame specifications 
    frame_shape = models.CharField(max_length=20, choices=FRAME_SHAPES)
    frame_material = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='frame_material')
    frame_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='frame_color')
    temple_length = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='temple_length')
    bridge_width = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='bridge_width')
    
    # specifications for lenses and frames
    lens_diameter = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='lens_diameter')
    lens_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='lens_color')
    lens_material = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='lens_material')
    lens_base_curve = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='lens_base_curve')
    # specifications for lenses 
    lens_type = models.CharField(max_length=20, choices=LENS_TYPES)
    lens_power_spherical = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lens_power_cylinder = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # specifications for lenses and contact lenses
    lens_axis = models.IntegerField(default=0)
    lens_addition = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lens_coating = models.JSONField(default=dict)

    # specifications for contact lenses
    lens_water_content = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    replacement_schedule  = models.CharField(max_length=20, choices=REPLACEMENT_SCHEDULE)
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

    # Images
    def __str__(self):
        return f"{self.product.name}"
    @property
    def current_price(self):
        """Current price (with discount if applicable)"""
        return self.discount_price if self.discount_price else self.selling_price
    
    @property
    def profit_margin(self):
        """Profit margin"""
        return ((self.current_price - self.cost_price) / self.cost_price) * 100
    def generate_unique_hash(self):
            fields = [str(self.product.id)]

            # بناء القيم التي تحدد التفرد بناءً على نوع المنتج
            if self.product.type == 'eyewear' or self.product.type == 'sunglasses':
                fields += [
                    str(self.product.id),
                    str(self.frame_color.id),
                    str(self.temple_length.id),
                    str(self.bridge_width.id),
                    str(self.lens_diameter.id),
                    str(self.lens_color.id),
                ]
            elif self.product.type == 'contact_lenses':
                fields += [
                    str(self.lens_base_curve.id),
                    str(self.lens_water_content),
                    str(self.replacement_schedule),
                ]
            elif self.product.type == 'accessories':
                fields += [
                    str(self.lens_color.id),
                    str(self.frame_shape),
                ]
            elif self.product.type == 'devices' or self.product.type == 'other':
                fields += [
                    str(self.lens_type),
                    str(self.lens_power_spherical),
                    str(self.lens_power_cylinder),
                    str(self.lens_axis),
                    str(self.lens_addition),
                ]
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
