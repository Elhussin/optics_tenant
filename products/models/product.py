from core.models import BaseModel
from .suppliers import Supplier, Manufacturer, Brand
from .attributes import AttributeValue
from django.db import models
import hashlib
from django.core.exceptions import ValidationError
from scripts.lens_power import spherical_lens_powers ,cylinder_lens_powers,additional_lens_powers
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from CRM.models import Customer
from branches.models import Branch
from django.urls import reverse
from products.services.generate_sku_code import generate_sku_code
class Category(BaseModel):
    """Category for glasses"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        indexes = [
            models.Index(fields=['name', 'is_active']),
        ]
    
    def __str__(self):
        return self.name

class LensCoating(BaseModel):
    """Lens coating for glasses"""
    name = models.CharField(max_length=100,unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Lens Coatings"
        indexes = [
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name



class Product(BaseModel):
    """Product for glasses"""
    PRODUCT_TYPE_CHOICES = [
        ('CL', 'Contact Lenses'),
        ('SL', 'Spectacle Lenses'),
        ('SG', 'Sunglasses'),
        ('EW', 'Eyewear'),
        ('AX', 'Accessories'),
        ('OT', 'Other'),
        ('DV', 'Devices')
    ]

    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    # Basic information

    model = models.CharField(max_length=50)
    type = models.CharField(max_length=50, choices=PRODUCT_TYPE_CHOICES)
    name = models.CharField(max_length=200,blank=True,null=True)


    # Product description
    description = models.TextField(blank=True)
    # Main image
    main_image = models.ImageField(upload_to='products/', blank=True, null=True)

    class Meta:
        unique_together = ('type','brand', 'model')
    def __str__(self):
        return f"{self.brand.name} {self.model}"
    def get_absolute_url(self):
        return reverse('products:product_detail', args=[str(self.pk)])

class ProductVariant(BaseModel):

    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    
    # SKU International
    sku = models.CharField(max_length=50, unique=True,help_text="SKU (Stock Keeping Unit)") 
    
    usku = models.CharField(max_length=64, unique=True, editable=False, help_text="Unique USKU")
    # Frame specifications 
    frame_shape = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_frame_shape',blank=True,null=True, limit_choices_to={'attribute__name': 'Shape'})
    frame_material = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_frame_material',blank=True,null=True, limit_choices_to={'attribute__name': 'Material'})
    frame_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_color',blank=True,null=True, limit_choices_to={'attribute__name': 'Color'})
    temple_length = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_temple_length',blank=True,null=True, limit_choices_to={'attribute__name': 'Length'})
    bridge_width = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_bridge_width',blank=True,null=True, limit_choices_to={'attribute__name': 'Width'})

    # specifications for lenses and frames
    lens_diameter = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_diameter',blank=True,null=True, limit_choices_to={'attribute__name': 'Diameter'})
    lens_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_color',blank=True,null=True, limit_choices_to={'attribute__name': 'Color'})
    lens_material = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_material',blank=True,null=True, limit_choices_to={'attribute__name': 'Material'})
    lens_base_curve = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_base_curve',blank=True,null=True, limit_choices_to={'attribute__name': 'Base Curve'})
   
    # specifications for contact lenses
    lens_water_content = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_water_content',blank=True,null=True, limit_choices_to={'attribute__name': 'Water Content'})
    replacement_schedule = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_replacement_schedule',blank=True,null=True, limit_choices_to={'attribute__name': 'Replacement Schedule'})
    expiration_date = models.DateField(blank=True,null=True)

    # specifications for lenses 
    lens_coatings = models.ManyToManyField(
        'LensCoating',
        related_name='%(class)s_lens_coatings',
        blank=True,
    )
    lens_type = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_type',blank=True,null=True, limit_choices_to={'attribute__name': 'Lens Type'})
    spherical = models.CharField(max_length=20, choices=spherical_lens_powers,blank=True,null=True)
    cylinder = models.CharField(max_length=20, choices=cylinder_lens_powers,blank=True,null=True)
    axis = models.IntegerField(default=0,blank=True,null=True, validators=[MinValueValidator(0), MaxValueValidator(180)])
    addition = models.CharField(max_length=20, choices=additional_lens_powers,blank=True,null=True)
    unit = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_unit',blank=True,null=True, limit_choices_to={'attribute__name': 'Unit'},help_text="Unit of measurement box piesces")
  
    # Extra information
    warranty = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_warranty',blank=True,null=True, limit_choices_to={'attribute__name': 'Warranty'})
    weight = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_weight',blank=True,null=True, limit_choices_to={'attribute__name': 'Weight'})  
    dimensions = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_dimensions',blank=True,null=True, limit_choices_to={'attribute__name': 'Dimensions'})

    # Pricing
    last_purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=10, decimal_places=2, default=0)



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
        coatings = self.lens_coatings.order_by('id').values_list('id', flat=True)
        coating_str = ','.join(map(str, coatings)) if coatings.exists() else ''
        return [
            coating_str,
            str(self.lens_diameter.id if self.lens_diameter else ''),
            str(self.lens_color.id if self.lens_color else ''),
            str(self.lens_material.id if self.lens_material else ''),
            str(self.lens_base_curve.id if self.lens_base_curve else ''),
            str(self.lens_type or ''),
            str(self.spherical or ''),
            str(self.cylinder or ''),
            str(self.axis or ''),
            str(self.replacement_schedule or ''),
            str(self.addition or ''),
        ]

    def clean(self):
        """Ensure the unique_USKU not already used by another variant."""
        self.usku = generate_sku_code(self)
        exists = ProductVariant.objects.filter(usku=self.usku)

        if self.pk:
            exists = exists.exclude(pk=self.pk)

        if exists.exists():
            raise ValidationError("Variant with identical specifications already exists.")

    def save(self, *args, **kwargs):
        self.full_clean()  # <-- This calls clean() and validates before saving
        super().save(*args, **kwargs)


    @property
    def discount_price(self):
        """Calculate discounted price"""
        if self.discount_percentage > 0:
            discount_amount = self.selling_price * (self.discount_percentage / 100)
            return self.selling_price - discount_amount
        return None

    class Meta:
        indexes = [
            models.Index(fields=['usku']),
            models.Index(fields=['product_id'])
        ]
        constraints = [
            models.UniqueConstraint(fields=['usku'], name='unique_variant_by_hash')
                            ]
        verbose_name = "Product Variant"
        verbose_name_plural = "Product Variants"

    def get_price_for(self, customer=None, branch=None, quantity=1, date=None):
        today = date or timezone.now().date()
        rules = self.price_rules.all()

        for rule in rules:
            if rule.is_valid(customer=customer, branch=branch, quantity=quantity, date=today):
                return rule.special_price

        return self.discount_price or self.selling_price

class ProductImage(models.Model):
    """Additional product images"""
    variant = models.ForeignKey(ProductVariant, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/', unique=True)
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    class Meta:
        ordering = ['order','id']
        indexes = [
            models.Index(fields=['order']),
        ]
    def __str__(self):
        return f"{self.variant.product.name} - {self.variant.color}"


class FlexiblePrice(models.Model):
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='price_rules')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    customer_group = models.ForeignKey('CRM.CustomerGroup', on_delete=models.SET_NULL, null=True, blank=True)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)

    # السعر الخاص
    special_price = models.DecimalField(max_digits=10, decimal_places=2)

    # صلاحية السعر
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    # شروط إضافية (مثل الكمية أو الوحدة)
    min_quantity = models.PositiveIntegerField(default=1)
    currency = models.CharField(max_length=10, default="SAR")
    
    # ترتيب الأولوية (لتحديد أي سعر يستخدم عند وجود أكثر من خيار)
    priority = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-priority', 'start_date']

    def is_valid(self, customer=None, branch=None, quantity=1, date=None):
        """تحقق من صلاحية هذا السعر لعميل معين"""
        date = date or timezone.now().date()
        if self.start_date and self.start_date > date:
            return False
        if self.end_date and self.end_date < date:
            return False
        if self.min_quantity > quantity:
            return False
        if self.customer and self.customer != customer:
            return False
        if self.branch and self.branch != branch:
            return False
        return True

