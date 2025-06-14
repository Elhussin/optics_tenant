from django.db import models , transaction
from CRM.models import Customer
from branches.models import Branch, BranchUsers
from core.models import BaseModel
from products.models import ProductVariant
from prescriptions.models import PrescriptionRecord
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from products.models import StockMovements
from sales.services.order_service import confirm_order, cancel_order, calculate_order_totals
from sales.services.invoice_service import confirm_invoice, calculate_invoice_totals
from sales.services.payment_service import apply_payment


# Create your models here.



class Order(BaseModel):
    """ sales order """
    ORDER_TYPE_choices = [
        ('cash', 'cash'),
        ('credit', 'credit'),
        ('insurance', 'insurance'),
        ]
    
    PAYMENT_TYPE_CHOICES = [
        ('cash', 'cash'),
        ('credit', 'credit'),
        ('insurance', 'insurance'),
        ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
        ('disputed', 'Disputed'),
    ]

    STATUS_CHOICES = [
        ('pending', 'pending'),
        ('confirmed', 'confirmed'),
        ('ready', 'ready'),
        ('delivered', 'delivered'),
        ('cancelled', 'cancelled'),
         ]
    
    
    # basic order information
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_choices, default='cash')
    order_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)

    # order status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # financial information
    # subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    # tax_rate = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.15'))  # 15%
    # tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    # paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='cash')
 
    # additional information
    notes = models.TextField(blank=True, help_text="notes")
    internal_notes = models.TextField(blank=True, help_text="internal notes")
    
    # important dates
    confirmed_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    expected_delivery = models.DateTimeField(null=True, blank=True)
    
    # sales person
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

    @transaction.atomic
    def calculate_totals(self):
        """حساب المجاميع"""
        items = self.items.all()
        self.subtotal = sum(item.total_price for item in items)
        self.tax_amount = self.subtotal * self.tax_rate
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
        self.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])

    @transaction.atomic
    def confirm_order(self, user):
        """تأكيد الطلب وحجز المخزون"""
        if self.status != 'pending':
            raise ValidationError("Only pending orders can be confirmed")
        
        # التحقق من توفر المخزون وحجزه
        for item in self.items.all():
            stock = Stock.objects.filter(
                branch=self.branch,
                variant=item.variant
            ).first()
            
            if not stock or stock.available_quantity < item.quantity:
                raise ValidationError(f"Insufficient stock for {item.variant}")
            
            # حجز المخزون
            StockMovement.objects.create(
                branch=self.branch,
                variant=item.variant,
                movement_type='reserve',
                quantity=item.quantity,
                reference_number=self.order_number,
                reference_type='order',
                notes=f"Reserved for order {self.order_number}",
                created_by=user,
            )
        
        self.status = 'confirmed'
        self.confirmed_at = timezone.now()
        self.save()

    @transaction.atomic
    def cancel_order(self, user):
        """إلغاء الطلب وإلغاء حجز المخزون"""
        if self.status not in ['pending', 'confirmed']:
            raise ValidationError("Cannot cancel this order")
        
        # إلغاء حجز المخزون
        for item in self.items.all():
            StockMovement.objects.create(
                branch=self.branch,
                variant=item.variant,
                movement_type='release',
                quantity=item.quantity,
                reference_number=self.order_number,
                reference_type='order',
                notes=f"Released from cancelled order {self.order_number}",
                created_by=user,
            )
        
        self.status = 'cancelled'
        self.save()

class OrderItem(models.Model):
    """order items"""
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    # product = models.ForeignKey(Product, on_delete=models.CASCADE)
    # variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    
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
        product_name = self.variant.product.model if self.variant and self.variant.product else "Unknown Product"
        return f"{product_name} - {self.quantity}"

    def save(self, *args, **kwargs):
        # حساب السعر الإجمالي
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        
        # تحديث مجاميع الطلب
        # self.order.calculate_totals()

    def clean(self):
        # التحقق من توفر المخزون
        if self.order.status in ['confirmed', 'ready', 'delivered']:
            stock = Stock.objects.filter(
                branch=self.order.branch,
                variant=self.variant
            ).first()
            
            if not stock or stock.available_quantity < self.quantity:
                raise ValidationError(f"Insufficient stock for {self.variant}")



class Invoice(BaseModel):
    INVOICE_TYPES = [
        ('purchase', 'Purchase'),
        ('sale', 'Sale'),
        ('return_purchase', 'Return Purchase'),
        ('return_sale', 'Return Sale'),
    ]
    INVOICE_STATUS = [
        ('draft', 'Draft'),
        ('paid', 'Paid'),
        ('partially_paid', 'Partially Paid'),
        ('overdue', 'Overdue'),
    ]

    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)  # الفرع المسؤل
    invoice_type = models.CharField(max_length=20, choices=INVOICE_TYPES, default='sale')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices')
    created_by = models.ForeignKey(BranchUsers, on_delete=models.SET_NULL, null=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=INVOICE_STATUS, default='draft')
    notes = models.TextField(blank=True, null=True)

    # أسعار ومبالغ
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.15'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.customer.name}"

    def calculate_totals(self):
        items = self.items.all()
        self.subtotal = sum([item.total_price for item in items])
        self.tax_amount = self.subtotal * self.tax_rate
        self.total = self.subtotal + self.tax_amount - self.discount_amount
        self.balance_due = self.total - self.paid_amount
        self.save()
    @property
    def balance_due(self):
        return max(self.total_amount - self.paid_amount, 0)

    @property
    def is_overdue(self):
        return self.due_date and self.due_date < timezone.now().date() and self.balance_due > 0

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = self.generate_invoice_number()
        super().save(*args, **kwargs)

    def generate_invoice_number(self):
        return generate_serial_number(Invoice, 'INV', number_field='invoice_number')

    @transaction.atomic
    def calculate_totals(self):
        """حساب المجاميع"""
        items = self.items.all()
        self.subtotal = sum(item.total_price for item in items)
        self.tax_amount = self.subtotal * self.tax_rate
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
        
        # تحديث حالة الدفع
        if self.paid_amount >= self.total_amount:
            self.status = 'paid'
        elif self.is_overdue:
            self.status = 'overdue'
        
        self.save(update_fields=['subtotal', 'tax_amount', 'total_amount', 'status'])

    @transaction.atomic
    def process_invoice(self, user):
        """معالجة الفاتورة وخصم المخزون"""
        if self.status != 'draft':
            raise ValidationError("Only draft invoices can be processed")
        
        for item in self.items.all():
            item.adjust_stock(user=user)
        
        self.status = 'sent'
        self.save()
        
    def confirm_invoice(self):
            if self.status != 'draft':
                raise ValueError("Invoice already confirmed")

            with transaction.atomic():
                for item in self.items.select_for_update():
                    stock, _ = Stocks.objects.get_or_create(
                        branch=self.branch,
                        variant=item.variant,
                        defaults={'quantity_in_stock': 0}
                    )

                    before_qty = stock.quantity_in_stock
                    qty_change = item.quantity

                    # Determine if quantity is positive or negative
                    if self.invoice_type in ['purchase', 'return_sale']:
                        stock.quantity_in_stock += qty_change
                        movement_type = 'purchase'
                    elif self.invoice_type in ['sale', 'return_purchase']:
                        if stock.available_quantity < qty_change:
                            raise ValueError(f"Not enough stock for {item.variant}")
                        stock.quantity_in_stock -= qty_change
                        movement_type = 'sale'

                    stock.save()

                    StockMovements.objects.create(
                        stocks=stock,
                        movement_type=movement_type,
                        quantity=qty_change if movement_type == 'purchase' else -qty_change,
                        quantity_before=before_qty,
                        quantity_after=stock.quantity_in_stock,
                        reference_number=self.invoice_number,
                        notes=f"Invoice {self.invoice_type}"
                    )

                self.status = 'confirmed'
                self.save()

class InvoiceItem(BaseModel):
    # الحقول كما سبق
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product_variant = models.ForeignKey('products.ProductVariant', on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        self.invoice.calculate_totals()
    @transaction.atomic
    def adjust_stock(self, user, increase=False):
        """تعديل المخزون"""
        if not self.variant:
            return

        stock = Stocks.objects.select_for_update().filter(
            branch=self.invoice.branch,
            variant=self.variant
        ).first()

        if not stock:
            raise ValidationError(f"Stock record not found for {self.variant} in {self.invoice.branch}")

        if not increase and stock.available_quantity < self.quantity:
            raise ValidationError(f"Not enough stock. Available: {stock.available_quantity}, Required: {self.quantity}")

        # إنشاء حركة المخزون
        StockMovement.objects.create(
            branch=stock.branch,
            variant=self.variant,
            movement_type='in' if increase else 'out',
            quantity=self.quantity,
            unit_cost=self.unit_price,
            reference_number=self.invoice.invoice_number,
            reference_type='invoice',
            notes=f"Stock {'returned' if increase else 'sold'} via invoice {self.invoice.invoice_number}",
            created_by=user,
        )

    def __str__(self):
        product_name = self.variant.product.name if self.variant and self.variant.product else "Unknown Product"
        return f"{product_name} x {self.quantity}"




class Payment(BaseModel):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=[('cash', 'Cash'), ('card', 'Card')])


    def __str__(self):
        return f"Payment of {self.amount} for Invoice {self.invoice.invoice_number}"
    
    def save(self, *args, **kwargs):
        self.invoice.paid_amount += self.amount
        self.invoice.save()
        super().save(*args, **kwargs)


def generate_serial_number(model, prefix: str, number_field: str = 'order_number'):
    today = timezone.now().date()
    serial_prefix = f"{prefix}-{today.strftime('%Y%m%d')}"
    last_obj = model.objects.filter(
        **{f"{number_field}__startswith": serial_prefix}
    ).order_by('-created_at').first()

    if last_obj:
        try:
            last_number = int(last_obj.__dict__[number_field].split('-')[-1])
            next_number = last_number + 1
        except (ValueError, IndexError):
            next_number = 1
    else:
        next_number = 1

    return f"{serial_prefix}-{next_number:04d}"

