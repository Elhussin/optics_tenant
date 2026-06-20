from core.models import BaseModel
from .suppliers import Supplier, Manufacturer, Brand
from .attributes import AttributeValue
from django.utils.translation import gettext_lazy as _
from django.db import models
import hashlib
from django.core.exceptions import ValidationError
from apps.products.utils.index import spherical_lens_powers, cylinder_lens_powers, additional_lens_powers
from decimal import Decimal, InvalidOperation
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
        verbose_name_plural = _("Categories")
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
    manufacturer = models.ForeignKey(
        "Manufacturer", on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="products",
        help_text=_("Optional manufacturer for the product")
    )
    brand = models.ForeignKey("Brand", on_delete=models.CASCADE)
    model = models.CharField(max_length=50)
    main_group = models.CharField(max_length=50, choices=PRODUCT_TYPE_CHOICES)
    name = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True, editable=False)
    sku = models.CharField(max_length=64, unique=True, editable=False,
                           help_text=_("Unique product SKU generated automatically"))
    variant_type = models.CharField(
        max_length=20, choices=VARIANT_TYPE_CHOICES, default='basic')

    objects = ProductManager()

    class Meta:
        unique_together = ('main_group', 'brand', 'model')

    def __str__(self):
        return f"{self.brand.name} {self.model}"

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = f"{self.brand.name} {self.model}".title()
            self.description = f"{self.main_group} {self.name}".upper()
        else:
            self.description = f"{self.main_group} {self.brand.name} {self.model} {self.name}".upper(
            )

        # 🔹 Generate Unique SKU
        # CHANGED: Use services.generate_sku_code (single source of truth)
        if not self.sku:
            # Product doesn't have complex fields like variant, pass self
            self.sku = generate_sku_code(self)
        super().save(*args, **kwargs)


class ProductVariant(BaseModel):
    product = models.ForeignKey(
        Product, related_name='variants', on_delete=models.CASCADE)
    factory_code = models.CharField(
        max_length=50, unique=True, blank=True, null=True)
    sku = models.CharField(max_length=64, unique=True, editable=False,  help_text=_(
        "Unique product variant SKU generated automatically"))
    description = models.TextField(blank=True, editable=False,
                                   help_text=_("Auto-generated description based on variant specifications"))
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
    BaseRxLensFields = ['lens_base_curve']
    BaseContactLensFields = ['lens_water_content',
                             'replacement_schedule', 'units', 'axis']
    BaseExtraVariantFields = ['variant_type',
                              'variant_id', 'attribute', 'value']

    def clean(self):
        if not self.sku:
            self.sku = self.build_sku()

        # تحقق من التكرار
        exists = self.__class__.objects.filter(sku=self.sku)
        if self.pk:
            exists = exists.exclude(pk=self.pk)
        if exists.exists():
            raise ValidationError(
                _("Variant with identical specifications already exists."))

    @property
    def discount_price(self):
        """Calculate discounted price"""
        # تحويل discount_percentage و selling_price إلى Decimal للتأكد من صحة العمليات الحسابية
        try:
            discount_pct = Decimal(str(self.discount_percentage or 0))
            selling_price = Decimal(str(self.selling_price or 0))

            if discount_pct > 0 and selling_price > 0:
                discount_amount = selling_price * (discount_pct / 100)
                return selling_price - discount_amount
        except (ValueError, TypeError, InvalidOperation):
            pass
        return None

    class Meta:
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['product_id'])
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['sku'], name='unique_variant_by_hash')
        ]
        verbose_name = _("Product Variant")
        verbose_name_plural = _("Product Variants")

    def get_price_for(self, customer=None, branch=None, quantity=1, date=None):
        today = date or timezone.now().date()
        from django.db.models import Q
        
        rules = FlexiblePrice.objects.filter(
            Q(variant=self) | 
            Q(product=self.product) | 
            Q(brand=self.product.brand) | 
            Q(category__in=self.product.categories.all())
        ).order_by('-priority', 'start_date')

        for rule in rules:
            if rule.is_valid(customer=customer, branch=branch, quantity=quantity, date=today):
                return rule.get_final_price(base_price=self.discount_price or self.selling_price)

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
        # Add product type
        if self.product_type:
            parts.append(str(_("Type: {0}").format(
                self._get_safe_attr_name(self.product_type))))

        # Add price to description
        # price_text = str(_("Price: {0} SAR").format(self.selling_price))
        # discount_pct = Decimal(str(self.discount_percentage or 0))
        # if self.discount_price and discount_pct > 0:
        #     price_text = str(_("Price: {0} SAR (after {1}% discount)").format(
        #         self.discount_price, discount_pct))
        # parts.append(price_text)

        return " - ".join(parts)

    def save(self, *args, **kwargs):
        # Build description before validation
        if not self.description or kwargs.pop('force_description_update', False):
            self.description = self.build_description()

        self.full_clean()  # This calls clean() and validates before saving
        super().save(*args, **kwargs)

    def build_sku(self):
        """Prepare appropriate fields based on product type"""
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
        if getattr(self, 'frame_color_id', None):
            specs.append(
                f"{self._get_safe_attr_name(self.frame_color)}")
        if getattr(self, 'frame_shape_id', None):
            specs.append(
                f"{self._get_safe_attr_name(self.frame_shape)}")
        if getattr(self, 'frame_material_id', None):
            specs.append(
                f"{self._get_safe_attr_name(self.frame_material)}")

        # Measurements
        measurements = []
        if getattr(self, 'lens_diameter_id', None):
            measurements.append(
                f"{self._get_safe_attr_name(self.lens_diameter)}")
        if getattr(self, 'temple_length_id', None):
            measurements.append(
                f"{self._get_safe_attr_name(self.temple_length)}")
        if getattr(self, 'bridge_width_id', None):
            measurements.append(
                f"{self._get_safe_attr_name(self.bridge_width)}")

        if specs:
            parts.append(" - ".join(specs))
        if measurements:
            parts.append(" - ".join(measurements))

        # Lens color if available
        if getattr(self, 'lens_color_id', None):
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

    def build_description(self):
        """Build detailed description for prescription lenses"""
        parts = [f"{self.product.brand.name} {self.product.model}"]

        # Prescription details (Removed addition and right/left as they belong to the patient prescription)
        specs = []

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
        verbose_name = _("Contact Lens Variant Expiration Date")
        verbose_name_plural = _("Contact Lens Variant Expiration Dates")
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
    Flexible Pricing - Supports:
    - Special prices for specific customer
    - Prices for customer group
    - Prices for specific branch
    - Wholesale prices (pricing_tier)
    - Partner prices (partner)
    - Quantity prices
    """

    PRICING_TIER_CHOICES = [
        ('retail', _('Retail')),
        ('wholesale_1', _('Wholesale - Level 1')),
        ('wholesale_2', _('Wholesale - Level 2')),
        ('wholesale_3', _('Wholesale - Level 3 (VIP)')),
        ('distributor', _('Distributor')),
    ]

    variant = models.ForeignKey(
        "ProductVariant", on_delete=models.CASCADE, related_name='price_rules', null=True, blank=True,
        verbose_name=_("Specific Variant")
    )
    product = models.ForeignKey(
        "Product", on_delete=models.CASCADE, related_name='price_rules', null=True, blank=True,
        verbose_name=_("Specific Model")
    )
    brand = models.ForeignKey(
        "Brand", on_delete=models.CASCADE, related_name='price_rules', null=True, blank=True,
        verbose_name=_("Brand")
    )
    category = models.ForeignKey(
        "Category", on_delete=models.CASCADE, related_name='price_rules', null=True, blank=True,
        verbose_name=_("Category")
    )

    # Pricing by Customer/Group
    customer = models.ForeignKey(
        "crm.Customer", on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name=_("Specific Customer")
    )
    customer_group = models.ForeignKey(
        "crm.CustomerGroup", on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name=_("Customer Group")
    )

    # Pricing by Branch
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name=_("Specific Branch")
    )

    # Pricing by Wholesale Tier
    pricing_tier = models.CharField(
        max_length=20,
        choices=PRICING_TIER_CHOICES,
        blank=True,
        null=True,
        verbose_name=_("Pricing Tier")
    )

    # Pricing by Partner (Insurance, BNPL, etc.)
    partner = models.ForeignKey(
        "crm.Partner", on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name=_("Partner"),
        related_name='price_rules'
    )

    # Special Price
    special_price = models.DecimalField(max_digits=10, decimal_places=2)

    # Discount Percentage (Alternative to Special Price)
    discount_percentage = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True,
        verbose_name=_("Discount Percentage")
    )

    # Price Validity
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    # Quantity Conditions
    min_quantity = models.PositiveIntegerField(
        default=1, verbose_name=_("Minimum Quantity"))
    max_quantity = models.PositiveIntegerField(
        null=True, blank=True, verbose_name=_("Maximum Quantity"))

    currency = models.CharField(max_length=10, default="SAR")

    # Priority Order (to determine which price to use when multiple options exist)
    priority = models.PositiveIntegerField(default=0)

    # Link to Pricing Policy
    pricing_policy = models.ForeignKey(
        "products.PricingPolicy",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='flexible_prices',
        verbose_name=_("Pricing Policy")
    )

    # Notes
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-priority', 'start_date']
        indexes = [
            models.Index(fields=['variant', 'pricing_tier']),
            models.Index(fields=['variant', 'customer']),
            models.Index(fields=['variant', 'partner']),
        ]

    def __str__(self):
        target = self.customer or self.pricing_tier or self.partner or _("General")
        item = self.variant or self.product or self.brand or self.category or _("All")
        val = self.special_price if self.special_price else f"{self.discount_percentage}%"
        return f"{item} - {target}: {val}"

    def is_valid(self, customer=None, branch=None, quantity=1, date=None):
        """Check validity of this price for a specific customer"""
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
        """Get final price"""
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
        max_length=100, blank=True, null=True)  # If supplier has special code
    lead_time_days = models.IntegerField(default=0)

    class Meta:
        # Prevent Duplicate product for same supplier
        unique_together = ('product', 'supplier')


class ProductManufacturer(models.Model):

    product = models.ForeignKey("Product", on_delete=models.CASCADE)
    manufacturer = models.ForeignKey("Manufacturer", on_delete=models.CASCADE)
    ref_code = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ('product', 'manufacturer')
