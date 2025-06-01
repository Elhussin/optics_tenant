

# Create your models here.
from django_tenants.models import TenantMixin, DomainMixin
from django.db import models
import uuid
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User

def get_expiration_date():
    return timezone.now() + timedelta(days=1)


class PendingTenantRequest(models.Model):
    schema_name = models.CharField(max_length=63, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_activated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=get_expiration_date)  
    plan = models.CharField(max_length=20, choices=[
        ('basic', 'Basic'),
        ('premium', 'Premium'),
        ('enterprise', 'Enterprise')
    ], default='basic')
    max_users = models.IntegerField(default=5)
    max_products = models.IntegerField(default=1000)

class Client(TenantMixin):
    name = models.CharField(max_length=100)
    paid_until = models.DateField(null=True, blank=True)
    on_trial = models.BooleanField(default=True)

    # True to automatically create schema on save
    auto_create_schema = True

    def __str__(self):
        return self.name

class Domain(DomainMixin):
    pass





# models/customers.py - إدارة العملاء
class Customer(models.Model):
    """عملاء المتجر"""
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Membership
    customer_since = models.DateTimeField(auto_now_add=True)
    is_vip = models.BooleanField(default=False)
    loyalty_points = models.IntegerField(default=0)
    
    # Marketing
    accepts_marketing = models.BooleanField(default=True)
    preferred_contact = models.CharField(max_length=10, choices=[
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('sms', 'SMS')
    ], default='email')
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class PrescriptionRecord(models.Model):
    """Prescription Record"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='prescriptions')
    
    # Right Eye
    right_sphere = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    right_cylinder = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    right_axis = models.IntegerField(null=True, blank=True)
    
    # Left Eye
    left_sphere = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    left_cylinder = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    left_axis = models.IntegerField(null=True, blank=True)
    
    # Additional Information
    pupillary_distance = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    doctor_name = models.CharField(max_length=200, blank=True)
    prescription_date = models.DateField()
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)  # the current prescription
    
    def __str__(self):
        return f"Prescription {self.customer.full_name} - {self.prescription_date}"



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
    """Lens Type"""
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
    
    # Lens specifications
    bridge_width = models.IntegerField(help_text="Bridge width in mm")
    lens_width = models.IntegerField(help_text="Lens width in mm")
    temple_length = models.IntegerField(help_text="Temple length in mm")
    
    # Marketing information
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unisex')
    age_group = models.CharField(max_length=20, blank=True)
    
    # Pricing
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Status and availability
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    requires_prescription = models.BooleanField(default=False)
    
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




# models/inventory.py - إدارة المخزون
class Supplier(models.Model):
    """Suppliers"""
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    payment_terms = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Stock(models.Model):
    """Stock of products"""
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='stock')
    quantity_on_hand = models.IntegerField(default=0)
    quantity_reserved = models.IntegerField(default=0)  # محجوز للطلبات
    reorder_point = models.IntegerField(default=10)  # نقطة إعادة الطلب
    max_stock_level = models.IntegerField(default=100)
    
    # Cost tracking
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    last_updated = models.DateTimeField(auto_now=True)
    
    @property
    def available_quantity(self):
        """Available quantity for sale"""
        return self.quantity_on_hand - self.quantity_reserved
    
    @property
    def needs_reorder(self):
        """Does it need reordering?"""
        return self.available_quantity <= self.reorder_point

class StockMovement(models.Model):
    """Stock movements"""
    MOVEMENT_TYPES = [
        ('in', 'in'),
        ('out', 'out'),
        ('adjustment', 'adjustment'),
        ('transfer', 'transfer')
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    reference_number = models.CharField(max_length=100, blank=True)  # رقم الفاتورة أو الطلب
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.product.name} - {self.movement_type} - {self.quantity}"



class Order(models.Model):
    """ sales order """
    STATUS_CHOICES = [
        ('pending', 'pending'),
        ('confirmed', 'confirmed'),
        ('processing', 'processing'),
        ('ready', 'ready'),
        ('delivered', 'delivered'),
        ('cancelled', 'cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'pending'),
        ('partial', 'partial'),
        ('paid', 'paid'),
        ('refunded', 'refunded'),
    ]
    
    # basic order information
    order_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey('Customer', on_delete=models.CASCADE, related_name='orders')
    
    # order status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # financial information
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # additional information
    notes = models.TextField(blank=True, help_text="notes")
    internal_notes = models.TextField(blank=True, help_text="internal notes")
    
    # important dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    expected_delivery = models.DateTimeField(null=True, blank=True)
    
    # sales person
    sales_person = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Order {self.order_number} - {self.customer.full_name}"
    
    @property
    def remaining_amount(self):
        """remaining amount to pay"""
        return self.total_amount - self.paid_amount
    
    @property
    def is_fully_paid(self):
        """is the order fully paid?"""
        return self.paid_amount >= self.total_amount
    
    def save(self, *args, **kwargs):
        # create order number automatically if not exists
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)
    
    def generate_order_number(self):
        """generate unique order number"""
        import datetime
        today = datetime.date.today()
        # format: ORD-YYYYMMDD-XXXX
        prefix = f"ORD-{today.strftime('%Y%m%d')}"
        
        # search for the last order number for today
        last_order = Order.objects.filter(
            order_number__startswith=prefix
        ).order_by('-created_at').first()
        
        if last_order:
            # extract the serial number and increment it
            last_number = int(last_order.order_number.split('-')[-1])
            next_number = last_number + 1
        else:
            next_number = 1
        
        return f"{prefix}-{next_number:04d}"

class OrderItem(models.Model):
    """order items"""
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    variant = models.ForeignKey('ProductVariant', on_delete=models.CASCADE, null=True, blank=True)
    
    # quantity and prices
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # lens information (if required)
    lens_type = models.ForeignKey('LensType', on_delete=models.SET_NULL, null=True, blank=True)
    prescription = models.ForeignKey('PrescriptionRecord', on_delete=models.SET_NULL, null=True, blank=True)
    
    # additional information
    notes = models.TextField(blank=True, help_text="notes")
    internal_notes = models.TextField(blank=True, help_text="internal notes")
    
    def __str__(self):
        return f"{self.product.name} - {self.quantity}"
