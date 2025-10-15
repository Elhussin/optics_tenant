from core.models import BaseModel
from .suppliers import Supplier, Manufacturer, Brand
from .attributes import AttributeValue
from django.db import models
import hashlib
from django.core.exceptions import ValidationError
from apps.products.utils.index import spherical_lens_powers ,cylinder_lens_powers,additional_lens_powers
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.crm.models import Customer
from apps.branches.models import Branch
from django.urls import reverse
from apps.products.utils.generate_product_sku_code import generate_sku_code

class Category(BaseModel):
    """Category for glasses"""
    name = models.CharField(max_length=100 ,unique=True)
    description = models.TextField(blank=True)
    parent_id = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        indexes = [
            models.Index(fields=['name', 'is_active']),
        ]
    unique_together = ('name', 'parent_id')
    
    def __str__(self):
        return self.name

PRODUCT_TYPE_CHOICES = [
    ('CL', 'Contact Lenses'),
    ('SL', 'Spectacle Lenses'),
    ('FR', 'Frames'),
    ('AX', 'Accessories'),
    ('OT', 'Other'),
    ('DV', 'Devices')
]
VARIANT_TYPE_CHOICES = [
    ('basic', 'Basic'),
    ('frames', 'Frames'),
    ('stockLenses', 'Stock Lenses'),
    ('rxLenses', 'Rx Lenses'),
    ('contactLenses', 'Contact Lenses'),
    ('custom', 'Custom')
]





class Product(BaseModel):

    """Product for glasses"""
    category = models.ForeignKey("Category", on_delete=models.CASCADE)
    supplier = models.ForeignKey("Supplier", on_delete=models.CASCADE)
    manufacturer = models.ForeignKey("Manufacturer", on_delete=models.CASCADE)
    brand = models.ForeignKey("Brand", on_delete=models.CASCADE)
    model = models.CharField(max_length=50)
    type = models.CharField(max_length=50, choices=PRODUCT_TYPE_CHOICES)
    name = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, editable=False)
    usku = models.CharField(max_length=64, unique=True, editable=False, help_text="Unique product SKU generated automatically")
    variant_type = models.CharField(max_length=20, choices=VARIANT_TYPE_CHOICES, default='basic')

    class Meta:
        unique_together = ('type', 'brand', 'model', 'name')

    def __str__(self):
        return f"{self.brand.name} {self.model}"

    def save(self, *args, **kwargs):
        fields=['brand.id', 'category.id', 'supplier.id', 'manufacturer.id', 'model']
        if not self.description:
            if self.name:
                self.description = f"{self.type} {self.brand.name} {self.model} {self.name}".upper()
            else:
                self.description = f"{self.type} {self.brand.name} {self.model}".upper()
        
        if not self.name:
            self.name = f"{self.brand.name} {self.model}".title()

        # 🔹 إنشاء كود SKU فريد
        if not self.usku:
            self.usku = generate_sku_code(self, fields=fields,prefix=self.type)
                        # return generate_sku_code(self, fields=fields,prefix=prefix)
        super().save(*args, **kwargs)
    


class ProductVariant(BaseModel):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    usku = models.CharField(max_length=64, unique=True, editable=False)
    product_type = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_product_type', limit_choices_to={'attribute_id__name': 'Product Type'})
    warranty = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_warranty',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Warranty'})
    weight = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_weight',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Weight'})  
    dimensions = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_dimensions',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Dimensions'})
    last_purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)

    BaseFrameFields = ['frame_color', 'temple_length', 'bridge_width', 'frame_shape', 'frame_material']
    BaseLensFields = ['lens_diameter', 'lens_color', 'lens_material', 'lens_coatings']
    BaseStokLensFields = ['spherical', 'cylinder']
    BaseRxLensFields = ['lens_base_curve', 'addition']
    BaseContactLensFields = ['lens_water_content', 'replacement_schedule', 'units', 'axis']
    BaseExtraVariantFields = ['variant_type', 'variant_id', 'attribute', 'value']

    def clean(self):
        if not self.usku:
            self.usku = self.build_sku()

        # تحقق من التكرار
        exists = self.__class__.objects.filter(usku=self.usku)
        if self.pk:
            exists = exists.exclude(pk=self.pk)
        if exists.exists():
            raise ValidationError("Variant with identical specifications already exists.")
    
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

    def save(self, *args, **kwargs):
        self.full_clean()  # <-- This calls clean() and validates before saving
        # self.clean()
        super().save(*args, **kwargs)

    def build_sku(self):
            """تجهيز الحقول المناسبة حسب نوع المنتج"""
            fields = ['product.id', 'product_type.id']
            prefix = "BS"

            if isinstance(self, FrameVariant):
                prefix = "FR"
                fields.extend(self.BaseFrameFields)
            elif isinstance(self, ContactLensVariant):
                prefix = "CL"
                fields.extend(self.BaseLensFields)
                fields.extend(self.BaseStokLensFields)
                fields.extend(self.BaseContactLensFields)
            elif isinstance(self, RxLensVariant):
                prefix = "RX"
                fields.extend(self.BaseLensFields)
                fields.extend(self.BaseRxLensFields)
            elif isinstance(self, StokLensVariant):
                prefix = "ST"
                fields.extend(self.BaseLensFields)
                fields.extend(self.BaseStokLensFields)
            elif isinstance(self, ExtraVariantAttribute):
                prefix = "EX"
                fields.extend(self.BaseExtraVariantFields)

            return generate_sku_code(self, fields=fields,prefix=prefix)


class BaseLens(models.Model):
    lens_diameter = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_diameter', limit_choices_to={'attribute_id__name': 'Diameter'})
    lens_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_color',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Color'})
    lens_material = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_material',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Material'})
    lens_coatings = models.ManyToManyField( AttributeValue, related_name='%(class)s_lens_coatings', blank=True,  limit_choices_to={'attribute_id__name': 'Coatings'})
    class Meta:
        abstract = True


class FrameVariant(ProductVariant):
    frame_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_color', limit_choices_to={'attribute_id__name': 'Color'})
    lens_diameter = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_diameter', limit_choices_to={'attribute_id__name': 'Diameter'})
    temple_length = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_temple_length',limit_choices_to={'attribute_id__name': 'Length'})
    bridge_width = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_bridge_width', limit_choices_to={'attribute_id__name': 'Width'})
    frame_shape = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_frame_shape',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Shape'})
    frame_material = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_frame_material',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Material'})
    lens_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_color',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Color'})

    

class StokLensVariant(ProductVariant,BaseLens):
    spherical = models.CharField(max_length=20, choices=spherical_lens_powers)
    cylinder = models.CharField(max_length=20, choices=cylinder_lens_powers,blank=True,null=True, default=None)

 
class RxLensVariant(ProductVariant,BaseLens):
    lens_base_curve = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_base_curve',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Base Curve'})
    addition = models.CharField(max_length=20, choices=additional_lens_powers,blank=True,null=True, default=None)


class ContactLensVariant(ProductVariant,BaseLens):
    lens_water_content = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_water_content',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Water Content'})
    replacement_schedule = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_replacement_schedule',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Replacement Schedule'})
    units = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_unit',blank=True,null=True, default=None, limit_choices_to={'attribute_id__name': 'Unit'},help_text="Unit of measurement box piesces")
    spherical = models.CharField(max_length=20, choices=spherical_lens_powers,blank=True,null=True, default=None)
    cylinder = models.CharField(max_length=20, choices=cylinder_lens_powers,blank=True,null=True, default=None)
    axis = models.CharField(max_length=20,blank=True,null=True, default=None)
    addition = models.CharField(max_length=20, choices=additional_lens_powers,blank=True,null=True, default=None)
    lens_base_curve = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_base_curve',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Base Curve'})


class ContactLensVariantExpirationDate(models.Model):
    contact_lens_variant = models.ForeignKey(ContactLensVariant, on_delete=models.CASCADE)
    expiration_date = models.DateField()
    unique_together = ("contact_lens_variant", "expiration_date")
    class Meta:
        verbose_name = "Contact Lens Variant Expiration Date"
        verbose_name_plural = "Contact Lens Variant Expiration Dates"

class ExtraVariantAttribute(BaseModel):
    # variant_type = models.CharField(max_length=50)  
    variant_type = models.ForeignKey("Attributes", related_name='extravariantattribute_set', on_delete=models.CASCADE)
    variant = models.ForeignKey("ProductVariant", related_name='productvariant_set', on_delete=models.CASCADE)
    attribute = models.ForeignKey("Attributes", related_name='attribute_set', on_delete=models.CASCADE)
    value = models.ForeignKey("AttributeValue", related_name='attributevalue_set', on_delete=models.CASCADE)
    class Meta:
        unique_together = ("variant_type", "variant_id", "attribute", "value")



class ProductImage(models.Model):
    """Additional product images"""
    variant_id = models.ForeignKey("ProductVariant", related_name='images', on_delete=models.CASCADE)
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


class FlexiblePrice(BaseModel):
    variant_id = models.ForeignKey("ProductVariant", on_delete=models.CASCADE, related_name='price_rules')
    customer_id = models.ForeignKey("crm.Customer", on_delete=models.SET_NULL, null=True, blank=True)
    customer_group_id = models.ForeignKey("crm.CustomerGroup", on_delete=models.SET_NULL, null=True, blank=True)
    branch_id = models.ForeignKey("branches.Branch", on_delete=models.SET_NULL, null=True, blank=True)

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





# class ProductVariant(BaseModel):

#     product_id = models.ForeignKey("Product", related_name='variants', on_delete=models.CASCADE)
    
#     # SKU International
#     sku = models.CharField(max_length=50, null=True, blank=True, unique=True,help_text="SKU (Stock Keeping Unit)") 
    
#     usku = models.CharField(max_length=64, unique=True, editable=False, help_text="Unique USKU")
#     # Frame specifications 
#     frame_shape_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_frame_shape',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Shape'})
#     frame_material_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_frame_material',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Material'})
#     frame_color_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_color',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Color'})
#     temple_length_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_temple_length',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Length'})
#     bridge_width_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_bridge_width',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Width'})

#     # specifications for lenses and frames
#     lens_diameter_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_diameter',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Diameter'})
#     lens_color_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_color',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Color'})
#     lens_material_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_material',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Material'})
#     lens_base_curve_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_base_curve',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Base Curve'})
#     lens_coatings_id = models.ManyToManyField( AttributeValue, related_name='%(class)s_lens_coatings', blank=True,  limit_choices_to={'attribute_id__name': 'Coatings'})

#     # specifications for contact lenses
#     lens_water_content_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_water_content',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Water Content'})
#     replacement_schedule_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_replacement_schedule',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Replacement Schedule'})
#     expiration_date = models.DateField(blank=True,null=True)

#     product_type_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_product_type',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Product Type'})
#     spherical = models.CharField(max_length=20, choices=spherical_lens_powers,blank=True,null=True, default=None)
#     cylinder = models.CharField(max_length=20, choices=cylinder_lens_powers,blank=True,null=True, default=None)
#     axis = models.IntegerField(blank=True,null=True, validators=[MinValueValidator(0), MaxValueValidator(180)], default=None)
#     addition = models.CharField(max_length=20, choices=additional_lens_powers,blank=True,null=True, default=None)
    
#     unit_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_unit',blank=True,null=True, default=None, limit_choices_to={'attribute_id__name': 'Unit'},help_text="Unit of measurement box piesces")
  
#     # Extra information
#     warranty_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_warranty',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Warranty'})
#     weight_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_weight',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Weight'})  
#     dimensions_id = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_dimensions',blank=True,null=True, limit_choices_to={'attribute_id__name': 'Dimensions'})

#     # Pricing
#     last_purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     selling_price = models.DecimalField(max_digits=10, decimal_places=2)
#     discount_percentage = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)



#     def _eyewear_fields(self):
#         return [
#             str(self.frame_color_id.id if self.frame_color_id else ''),
#             str(self.temple_length_id.id if self.temple_length_id else ''),
#             str(self.bridge_width_id.id if self.bridge_width_id else ''),
#             str(self.lens_diameter_id.id if self.lens_diameter_id else ''),
#             str(self.lens_color_id.id if self.lens_color_id else ''),
#             str(self.lens_material_id.id if self.lens_material_id else ''),
#         ]

#     def _lenses_fields(self):
#         coatings = self.lens_coatings_id.order_by('id').values_list('id', flat=True)
#         coating_str = ','.join(map(str, coatings)) if coatings.exists() else ''
#         return [
#             coating_str,
#             str(self.lens_diameter_id.id if self.lens_diameter_id else ''),
#             str(self.lens_color_id.id if self.lens_color_id else ''),
#             str(self.lens_material_id.id if self.lens_material_id else ''),
#             str(self.lens_base_curve_id.id if self.lens_base_curve_id else ''),
#             str(self.lens_type_id.id if self.lens_type_id else ''),
#             str(self.spherical or ''),
#             str(self.cylinder or ''),
#             str(self.axis or ''),
#             str(self.replacement_schedule_id.id if self.replacement_schedule_id else ''),
#             str(self.addition or ''),
#         ]

#     def clean(self):
#         """Ensure the unique_USKU not already used by another variant."""
#         self.usku = generate_sku_code(self)
#         exists = ProductVariant.objects.filter(usku=self.usku)

#         if self.pk:
#             exists = exists.exclude(pk=self.pk)

#         if exists.exists():
#             raise ValidationError("Variant with identical specifications already exists.")

#     def save(self, *args, **kwargs):
#         self.full_clean()  # <-- This calls clean() and validates before saving
#         super().save(*args, **kwargs)


#     @property
#     def discount_price(self):
#         """Calculate discounted price"""
#         if self.discount_percentage > 0:
#             discount_amount = self.selling_price * (self.discount_percentage / 100)
#             return self.selling_price - discount_amount
#         return None

#     class Meta:
#         indexes = [
#             models.Index(fields=['usku']),
#             models.Index(fields=['product_id'])
#         ]
#         constraints = [
#             models.UniqueConstraint(fields=['usku'], name='unique_variant_by_hash')
#                             ]
#         verbose_name = "Product Variant"
#         verbose_name_plural = "Product Variants"

#     def get_price_for(self, customer=None, branch=None, quantity=1, date=None):
#         today = date or timezone.now().date()
#         rules = self.price_rules.all()

#         for rule in rules:
#             if rule.is_valid(customer=customer, branch=branch, quantity=quantity, date=today):
#                 return rule.special_price

#         return self.discount_price or self.selling_price
