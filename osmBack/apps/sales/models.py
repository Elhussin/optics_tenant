# models.py - Refactored for Thread Safety

from django.db import models, transaction, IntegrityError
from django.utils.translation import gettext_lazy as _
from apps.crm.models import Customer
from apps.branches.models import Branch, BranchUsers
from core.models import BaseModel
from apps.products.models import ProductVariant
from apps.prescriptions.models import PrescriptionRecord
from decimal import Decimal
import time

# Services (Assuming they exist as imported)
from apps.sales.services.order_service import confirm_order, cancel_order, calculate_order_totals
from apps.sales.services.invoice_service import confirm_invoice, calculate_invoice_totals
from apps.sales.services.payment_service import apply_payment


class BaseDocument(BaseModel):
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL,
                               null=True, blank=True, related_name='%(class)s_branch')
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name='%(class)s_customer')

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_rate = models.DecimalField(
        max_digits=5, decimal_places=4, default=Decimal('0.15'))
    tax_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0)

    class Meta:
        abstract = True

    @property
    def remaining_amount(self):
        return self.total_amount - self.paid_amount

    @property
    def is_fully_paid(self):
        return self.paid_amount >= self.total_amount


class BaseItem(BaseModel):
    product_variant = models.ForeignKey(
        ProductVariant, on_delete=models.SET_NULL, null=True, related_name='%(class)s_variant')
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(
        max_digits=12, decimal_places=2, editable=False)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class Order(BaseDocument):
    ORDER_TYPE_CHOICES = [
        ('cash', 'نقدي'),
        ('credit', 'آجل'),
        ('insurance', 'تأمين'),
        ('bnpl', 'تقسيط'),           # Tabby, Tamara
        ('corporate', 'شركات'),
        ('wholesale', 'جملة'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'نقدي'),
        ('card', 'بطاقة'),
        ('bank_transfer', 'تحويل بنكي'),
        ('mada', 'مدى'),
        ('visa', 'فيزا'),
        ('master', 'ماستر كارد'),
        ('apple_pay', 'Apple Pay'),
        ('stc_pay', 'STC Pay'),
        ('tabby', 'تابي'),
        ('tamara', 'تمارا'),
        ('insurance', 'تأمين'),
        ('credit', 'آجل'),
        ('mixed', 'مختلط'),
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

    # نوع الطلب (يحدد سير العمل)
    order_type = models.CharField(
        max_length=20, choices=ORDER_TYPE_CHOICES, default='cash')
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')

    # الدفع
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')

    # ربط بالشريك (تأمين/تقسيط/شركة)
    partner = models.ForeignKey(
        'crm.Partner',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name="الشريك"
    )
    customer_partner_link = models.ForeignKey(
        'crm.CustomerPartnerLink',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name="ربط العميل بالشريك"
    )

    # مبالغ إضافية للتأمين/التقسيط
    partner_share = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name="حصة الشريك",
        help_text="المبلغ المستحق من الشريك (تأمين/تقسيط)"
    )
    customer_share = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name="حصة العميل",
        help_text="المبلغ المستحق من العميل مباشرة"
    )

    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    expected_delivery = models.DateTimeField(null=True, blank=True)
    sales_person = models.ForeignKey(
        BranchUsers, on_delete=models.SET_NULL, null=True, blank=True)

    # Legacy compatibility
    @property
    def payment_type(self):
        return self.payment_method

    def __str__(self):
        return f"Order {self.order_number} - {self.customer.full_name}"

    def calculate_partner_shares(self):
        """حساب توزيع المبالغ بين العميل والشريك"""
        if self.order_type in ['insurance', 'bnpl', 'corporate'] and self.partner:
            if self.customer_partner_link:
                self.customer_share = self.customer_partner_link.get_copay_amount(
                    self.total_amount)
            elif self.partner:
                percentage = self.partner.patient_share_percentage
                self.customer_share = self.total_amount * percentage / 100

            self.partner_share = self.total_amount - self.customer_share
        else:
            self.customer_share = self.total_amount
            self.partner_share = 0

        return self.customer_share, self.partner_share

    def save(self, *args, **kwargs):
        if not self.order_number:
            self._save_with_retry(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def _save_with_retry(self, *args, **kwargs):
        # Retry logic for unique constaint violation on order_number
        from apps.sales.utils import generate_serial_number
        max_retries = 5
        for i in range(max_retries):
            try:
                self.order_number = generate_serial_number(
                    Order, 'ORD', 'order_number')
                with transaction.atomic():
                    super().save(*args, **kwargs)
                return  # Success
            except IntegrityError:
                if i == max_retries - 1:
                    raise  # Give up
                time.sleep(0.1)  # Small backoff

    def calculate_totals(self):
        return calculate_order_totals(self)

    def confirm(self, user):
        return confirm_order(self, user)

    def cancel(self, user):
        return cancel_order(self, user)


class OrderItem(BaseItem):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='items')
    prescription = models.ForeignKey(
        PrescriptionRecord, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')

    def __str__(self):
        return f"{self.product_variant.product.model} - {self.quantity}"


class Invoice(BaseDocument):
    INVOICE_TYPES = [('purchase', 'Purchase'), ('sale', 'Sale'),
                     ('return_purchase', 'Return Purchase'), ('return_sale', 'Return Sale')]
    INVOICE_STATUS = [('draft', 'Draft'), ('paid', 'Paid'), ('partially_paid',
                                                             'Partially Paid'), ('overdue', 'Overdue'), ('confirmed', 'Confirmed')]

    invoice_number = models.CharField(
        max_length=50, unique=True, editable=False)
    invoice_type = models.CharField(
        max_length=20, choices=INVOICE_TYPES, default='sale')
    created_by = models.ForeignKey(
        BranchUsers, on_delete=models.SET_NULL, null=True, related_name='%(class)s_created_by')
    order = models.ForeignKey(Order, on_delete=models.SET_NULL,
                              null=True, blank=True, related_name='%(class)s_order')
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=INVOICE_STATUS, default='draft')
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.customer.first_name}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self._save_with_retry(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def _save_with_retry(self, *args, **kwargs):
        from apps.sales.utils import generate_serial_number
        max_retries = 5
        for i in range(max_retries):
            try:
                self.invoice_number = generate_serial_number(
                    Invoice, 'INV', 'invoice_number')
                with transaction.atomic():
                    super().save(*args, **kwargs)
                return
            except IntegrityError:
                if i == max_retries - 1:
                    raise
                time.sleep(0.1)

    def calculate_totals(self):
        return calculate_invoice_totals(self)

    def confirm(self):
        return confirm_invoice(self)


class InvoiceItem(BaseItem):
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name='items')


class Payment(BaseModel):
    """
    نموذج الدفعات - يدعم طرق دفع متعددة وتقسيط
    """
    PAYMENT_METHOD_CHOICES = [
        # الدفع المباشر
        ('cash', 'نقدي'),
        ('card', 'بطاقة'),
        ('bank_transfer', 'تحويل بنكي'),
        ('cheque', 'شيك'),

        # بطاقات محلية
        ('mada', 'مدى'),
        ('visa', 'فيزا'),
        ('mastercard', 'ماستر كارد'),
        ('amex', 'أمريكان إكسبريس'),

        # المحافظ الرقمية
        ('apple_pay', 'Apple Pay'),
        ('stc_pay', 'STC Pay'),
        ('urpay', 'URPay'),

        # شركات التقسيط (BNPL)
        ('tabby', 'تابي'),
        ('tamara', 'تمارا'),
        ('postpay', 'بوست باي'),
        ('spotii', 'سبوتي'),

        # التأمين والائتمان
        ('insurance', 'تأمين'),
        ('credit', 'آجل'),
        ('partner', 'شريك'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('processing', 'جاري المعالجة'),
        ('completed', 'مكتمل'),
        ('failed', 'فشل'),
        ('cancelled', 'ملغي'),
        ('refunded', 'مسترجع'),
        ('partially_refunded', 'مسترجع جزئياً'),
    ]

    # الربط بالفاتورة أو الطلب
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE,
        related_name='payments',
        null=True, blank=True
    )
    order = models.ForeignKey(
        'Order', on_delete=models.CASCADE,
        related_name='payments',
        null=True, blank=True
    )

    # معلومات الدفع الأساسية
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='SAR')
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )

    # للشريك (تأمين/تقسيط)
    partner = models.ForeignKey(
        'crm.Partner',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='payments'
    )

    # معلومات بوابة الدفع
    gateway_transaction_id = models.CharField(max_length=100, blank=True)
    gateway_reference = models.CharField(max_length=100, blank=True)
    gateway_response = models.JSONField(default=dict, blank=True)

    # معلومات التقسيط (BNPL)
    is_installment = models.BooleanField(default=False)
    installments_count = models.PositiveIntegerField(default=1)
    installment_amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True
    )
    bnpl_order_id = models.CharField(max_length=100, blank=True)

    # معلومات البطاقة (مشفرة/مخفية)
    card_last_four = models.CharField(max_length=4, blank=True)
    card_brand = models.CharField(max_length=20, blank=True)

    # معلومات الشيك
    cheque_number = models.CharField(max_length=50, blank=True)
    cheque_bank = models.CharField(max_length=100, blank=True)
    cheque_date = models.DateField(null=True, blank=True)

    # معلومات التحويل البنكي
    transfer_reference = models.CharField(max_length=100, blank=True)
    transfer_bank = models.CharField(max_length=100, blank=True)

    # التواريخ
    paid_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    refund_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        default=0
    )

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "دفعة"
        verbose_name_plural = "الدفعات"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['payment_method']),
            models.Index(fields=['invoice', 'status']),
        ]

    def __str__(self):
        target = self.invoice or self.order
        return f"Payment of {self.amount} {self.currency} via {self.get_payment_method_display()}"

    def save(self, *args, **kwargs):
        # حساب مبلغ القسط
        if self.is_installment and self.installments_count > 1:
            self.installment_amount = self.amount / self.installments_count

        super().save(*args, **kwargs)

        # تحديث الفاتورة عند اكتمال الدفع
        if self.status == 'completed' and self.invoice:
            apply_payment(self.invoice, self.amount)

    def mark_completed(self, transaction_id=None, response=None):
        """تحديث حالة الدفع لمكتمل"""
        from django.utils import timezone

        self.status = 'completed'
        self.paid_at = timezone.now()
        if transaction_id:
            self.gateway_transaction_id = transaction_id
        if response:
            self.gateway_response = response
        self.save()

    def mark_failed(self, reason=None):
        """تحديث حالة الدفع لفاشل"""
        self.status = 'failed'
        if reason:
            self.notes += f"\nسبب الفشل: {reason}"
        self.save()

    def refund(self, amount=None, reason=None):
        """استرجاع الدفعة"""
        from django.utils import timezone

        refund_amount = amount or self.amount
        if refund_amount > (self.amount - self.refund_amount):
            raise ValueError("مبلغ الاسترجاع أكبر من المتبقي")

        self.refund_amount += refund_amount
        self.refunded_at = timezone.now()

        if self.refund_amount >= self.amount:
            self.status = 'refunded'
        else:
            self.status = 'partially_refunded'

        if reason:
            self.notes += f"\nسبب الاسترجاع: {reason}"

        self.save()
        return refund_amount


class Installment(BaseModel):
    """
    أقساط الدفعات - لتتبع أقساط BNPL
    """
    INSTALLMENT_STATUS = [
        ('pending', 'قيد الانتظار'),
        ('due', 'مستحق'),
        ('paid', 'مسدد'),
        ('overdue', 'متأخر'),
        ('cancelled', 'ملغي'),
    ]

    payment = models.ForeignKey(
        Payment, on_delete=models.CASCADE,
        related_name='installments'
    )

    installment_number = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=INSTALLMENT_STATUS,
        default='pending'
    )

    paid_at = models.DateTimeField(null=True, blank=True)
    paid_amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0
    )

    class Meta:
        verbose_name = "قسط"
        verbose_name_plural = "الأقساط"
        ordering = ['payment', 'installment_number']
        unique_together = ['payment', 'installment_number']

    def __str__(self):
        return f"قسط {self.installment_number} من {self.payment}"

    def mark_paid(self, amount=None):
        """تسجيل سداد القسط"""
        from django.utils import timezone

        self.status = 'paid'
        self.paid_at = timezone.now()
        self.paid_amount = amount or self.amount
        self.save()
