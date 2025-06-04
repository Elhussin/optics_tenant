from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Order, Invoice, Stock, StockMovement
from decimal import Decimal


class OrderService:
    """خدمة إدارة الطلبات"""
    
    @staticmethod
    @transaction.atomic
    def create_order_with_items(customer, branch, items_data, sales_person=None, **kwargs):
        """إنشاء طلب مع العناصر"""
        order = Order.objects.create(
            customer=customer,
            branch=branch,
            sales_person=sales_person,
            **kwargs
        )
        
        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                variant=item_data['variant'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                prescription=item_data.get('prescription'),
                notes=item_data.get('notes', ''),
            )
        
        return order
    
    @staticmethod
    @transaction.atomic
    def process_order_payment(order, amount, payment_method='cash', user=None):
        """معالجة دفع الطلب"""
        if amount <= 0:
            raise ValidationError("Payment amount must be positive")
        
        if order.paid_amount + amount > order.total_amount:
            raise ValidationError("Payment amount exceeds order total")
        
        order.paid_amount += amount
        
        # تحديث حالة الدفع
        if order.paid_amount >= order.total_amount:
            order.payment_status = 'paid'
        else:
            order.payment_status = 'partial'
        
        order.save()
        
        # إنشاء سجل الدفع (يمكن إضافة نموذج Payment منفصل)
        # Payment.objects.create(...)
        
        return order
    
    @staticmethod
    def get_order_statistics(branch=None, date_from=None, date_to=None):
        """إحصائيات الطلبات"""
        queryset = Order.objects.all()
        
        if branch:
            queryset = queryset.filter(branch=branch)
        
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return {
            'total_orders': queryset.count(),
            'total_revenue': queryset.aggregate(total=models.Sum('total_amount'))['total'] or 0,
            'paid_orders': queryset.filter(payment_status='paid').count(),
            'pending_orders': queryset.filter(status='pending').count(),
            'confirmed_orders': queryset.filter(status='confirmed').count(),
        }


class InventoryService:
    """خدمة إدارة المخزون"""
    
    @staticmethod
    @transaction.atomic
    def adjust_stock(branch, variant, new_quantity, user, reason="Manual adjustment"):
        """تعديل المخزون"""
        stock, created = Stock.objects.get_or_create(
            branch=branch,
            variant=variant,
            defaults={'stock_quantity': 0}
        )
        
        old_quantity = stock.stock_quantity
        difference = new_quantity - old_quantity
        
        # إنشاء حركة المخزون
        StockMovement.objects.create(
            branch=branch,
            variant=variant,
            movement_type='adjustment',
            quantity=new_quantity,
            reference_type='manual',
            notes=f"{reason}. Changed from {old_quantity} to {new_quantity}",
            created_by=user,
        )
        
        return stock
    
    @staticmethod
    @transaction.atomic
    def transfer_stock(from_branch, to_branch, variant, quantity, user, reference_number=""):
        """نقل المخزون بين الفروع"""
        # التحقق من توفر المخزون في الفرع المرسل
        from_stock = Stock.objects.filter(branch=from_branch, variant=variant).first()
        if not from_stock or from_stock.available_quantity < quantity:
            raise ValidationError(f"Insufficient stock in {from_branch}")
        
        # خصم من الفرع المرسل
        StockMovement.objects.create(
            branch=from_branch,
            variant=variant,
            movement_type='transfer_out',
            quantity=quantity,
            reference_number=reference_number,
            reference_type='manual',
            notes=f"Transfer to {to_branch}",
            created_by=user,
        )
        
        # إضافة للفرع المستقبل
        StockMovement.objects.create(
            branch=to_branch,
            variant=variant,
            movement_type='transfer_in',
            quantity=quantity,
            reference_number=reference_number,
            reference_type='manual',
            notes=f"Transfer from {from_branch}",
            created_by=user,
        )
        
        return True
    
    @staticmethod
    def get_stock_report(branch=None, low_stock_only=False):
        """تقرير المخزون"""
        queryset = Stock.objects.select_related('variant__product', 'branch')
        
        if branch:
            queryset = queryset.filter(branch=branch)
        
        if low_stock_only:
            queryset = queryset.filter(stock_quantity__lte=models.F('minimum_stock_level'))
        
        return queryset.order_by('branch', 'variant__product__name')
    
    @staticmethod
    def get_stock_movements(branch=None, variant=None, date_from=None, date_to=None):
        """تقرير حركات المخزون"""
        queryset = StockMovement.objects.select_related('variant__product', 'branch')
        
        if branch:
            queryset = queryset.filter(branch=branch)
        
        if variant:
            queryset = queryset.filter(variant=variant)
        
        if date_from:
            queryset = queryset.filter(movement_date__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(movement_date__lte=date_to)
        
        return queryset.order_by('-movement_date')


class InvoiceService:
    """خدمة إدارة الفواتير"""
    
    @staticmethod
    @transaction.atomic
    def create_invoice_from_order(order, user):
        """إنشاء فاتورة من الطلب"""
        if order.status != 'delivered':
            raise ValidationError("Order must be delivered to create invoice")
        
        invoice = Invoice.objects.create(
            customer=order.customer,
            branch=order.branch,
            order=order,
            subtotal=order.subtotal,
            tax_rate=order.tax_rate,
            tax_amount=order.tax_amount,
            discount_amount=order.discount_amount,
            total_amount=order.total_amount,
            notes=f"Generated from order {order.order_number}",
        )
        
        # نسخ عناصر الطلب
        for order_item in order.items.all():
            InvoiceItem.objects.create(
                invoice=invoice,
                variant=order_item.variant,
                quantity=order_item.quantity,
                unit_price=order_item.unit_price,
            )
        
        # معالجة الفاتورة وخصم المخزون
        invoice.process_invoice(user)
        
        return invoice
    
    @staticmethod
    @transaction.atomic
    def process_invoice_payment(invoice, amount, payment_method='cash'):
        """معالجة دفع الفاتورة"""
        if amount <= 0:
            raise ValidationError("Payment amount must be positive")
        
        if invoice.paid_amount + amount > invoice.total_amount:
            raise ValidationError("Payment amount exceeds invoice total")
        
        invoice.paid_amount += amount
        
        if invoice.paid_amount >= invoice.total_amount:
            invoice.status = 'paid'
        
        invoice.save()
        
        return invoice
    
    @staticmethod
    def get_invoice_statistics(branch=None, date_from=None, date_to=None):
        """إحصائيات الفواتير"""
        queryset = Invoice.objects.all()
        
        if branch:
            queryset = queryset.filter(branch=branch)
        
        if date_from:
            queryset = queryset.filter(date_created__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(date_created__lte=date_to)
        
        return {
            'total_invoices': queryset.count(),
            'total_amount': queryset.aggregate(total=models.Sum('total_amount'))['total'] or 0,
            'paid_invoices': queryset.filter(status='paid').count(),
            'overdue_invoices': queryset.filter(status='overdue').count(),
            'total_paid': queryset.aggregate(total=models.Sum('paid_amount'))['total'] or 0,
        }

