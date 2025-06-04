# models.py - النماذج المحسنة
from django.db import models, transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models import Sum, F
from django.contrib.auth.models import User
from users.models import Customer, Branch, BranchUsers
from core.models import BaseModel
from products.models import Product, ProductVariant
from prescriptions.models import PrescriptionRecord
from decimal import Decimal
import datetime
from products.utils import generate_serial_number

class InventoryDocument(BaseModel):
    DOCUMENT_TYPES = [
        ('purchase', 'Purchase Receipt'),
        ('sale', 'Sale Issue'),
        ('adjustment', 'Adjustment'),
        ('transfer', 'Transfer'),
        ('return', 'Return'),
        ('damage', 'Damage'),
    ]

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.get_document_type_display()} #{self.id}"

    @transaction.atomic
    def process_document(self, user):
        """معالجة المستند وتطبيق التغييرات على المخزون"""
        if self.is_processed:
            raise ValidationError("Document already processed")
        
        for line_item in self.line_items.all():
            line_item.apply_to_stock()
        
        self.is_processed = True
        self.processed_at = timezone.now()
        self.processed_by = user
        self.save()


class InventoryLineItem(models.Model):
    document = models.ForeignKey(InventoryDocument, related_name="line_items", on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    from_branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='outgoing_items')
    to_branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='incoming_items')

    def __str__(self):
        return f"{self.variant} x {self.quantity}"

    def apply_to_stock(self):
        """تطبيق التغيير على المخزون"""
        movement_type_map = {
            'purchase': 'in',
            'sale': 'out',
            'adjustment': 'adjustment',
            'transfer': 'transfer_out' if self.from_branch else 'transfer_in',
            'return': 'return',
            'damage': 'damage',
        }
        
        movement_type = movement_type_map.get(self.document.document_type, 'adjustment')
        
        # إنشاء حركة المخزون
        StockMovement.objects.create(
            branch=self.document.branch,
            variant=self.variant,
            movement_type=movement_type,
            quantity=self.quantity,
            reference_number=self.document.reference_number,
            reference_type='manual',
            notes=f"From document {self.document.id}",
            created_by=self.document.processed_by or self.document.created_by,
        )


class Stock(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='stocks')
    quantity_reserved = models.IntegerField(default=0)
    stock_quantity = models.IntegerField(default=0)
    minimum_stock_level = models.IntegerField(default=2)
    max_stock_level = models.IntegerField(default=100)
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('branch', 'variant')
        indexes = [
            models.Index(fields=['branch', 'variant']),
            models.Index(fields=['stock_quantity']),
        ]

    @property
    def available_quantity(self):
        return max(self.stock_quantity - self.quantity_reserved, 0)

    @property
    def needs_reorder(self):
        return self.available_quantity <= self.minimum_stock_level

    def reserve_stock(self, quantity):
        """حجز المخزون"""
        if quantity > self.available_quantity:
            raise ValidationError(f"Cannot reserve {quantity}. Available: {self.available_quantity}")
        self.quantity_reserved += quantity
        self.save()

    def release_reservation(self, quantity):
        """إلغاء حجز المخزون"""
        self.quantity_reserved = max(self.quantity_reserved - quantity, 0)
        self.save()

    def update_average_cost(self, new_quantity, new_cost):
        """تحديث التكلفة المتوسطة"""
        if self.stock_quantity > 0:
            total_cost = (self.stock_quantity * self.average_cost) + (new_quantity * new_cost)
            total_quantity = self.stock_quantity + new_quantity
            self.average_cost = total_cost / total_quantity if total_quantity > 0 else new_cost
        else:
            self.average_cost = new_cost
        self.last_cost = new_cost


class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('in', 'In'),
        ('out', 'Out'),
        ('adjustment', 'Adjustment'),
        ('transfer_in', 'Transfer In'),
        ('transfer_out', 'Transfer Out'),
        ('return', 'Return'),
        ('damage', 'Damage'),
        ('reserve', 'Reserve'),
        ('release', 'Release'),
    ]
    REFERENCE_TYPES = [
        ('sale', 'Sale'),
        ('purchase', 'Purchase'),
        ('manual', 'Manual'),
        ('order', 'Order'),
        ('invoice', 'Invoice'),
    ]

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reference_number = models.CharField(max_length=100, blank=True)
    reference_type = models.CharField(max_length=20, choices=REFERENCE_TYPES)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    movement_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['branch', 'variant', 'movement_date']),
            models.Index(fields=['reference_number', 'reference_type']),
        ]

    def clean(self):
        if self.movement_type in ['out', 'damage', 'transfer_out']:
            stock = Stock.objects.filter(branch=self.branch, variant=self.variant).first()
            if stock and self.quantity > stock.available_quantity:
                raise ValidationError(f"Insufficient stock. Available: {stock.available_quantity}")

    @transaction.atomic
    def save(self, *args, **kwargs):
        is_new = self._state.adding
        if is_new:
            self.full_clean()
        
        super().save(*args, **kwargs)
        
        if is_new:
            self.apply_stock_change()

    def apply_stock_change(self):
        """تطبيق التغيير على المخزون"""
        stock, created = Stock.objects.select_for_update().get_or_create(
            branch=self.branch,
            variant=self.variant,
            defaults={
                'stock_quantity': 0,
                'quantity_reserved': 0,
                'average_cost': self.unit_cost or self.variant.cost_price,
                'last_cost': self.unit_cost or self.variant.cost_price,
            }
        )

        if self.movement_type == 'in':
            stock.stock_quantity += self.quantity
            if self.unit_cost > 0:
                stock.update_average_cost(self.quantity, self.unit_cost)
        elif self.movement_type in ['out', 'damage', 'transfer_out']:
            stock.stock_quantity = max(stock.stock_quantity - self.quantity, 0)
        elif self.movement_type in ['return', 'transfer_in']:
            stock.stock_quantity += self.quantity
        elif self.movement_type == 'adjustment':
            stock.stock_quantity = self.quantity
        elif self.movement_type == 'reserve':
            stock.reserve_stock(self.quantity)
        elif self.movement_type == 'release':
            stock.release_reservation(self.quantity)

        stock.save()


class Order(BaseModel):
    ORDER_TYPE_CHOICES = [
        ('cash', 'Cash'),
        ('credit', 'Credit'),
        ('insurance', 'Insurance'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('ready', 'Ready'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
        ('disputed', 'Disputed'),
    ]

    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='cash')
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)
    sales_person = models.ForeignKey(BranchUsers, on_delete=models.SET_NULL, null=True, blank=True)

    # Order status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Financial information
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.15'))  # 15%
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Additional information
    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)
    
    # Important dates
    confirmed_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    expected_delivery = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Order {self.order_number} - {self.customer.full_name if hasattr(self.customer, 'full_name') else self.customer}"

    @property
    def remaining_amount(self):
        return max(self.total_amount - self.paid_amount, 0)

    @property
    def is_fully_paid(self):
        return self.paid_amount >= self.total_amount

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)

    def generate_order_number(self):
        return generate_serial_number(Order, 'ORD')



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
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Prescription information
    prescription = models.ForeignKey(PrescriptionRecord, on_delete=models.SET_NULL, null=True, blank=True)
    
    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    def __str__(self):
        product_name = self.variant.product.name if self.variant and self.variant.product else "Unknown Product"
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
    INVOICE_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
        ('overdue', 'Overdue'),
    ]

  


    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    
    date_created = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=INVOICE_STATUS_CHOICES, default='draft')
    notes = models.TextField(blank=True)

    # Financial information
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.15'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        customer_name = self.customer.full_name if hasattr(self.customer, 'full_name') else str(self.customer)
        return f"Invoice {self.invoice_number} - {customer_name}"

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


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        
        # تحديث مجاميع الفاتورة
        # self.invoice.calculate_totals()

    @transaction.atomic
    def adjust_stock(self, user, increase=False):
        """تعديل المخزون"""
        if not self.variant:
            return

        stock = Stock.objects.select_for_update().filter(
            branch=self.invoice.branch,
            variant=self.variant
        ).first()

        if not stock:
            raise ValidationError(f"Stock record not found for {self.variant} in {self.invoice.branch}")

        if not increase and stock.available_quantity < self.quantity:
            raise ValidationError(f"Not enough stock. Available: {stock.available_quantity}, Required: {self.quantity}")

        # إنشاء حركة المخزون
        StockMovement.objects.create(
            branch=self.invoice.branch,
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