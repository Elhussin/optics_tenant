from django.db import models
from users.models import Customer
from django.contrib.auth.models import User
from products.models import Product, ProductVariant
from users.models import Branch ,Customer , BranchUsers
from core.models import BaseModel
from products.models import Product, ProductVariant
from prescriptions.models import PrescriptionRecord

class Order(BaseModel):
    """ sales order """
    INVOICE_TYPE_choices = [
        ('cash', 'cash'),
        ('credit', 'credit'),
        ('insurance', 'insurance'),
    ]
    PAYMENT_TYPE_CHOICES = [
        ('cash', 'cash'),
        ('credit', 'credit'),
        ('cheque', 'cheque'),
        ('bank_transfer', 'bank transfer'),
        ('other', 'other'),
        ('gift_card', 'gift card'),
        ('installment', 'installment'),
        ('prepaid', 'prepaid'),
        ('voucher', 'voucher'),
        ('loyalty', 'loyalty'),
    ]

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
    invoice_type = models.CharField(max_length=20, choices=INVOICE_TYPE_choices, default='cash')
    order_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)

    # order status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # financial information
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='cash')
 
    # additional information
    notes = models.TextField(blank=True, help_text="notes")
    internal_notes = models.TextField(blank=True, help_text="internal notes")
    
    # important dates
    confirmed_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    expected_delivery = models.DateTimeField(null=True, blank=True)
    
#     # sales person
    sales_person = models.ForeignKey(BranchUsers, on_delete=models.SET_NULL, null=True, blank=True)
    
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
    # product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    
    # quantity and prices
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # lens information (if required)
    prescription = models.ForeignKey(PrescriptionRecord, on_delete=models.SET_NULL, null=True, blank=True)
    
    # additional information
    notes = models.TextField(blank=True, help_text="notes")
    internal_notes = models.TextField(blank=True, help_text="internal notes")
    
    def __str__(self):
        return f"{self.product.name} - {self.quantity}"
