from django.db import models


class Brand(models.Model):
    """Brand for glasses"""
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Category(models.Model):
    """Category for glasses"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class FrameMaterial(models.Model):
    """Frame Material"""
    name = models.CharField(max_length=50)  # مثل: معدن، بلاستيك، تيتانيوم
    properties = models.JSONField(default=dict)  # خصائص المادة
    
    def __str__(self):
        return self.name

class LensType(models.Model):
    """Lens Type
        Like: Single Vision	Bifocal	Trifocal	Progressive	
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price_multiplier = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """Product for glasses"""
    GENDER_CHOICES = [
        ('unisex', 'Unisex'),
        ('men', 'Men'),
        ('women', 'Women'),
        ('kids', 'Kids')
    ]
    
    FRAME_SHAPES = [
        ('round', 'Round'),
        ('square', 'Square'),
        ('rectangular', 'Rectangular'),
        ('aviator', 'Aviator'),
        ('cat_eye', 'Cat Eye'),
        ('oval', 'Oval')
    ]
    AGE_GROUP_CHOICES = [
        ('adult', 'Adult'),
        ('child', 'Child'),
        ('senior', 'Senior')
    ]
    
    # Basic information
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)  # Product code
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    
    # Product description
    description = models.TextField(blank=True)
    short_description = models.CharField(max_length=255, blank=True)
    
    # Frame specifications
    frame_material = models.ForeignKey(FrameMaterial, on_delete=models.CASCADE)
    frame_shape = models.CharField(max_length=20, choices=FRAME_SHAPES)
    frame_color = models.CharField(max_length=50)
    frame_size = models.CharField(max_length=20)  # مثل: 52-18-140
    temple_length = models.IntegerField(help_text="Temple length in mm")
    bridge_width = models.IntegerField(help_text="Bridge width in mm")
    lens_width = models.IntegerField(help_text="Lens width in mm")
    
    # Lens specifications
    lens_type = models.ForeignKey(LensType, on_delete=models.CASCADE)
    
    # Marketing information
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unisex')
    age_group = models.CharField(max_length=20, choices=AGE_GROUP_CHOICES, blank=True)
    
    # Pricing
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Status and availability
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    requires_prescription = models.BooleanField(default=False)
    
    # Stock
    have_variant = models.BooleanField(default=False)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, null=True, blank=True)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Main image
    main_image = models.ImageField(upload_to='products/', blank=True, null=True)
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.CharField(max_length=300, blank=True)


    def __str__(self):
        return f"{self.brand.name} {self.name}"
    
    @property
    def current_price(self):
        """Current price (with discount if applicable)"""
        return self.discount_price if self.discount_price else self.selling_price
    
    @property
    def profit_margin(self):
        """Profit margin"""
        return ((self.current_price - self.cost_price) / self.cost_price) * 100

class ProductImage(models.Model):
    """Additional product images"""
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']

class ProductVariant(models.Model):
    """Different shapes of the product (different colors for example)"""
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    color = models.CharField(max_length=50)
    color_code = models.CharField(max_length=7, help_text="Color code in hex")
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sku_suffix = models.CharField(max_length=10)  # Add to product code
    
    def __str__(self):
        return f"{self.product.name} - {self.color}"


# class Stock(models.Model):
#     variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
#     product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
#     branch = models.ForeignKey(Branch, on_delete=models.CASCADE, null=True, blank=True)
#     quantity = models.PositiveIntegerField(default=0)

#     class Meta:
#         unique_together = [('variant', 'branch'), ('product', 'branch')]

#     def __str__(self):
#         return f"{self.product.name} - {self.variant.color} - {self.branch.name}"

# class Product(models.Model):
#     name = models.CharField(max_length=100)
#     have_variant = models.BooleanField(default=False)

# class Variant(models.Model):
#     product = models.ForeignKey(Product, on_delete=models.CASCADE)
#     name = models.CharField(max_length=100)  # مثل اللون أو المقاس

class Stock(models.Model):
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, null=True, blank=True)
    def clean(self):
        if not self.variant and not self.product:
            raise ValidationError("Stok Should contain variant or product")
        if self.variant and self.product:
            raise ValidationError("Stok can't contain variant and product")
