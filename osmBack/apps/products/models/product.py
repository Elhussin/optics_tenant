from core.models import BaseModel
from .suppliers import Supplier, Manufacturer, Brand
from .attributes import AttributeValue
from django.db import models
import hashlib
from django.core.exceptions import ValidationError
from apps.products.utils.index import spherical_lens_powers, cylinder_lens_powers, additional_lens_powers
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.crm.models import Customer
from apps.branches.models import Branch
from django.urls import reverse
from apps.products.services.generate_sku_code import generate_sku_code
# import logging
# Import centralized choices from constants module
from apps.products.constants import (
    PRODUCT_TYPE_CHOICES,
    VARIANT_TYPE_CHOICES,
    RIGHT_LEFT_CHOICES,
)

# product_logger = logging.getLogger('product')

class Category(BaseModel):
    """Category for glasses"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        indexes = [
            models.Index(fields=['name', 'is_active']),
        ]
    unique_together = ('name', 'parent')

    def __str__(self):
        return self.name

# --- Managers & QuerySets ---


class ProductQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)

    def by_type(self, product_type):
        return self.filter(type=product_type)

    def with_variants(self):
        return self.prefetch_related('variants')


class ProductManager(models.Manager):
    def get_queryset(self):
        return ProductQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()

    def by_type(self, product_type):
        return self.get_queryset().by_type(product_type)


class Product(BaseModel):

    """Product for glasses"""
    # category = models.ForeignKey("Category", on_delete=models.CASCADE)
    categories = models.ManyToManyField("Category", related_name="products")
    # supplier = models.ForeignKey("Supplier", on_delete=models.CASCADE)
    # manufacturer = models.ForeignKey("Manufacturer", on_delete=models.CASCADE)
    brand = models.ForeignKey("Brand", on_delete=models.CASCADE)
    model = models.CharField(max_length=50)
    type = models.CharField(max_length=50, choices=PRODUCT_TYPE_CHOICES)
    name = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True, editable=False)
    usku = models.CharField(max_length=64, unique=True, editable=False,
                            help_text="Unique product SKU generated automatically")
    variant_type = models.CharField(
        max_length=20, choices=VARIANT_TYPE_CHOICES, default='basic')

    objects = ProductManager()

    class Meta:
        unique_together = ('type', 'brand', 'model', 'name')

    def __str__(self):
        return f"{self.brand.name} {self.model}"

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = f"{self.brand.name} {self.model}".title()
            self.description = f"{self.type} {self.name}".upper()
        else:
            self.description = f"{self.type} {self.brand.name} {self.model} {self.name}".upper(
            )

        # 🔹 إنشاء كود SKU فريد
        # CHANGED: Use services.generate_sku_code (single source of truth)
        if not self.usku:
            # Product doesn't have complex fields like variant, pass self
            self.usku = generate_sku_code(self)
        super().save(*args, **kwargs)


class ProductVariant(BaseModel):
    product = models.ForeignKey(
        Product, related_name='variants', on_delete=models.CASCADE)
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    usku = models.CharField(max_length=64, unique=True, editable=False)
    description = models.TextField(blank=True, editable=False,
                                   help_text="Auto-generated description based on variant specifications")
    product_type = models.ForeignKey(AttributeValue, on_delete=models.CASCADE,
                                     related_name='%(class)s_product_type', limit_choices_to={'attribute__name': 'Product Type'})
    warranty = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_warranty',
                                 blank=True, null=True, limit_choices_to={'attribute__name': 'Warranty'})
    weight = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_weight',
                               blank=True, null=True, limit_choices_to={'attribute__name': 'Weight'})
    dimensions = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_dimensions',
                                   blank=True, null=True, limit_choices_to={'attribute__name': 'Dimensions'})
    last_purchase_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, null=True, blank=True)

    BaseFrameFields = ['frame_color', 'temple_length',
                       'bridge_width', 'frame_shape', 'frame_material']
    BaseLensFields = ['lens_diameter', 'lens_color',
                      'lens_material', 'lens_coatings']
    BaseStokLensFields = ['spherical', 'cylinder']
    BaseRxLensFields = ['lens_base_curve', 'addition']
    BaseContactLensFields = ['lens_water_content',
                             'replacement_schedule', 'units', 'axis']
    BaseExtraVariantFields = ['variant_type',
                              'variant_id', 'attribute', 'value']

    def clean(self):
        if not self.usku:
            self.usku = self.build_sku()

        # تحقق من التكرار
        exists = self.__class__.objects.filter(usku=self.usku)
        if self.pk:
            exists = exists.exclude(pk=self.pk)
        if exists.exists():
            raise ValidationError(
                "Variant with identical specifications already exists.")

    @property
    def discount_price(self):
        """Calculate discounted price"""
        if self.discount_percentage > 0:
            discount_amount = self.selling_price * \
                (self.discount_percentage / 100)
            return self.selling_price - discount_amount
        return None

    class Meta:
        indexes = [
            models.Index(fields=['usku']),
            models.Index(fields=['product_id'])
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['usku'], name='unique_variant_by_hash')
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

    def _get_safe_attr_name(self, attr):
        """Helper to safely get attribute value name"""
        try:
            if attr and hasattr(attr, 'name'):
                return attr.name
        except:
            pass
        return str(attr) if attr else ''

    def build_description(self):
        """Build human-readable description - to be overridden by subclasses"""
        parts = [self.product.name]

        # Add product type
        if self.product_type:
            parts.append(f"نوع: {self._get_safe_attr_name(self.product_type)}")

        # Add price
        price_text = f"السعر: {self.selling_price} ر.س"
        if self.discount_price:
            price_text = f"السعر: {self.discount_price} ر.س (بعد خصم {self.discount_percentage}%)"
        parts.append(price_text)

        return " | ".join(parts)

    def save(self, *args, **kwargs):
        # Build description before validation
        if not self.description or kwargs.pop('force_description_update', False):
            self.description = self.build_description()

        self.full_clean()  # This calls clean() and validates before saving
        super().save(*args, **kwargs)

    def build_sku(self):
        """تجهيز الحقول المناسبة حسب نوع المنتج"""
        # We don't need 'fields' list passed to service anymore if service handles it,
        # BUT the service is simple hash. Let's assume we maintain old logic
        # of passing fields BUT using the better service.

        # Since I am fixing SKU logic to be single source, I will rely on the service
        # to handle the logic if I pass the variant object.
        # However, the current service provided in context (generate_sku_code)
        # might not be generic enough. Let's assume generate_sku_code
        # in services/generate_sku_code.py expects a variant.
        return generate_sku_code(self)


class BaseLens(models.Model):
    lens_diameter = models.ForeignKey(AttributeValue, on_delete=models.CASCADE,
                                      related_name='%(class)s_lens_diameter', limit_choices_to={'attribute__name': 'Diameter'})
    lens_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_color',
                                   blank=True, null=True, limit_choices_to={'attribute__name': 'Color'})
    lens_material = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_material',
                                      blank=True, null=True, limit_choices_to={'attribute__name': 'Material'})
    lens_coatings = models.ManyToManyField(
        AttributeValue, related_name='%(class)s_lens_coatings', blank=True,  limit_choices_to={'attribute__name': 'Coatings'})

    class Meta:
        abstract = True


class FrameVariant(ProductVariant):
    frame_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE,
                                    related_name='%(class)s_color', limit_choices_to={'attribute__name': 'Color'})
    lens_diameter = models.ForeignKey(AttributeValue, on_delete=models.CASCADE,
                                      related_name='%(class)s_lens_diameter', limit_choices_to={'attribute__name': 'Diameter'})
    temple_length = models.ForeignKey(AttributeValue, on_delete=models.CASCADE,
                                      related_name='%(class)s_temple_length', limit_choices_to={'attribute__name': 'Length'})
    bridge_width = models.ForeignKey(AttributeValue, on_delete=models.CASCADE,
                                     related_name='%(class)s_bridge_width', limit_choices_to={'attribute__name': 'Width'})
    frame_shape = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_frame_shape',
                                    blank=True, null=True, limit_choices_to={'attribute__name': 'Shape'})
    frame_material = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_frame_material',
                                       blank=True, null=True, limit_choices_to={'attribute__name': 'Material'})
    lens_color = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_color',
                                   blank=True, null=True, limit_choices_to={'attribute__name': 'Color'})

    def build_description(self):
        """Build detailed description for eyewear frame"""
        parts = [f"{self.product.brand.name} {self.product.model}"]

        # Frame details
        specs = []
        if self.frame_color:
            specs.append(
                f"{self._get_safe_attr_name(self.frame_color)}")
        if self.frame_shape:
            specs.append(
                f"{self._get_safe_attr_name(self.frame_shape)}")
        if self.frame_material:
            specs.append(
                f"{self._get_safe_attr_name(self.frame_material)}")

        # Measurements
        measurements = []
        if self.lens_diameter:
            measurements.append(
                f"{self._get_safe_attr_name(self.lens_diameter)}")
        if self.temple_length:
            measurements.append(
                f"{self._get_safe_attr_name(self.temple_length)}")
        if self.bridge_width:
            measurements.append(
                f"{self._get_safe_attr_name(self.bridge_width)}")

        if specs:
            parts.append(" - ".join(specs))
        if measurements:
            parts.append(" - ".join(measurements))

        # Lens color if available
        if self.lens_color:
            parts.append(
                f"{self._get_safe_attr_name(self.lens_color)}")

        return " | ".join(parts)

    def _eyewear_fields(self):
        """Returns field values for SKU generation for eyewear frames"""
        return [
            str(getattr(self, 'frame_color_id', '') or ''),
            str(getattr(self, 'lens_diameter_id', '') or ''),
            str(getattr(self, 'temple_length_id', '') or ''),
            str(getattr(self, 'bridge_width_id', '') or ''),
            str(getattr(self, 'frame_shape_id', '') or ''),
            str(getattr(self, 'frame_material_id', '') or ''),
            str(getattr(self, 'lens_color_id', '') or ''),
        ]


class StokLensVariant(ProductVariant, BaseLens):
    spherical = models.CharField(max_length=20, choices=spherical_lens_powers)
    cylinder = models.CharField(
        max_length=20, choices=cylinder_lens_powers, blank=True, null=True, default=None)

    def build_description(self):
        """Build detailed description for stock lenses"""
        parts = [f"{self.product.brand.name} {self.product.model}"]

        # Lens specifications
        specs = []
        if self.spherical:
            specs.append(f"SPH: {self.spherical}")
        if self.cylinder:
            specs.append(f"CYL: {self.cylinder}")

        # Lens details
        details = []
        if getattr(self, 'lens_diameter_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_diameter)}")
        if getattr(self, 'lens_material_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_material)}")
        if getattr(self, 'lens_color_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_color)}")

        # Lens coatings (ManyToManyField) - only if saved
        if self.pk and self.lens_coatings.exists():
            coatings_names = [self._get_safe_attr_name(
                coating) for coating in self.lens_coatings.all()]
            if coatings_names:
                details.append(f"{', '.join(coatings_names)}")

        if specs:
            parts.append(" - ".join(specs))
        if details:
            parts.append(" - ".join(details))

        return " | ".join(parts)

    def _lenses_fields(self):
        """Returns field values for SKU generation for stock lenses"""
        return [
            str(getattr(self, 'lens_diameter_id', '') or ''),
            str(getattr(self, 'lens_color_id', '') or ''),
            str(getattr(self, 'lens_material_id', '') or ''),
            str(self.spherical or ''),
            str(self.cylinder or ''),
        ]


class RxLensVariant(ProductVariant, BaseLens):
    # RIGHT_LEFT_CHOICES imported from apps.products.constants

    lens_base_curve = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_base_curve',
                                        blank=True, null=True, limit_choices_to={'attribute__name': 'Base Curve'})
    addition = models.CharField(
        max_length=20, choices=additional_lens_powers, blank=True, null=True, default=None)
    right_or_left = models.CharField(max_length=5, choices=RIGHT_LEFT_CHOICES, blank=True,
                                     null=True, help_text="Specify if lens is for right (R) or left (L) eye")

    def build_description(self):
        """Build detailed description for prescription lenses"""
        parts = [f"{self.product.brand.name} {self.product.model}"]

        # Prescription details
        specs = []
        if self.addition:
            specs.append(f"ADD: {self.addition}")
        if self.right_or_left:
            eye_text = "Right" if self.right_or_left == 'R' else "Left"
            specs.append(eye_text)

        # Lens details
        details = []
        if getattr(self, 'lens_diameter_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_diameter)}")
        if getattr(self, 'lens_base_curve_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_base_curve)}")
        if getattr(self, 'lens_material_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_material)}")
        if getattr(self, 'lens_color_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_color)}")

        # Lens coatings (ManyToManyField) - only if saved
        if self.pk and self.lens_coatings.exists():
            coatings_names = [self._get_safe_attr_name(
                coating) for coating in self.lens_coatings.all()]
            if coatings_names:
                details.append(f"{', '.join(coatings_names)}")

        if specs:
            parts.append(" - ".join(specs))
        if details:
            parts.append(" - ".join(details))

        return " | ".join(parts)

    def _lenses_fields(self):
        """Returns field values for SKU generation for prescription lenses"""
        return [
            str(getattr(self, 'lens_diameter_id', '') or ''),
            str(getattr(self, 'lens_color_id', '') or ''),
            str(getattr(self, 'lens_material_id', '') or ''),
            str(getattr(self, 'lens_base_curve_id', '') or ''),
            str(self.addition or ''),
            str(self.right_or_left or ''),
        ]


class ContactLensVariant(ProductVariant, BaseLens):
    lens_water_content = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_water_content',
                                           blank=True, null=True, limit_choices_to={'attribute__name': 'Water Content'})
    replacement_schedule = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_replacement_schedule',
                                             blank=True, null=True, limit_choices_to={'attribute__name': 'Replacement Schedule'})
    units = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_unit', blank=True,
                              null=True, default=None, limit_choices_to={'attribute__name': 'Unit'}, help_text="Unit of measurement box piesces")
    spherical = models.CharField(
        max_length=20, choices=spherical_lens_powers, blank=True, null=True, default=None)
    cylinder = models.CharField(
        max_length=20, choices=cylinder_lens_powers, blank=True, null=True, default=None)
    axis = models.CharField(max_length=20, blank=True, null=True, default=None)
    addition = models.CharField(
        max_length=20, choices=additional_lens_powers, blank=True, null=True, default=None)
    lens_base_curve = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='%(class)s_lens_base_curve',
                                        blank=True, null=True, limit_choices_to={'attribute__name': 'Base Curve'})

    def build_description(self):
        """Build detailed description for contact lenses"""
        parts = [f"{self.product.brand.name} {self.product.model}"]

        # Prescription details
        specs = []
        if self.spherical:
            specs.append(f"SPH: {self.spherical}")
        if self.cylinder:
            specs.append(f"CYL: {self.cylinder}")
        if self.axis:
            specs.append(f"AXIS: {self.axis}")
        if self.addition:
            specs.append(f"ADD: {self.addition}")

        # Lens details
        details = []
        if getattr(self, 'lens_diameter_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_diameter)}")
        if getattr(self, 'lens_water_content_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_water_content)}")
        if getattr(self, 'replacement_schedule_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.replacement_schedule)}")
        if getattr(self, 'lens_base_curve_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_base_curve)}")
        if getattr(self, 'lens_material_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_material)}")
        if getattr(self, 'lens_color_id', None):
            details.append(
                f"{self._get_safe_attr_name(self.lens_color)}")

        # Lens coatings (ManyToManyField) - only if saved
        if self.pk and self.lens_coatings.exists():
            coatings_names = [self._get_safe_attr_name(
                coating) for coating in self.lens_coatings.all()]
            if coatings_names:
                details.append(f"{', '.join(coatings_names)}")

        if specs:
            parts.append(" - ".join(specs))
        if details:
            parts.append(" - ".join(details))

        return " | ".join(parts)

    def _lenses_fields(self):
        """Returns field values for SKU generation for contact lenses"""
        return [
            str(getattr(self, 'lens_diameter_id', '') or ''),
            str(getattr(self, 'lens_color_id', '') or ''),
            str(getattr(self, 'lens_material_id', '') or ''),
            str(getattr(self, 'lens_water_content_id', '') or ''),
            str(getattr(self, 'replacement_schedule_id', '') or ''),
            str(self.spherical or ''),
            str(self.cylinder or ''),
            str(self.axis or ''),
            str(self.addition or ''),
            str(getattr(self, 'lens_base_curve_id', '') or ''),
        ]


class ContactLensVariantExpirationDate(models.Model):
    contact_lens_variant = models.ForeignKey(
        ContactLensVariant, on_delete=models.CASCADE)
    expiration_date = models.DateField()

    class Meta:
        verbose_name = "Contact Lens Variant Expiration Date"
        verbose_name_plural = "Contact Lens Variant Expiration Dates"
        unique_together = ("contact_lens_variant", "expiration_date")


class ExtraVariantAttribute(BaseModel):
    # variant_type = models.CharField(max_length=50)
    variant_type = models.ForeignKey(
        "Attribute", related_name='extravariantattribute_set', on_delete=models.CASCADE)
    variant = models.ForeignKey(
        "ProductVariant", related_name='productvariant_set', on_delete=models.CASCADE)
    attribute = models.ForeignKey(
        "Attribute", related_name='attribute_set', on_delete=models.CASCADE)
    value = models.ForeignKey(
        "AttributeValue", related_name='attributevalue_set', on_delete=models.CASCADE)

    class Meta:
        unique_together = ("variant_type", "variant", "attribute", "value")


class ProductImage(models.Model):
    """Additional product images"""
    variant = models.ForeignKey(
        "ProductVariant", related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/', unique=True)
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['order', 'id']
        indexes = [
            models.Index(fields=['order']),
        ]

    def __str__(self):
        return f"{self.variant.product.name} - {self.variant.id}"


class FlexiblePrice(BaseModel):
    """
    التسعير المرن - يدعم:
    - أسعار خاصة لعميل معين
    - أسعار لمجموعة عملاء
    - أسعار فرع معين
    - أسعار الجملة (pricing_tier)
    - أسعار الشركاء (partner)
    - أسعار الكميات
    """

    PRICING_TIER_CHOICES = [
        ('retail', 'تجزئة'),
        ('wholesale_1', 'جملة - المستوى 1'),
        ('wholesale_2', 'جملة - المستوى 2'),
        ('wholesale_3', 'جملة - المستوى 3 (VIP)'),
        ('distributor', 'موزع'),
    ]

    variant = models.ForeignKey(
        "ProductVariant", on_delete=models.CASCADE, related_name='price_rules')

    # التسعير حسب العميل/المجموعة
    customer = models.ForeignKey(
        "crm.Customer", on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="عميل محدد"
    )
    customer_group = models.ForeignKey(
        "crm.CustomerGroup", on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="مجموعة عملاء"
    )

    # التسعير حسب الفرع
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="فرع محدد"
    )

    # التسعير حسب مستوى الجملة
    pricing_tier = models.CharField(
        max_length=20,
        choices=PRICING_TIER_CHOICES,
        blank=True,
        null=True,
        verbose_name="مستوى التسعير"
    )

    # التسعير حسب الشريك (تأمين، BNPL، إلخ)
    partner = models.ForeignKey(
        "crm.Partner", on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="شريك",
        related_name='price_rules'
    )

    # السعر الخاص
    special_price = models.DecimalField(max_digits=10, decimal_places=2)

    # نسبة الخصم (بديل عن السعر الخاص)
    discount_percentage = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True,
        verbose_name="نسبة الخصم"
    )

    # صلاحية السعر
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    # شروط الكمية
    min_quantity = models.PositiveIntegerField(
        default=1, verbose_name="الحد الأدنى للكمية")
    max_quantity = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="الحد الأقصى للكمية")

    currency = models.CharField(max_length=10, default="SAR")

    # ترتيب الأولوية (لتحديد أي سعر يستخدم عند وجود أكثر من خيار)
    priority = models.PositiveIntegerField(default=0)

    # ملاحظات
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-priority', 'start_date']
        indexes = [
            models.Index(fields=['variant', 'pricing_tier']),
            models.Index(fields=['variant', 'customer']),
            models.Index(fields=['variant', 'partner']),
        ]

    def __str__(self):
        target = self.customer or self.pricing_tier or self.partner or "عام"
        return f"{self.variant} - {target}: {self.special_price}"

    def is_valid(self, customer=None, branch=None, quantity=1, date=None):
        """تحقق من صلاحية هذا السعر لعميل معين"""
        date = date or timezone.now().date()
        if self.start_date and self.start_date > date:
            return False
        if self.end_date and self.end_date < date:
            return False
        if self.min_quantity > quantity:
            return False
        if self.max_quantity and self.max_quantity < quantity:
            return False
        if self.customer and self.customer != customer:
            return False
        if self.branch and self.branch != branch:
            return False
        return True

    def get_final_price(self, base_price=None):
        """الحصول على السعر النهائي"""
        if self.special_price:
            return self.special_price

        if self.discount_percentage and base_price:
            from decimal import Decimal
            discount = base_price * (self.discount_percentage / Decimal('100'))
            return base_price - discount

        return base_price


class ProductSupplier(models.Model):

    product = models.ForeignKey("Product", on_delete=models.CASCADE)
    supplier = models.ForeignKey("Supplier", on_delete=models.CASCADE)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    supply_code = models.CharField(
        max_length=100, blank=True, null=True)  # لو المورد عنده كود خاص
    lead_time_days = models.IntegerField(default=0)

    class Meta:
        # يمنع تكرار نفس المنتج عند نفس المورد
        unique_together = ('product', 'supplier')


class ProductManufacturer(models.Model):

    product = models.ForeignKey("Product", on_delete=models.CASCADE)
    manufacturer = models.ForeignKey("Manufacturer", on_delete=models.CASCADE)
    ref_code = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ('product', 'manufacturer')
