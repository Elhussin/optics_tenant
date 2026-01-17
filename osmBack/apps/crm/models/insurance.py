# apps/crm/models/insurance.py
"""
نماذج إدارة مطالبات التأمين
"""

from django.db import models, transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from core.models import BaseModel
from decimal import Decimal
import time


class InsuranceClaim(BaseModel):
    """
    مطالبة تأمين - تتبع عملية المطالبة من التقديم للسداد
    """
    CLAIM_STATUS = [
        ('draft', 'مسودة'),
        ('submitted', 'تم التقديم'),
        ('under_review', 'قيد المراجعة'),
        ('approved', 'معتمدة'),
        ('partial', 'معتمدة جزئياً'),
        ('rejected', 'مرفوضة'),
        ('paid', 'تم السداد'),
        ('cancelled', 'ملغاة'),
    ]

    # الربط بالطلب والشريك
    order = models.ForeignKey(
        'sales.Order',
        on_delete=models.CASCADE,
        related_name='insurance_claims'
    )
    partner = models.ForeignKey(
        'crm.Partner',
        on_delete=models.PROTECT,
        related_name='claims'
    )
    customer_partner_link = models.ForeignKey(
        'crm.CustomerPartnerLink',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='claims'
    )

    # رقم المطالبة
    claim_number = models.CharField(max_length=50, unique=True, editable=False)
    external_claim_number = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="رقم المطالبة لدى الشركة"
    )

    # التواريخ
    claim_date = models.DateField(
        auto_now_add=True, verbose_name="تاريخ المطالبة")
    submission_date = models.DateField(
        null=True, blank=True, verbose_name="تاريخ التقديم")
    response_date = models.DateField(
        null=True, blank=True, verbose_name="تاريخ الرد")
    payment_date = models.DateField(
        null=True, blank=True, verbose_name="تاريخ السداد")

    # المبالغ
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="إجمالي المبلغ"
    )
    claim_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="المبلغ المطالب به",
        help_text="المبلغ المطلوب من شركة التأمين"
    )
    approved_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name="المبلغ المعتمد"
    )
    paid_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name="المبلغ المسدد"
    )
    patient_share = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name="حصة المريض"
    )

    # الحالة
    status = models.CharField(
        max_length=20,
        choices=CLAIM_STATUS,
        default='draft',
        verbose_name="الحالة"
    )

    # السبب في حالة الرفض
    rejection_reason = models.TextField(blank=True, verbose_name="سبب الرفض")
    partial_reason = models.TextField(
        blank=True, verbose_name="سبب الاعتماد الجزئي")

    # معلومات إضافية
    notes = models.TextField(blank=True, verbose_name="ملاحظات")
    internal_notes = models.TextField(
        blank=True, verbose_name="ملاحظات داخلية")

    # المستندات المرفقة
    documents = models.JSONField(default=list, blank=True)

    class Meta:
        verbose_name = "مطالبة تأمين"
        verbose_name_plural = "مطالبات التأمين"
        ordering = ['-claim_date']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['claim_date']),
            models.Index(fields=['partner', 'status']),
        ]

    def __str__(self):
        return f"Claim {self.claim_number} - {self.partner.name}"

    def save(self, *args, **kwargs):
        if not self.claim_number:
            self._save_with_retry(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def _save_with_retry(self, *args, **kwargs):
        """حفظ مع إعادة المحاولة في حالة تكرار الرقم"""
        max_retries = 5
        for i in range(max_retries):
            try:
                self.claim_number = self._generate_claim_number()
                with transaction.atomic():
                    super().save(*args, **kwargs)
                return
            except Exception:
                if i == max_retries - 1:
                    raise
                time.sleep(0.1)

    def _generate_claim_number(self):
        """توليد رقم مطالبة فريد"""
        today = timezone.now()
        prefix = f"CLM{today.strftime('%Y%m')}"

        last_claim = InsuranceClaim.objects.filter(
            claim_number__startswith=prefix
        ).order_by('-claim_number').first()

        if last_claim:
            last_num = int(last_claim.claim_number[-4:])
            new_num = last_num + 1
        else:
            new_num = 1

        return f"{prefix}{new_num:04d}"

    def calculate_amounts(self):
        """حساب المبالغ بناءً على تغطية العميل"""
        if self.customer_partner_link:
            link = self.customer_partner_link
            self.patient_share = link.get_copay_amount(self.total_amount)
        else:
            # استخدام نسبة الشريك الافتراضية
            percentage = self.partner.patient_share_percentage
            self.patient_share = self.total_amount * percentage / 100

        self.claim_amount = self.total_amount - self.patient_share
        return self.claim_amount

    def submit(self):
        """تقديم المطالبة"""
        if self.status != 'draft':
            raise ValidationError("يمكن تقديم المطالبات المسودة فقط")

        self.status = 'submitted'
        self.submission_date = timezone.now().date()
        self.save()
        return self

    def approve(self, approved_amount=None, notes=""):
        """اعتماد المطالبة"""
        if self.status not in ['submitted', 'under_review']:
            raise ValidationError("لا يمكن اعتماد هذه المطالبة")

        self.response_date = timezone.now().date()

        if approved_amount is None:
            approved_amount = self.claim_amount

        self.approved_amount = approved_amount

        if approved_amount >= self.claim_amount:
            self.status = 'approved'
        elif approved_amount > 0:
            self.status = 'partial'
            self.partial_reason = notes
        else:
            self.status = 'rejected'
            self.rejection_reason = notes

        self.save()
        return self

    def reject(self, reason=""):
        """رفض المطالبة"""
        if self.status not in ['submitted', 'under_review']:
            raise ValidationError("لا يمكن رفض هذه المطالبة")

        self.status = 'rejected'
        self.response_date = timezone.now().date()
        self.approved_amount = 0
        self.rejection_reason = reason
        self.save()
        return self

    def mark_paid(self, amount=None, payment_reference=""):
        """تسجيل السداد"""
        if self.status not in ['approved', 'partial']:
            raise ValidationError("يمكن تسجيل السداد للمطالبات المعتمدة فقط")

        self.paid_amount = amount or self.approved_amount
        self.payment_date = timezone.now().date()
        self.status = 'paid'

        if payment_reference:
            self.notes += f"\nرقم مرجع السداد: {payment_reference}"

        # تحديث رصيد الشريك
        self.partner.current_balance -= self.paid_amount
        self.partner.save(update_fields=['current_balance'])

        self.save()
        return self


class ClaimItem(BaseModel):
    """
    عناصر المطالبة - تفصيل المنتجات في المطالبة
    """
    claim = models.ForeignKey(
        InsuranceClaim,
        on_delete=models.CASCADE,
        related_name='items'
    )
    order_item = models.ForeignKey(
        'sales.OrderItem',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # تفاصيل المنتج
    description = models.CharField(max_length=200, verbose_name="الوصف")
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    # المبالغ
    claim_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="المبلغ المطالب"
    )
    approved_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="المبلغ المعتمد"
    )

    # كود التأمين للمنتج
    insurance_code = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name = "عنصر مطالبة"
        verbose_name_plural = "عناصر المطالبات"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class ClaimDocument(BaseModel):
    """
    مستندات المطالبة (وصفات، فواتير، تقارير)
    """
    DOCUMENT_TYPES = [
        ('prescription', 'وصفة طبية'),
        ('invoice', 'فاتورة'),
        ('report', 'تقرير طبي'),
        ('authorization', 'موافقة مسبقة'),
        ('other', 'أخرى'),
    ]

    claim = models.ForeignKey(
        InsuranceClaim,
        on_delete=models.CASCADE,
        related_name='attached_documents'
    )

    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='claims/documents/')
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "مستند مطالبة"
        verbose_name_plural = "مستندات المطالبات"

    def __str__(self):
        return f"{self.title} - {self.claim.claim_number}"


class PartnerSettlement(BaseModel):
    """
    تسوية مالية مع الشريك (دفعة شهرية مثلاً)
    """
    SETTLEMENT_STATUS = [
        ('pending', 'قيد الانتظار'),
        ('confirmed', 'مؤكدة'),
        ('paid', 'مسددة'),
        ('disputed', 'متنازع عليها'),
    ]

    partner = models.ForeignKey(
        'crm.Partner',
        on_delete=models.CASCADE,
        related_name='settlements'
    )

    settlement_number = models.CharField(max_length=50, unique=True)
    settlement_date = models.DateField(auto_now_add=True)
    period_start = models.DateField(verbose_name="من تاريخ")
    period_end = models.DateField(verbose_name="إلى تاريخ")

    # المبالغ
    total_claims = models.PositiveIntegerField(
        default=0, verbose_name="عدد المطالبات")
    total_amount = models.DecimalField(
        max_digits=12, decimal_places=2, verbose_name="إجمالي المبلغ")
    adjustments = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, verbose_name="التعديلات")
    net_amount = models.DecimalField(
        max_digits=12, decimal_places=2, verbose_name="صافي المبلغ")

    status = models.CharField(
        max_length=20, choices=SETTLEMENT_STATUS, default='pending')
    payment_date = models.DateField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "تسوية مالية"
        verbose_name_plural = "التسويات المالية"
        ordering = ['-settlement_date']

    def calculate_from_claims(self):
        """حساب التسوية من المطالبات المعتمدة"""
        claims = InsuranceClaim.objects.filter(
            partner=self.partner,
            status__in=['approved', 'partial'],
            claim_date__range=[self.period_start, self.period_end]
        )

        self.total_claims = claims.count()
        self.total_amount = sum(c.approved_amount for c in claims)
        self.net_amount = self.total_amount + self.adjustments

        return self
