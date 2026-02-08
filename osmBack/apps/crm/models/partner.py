# apps/crm/models/partner.py
"""
نماذج الشركاء (التأمين، التقسيط، شركات العملاء، تجار الجملة)
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel


class Partner(BaseModel):
    """
    شريك أعمال - يمثل:
    - شركة تأمين (AXA, BUPA, Tawuniya, Medgulf)
    - شركة تقسيط (Tabby, Tamara)
    - شركة عملاء (موظفي شركة معينة)
    - تاجر جملة
    - وكيل
    """
    PARTNER_TYPES = [
        ('insurance', _('Insurance Company')),
        ('bnpl', _('BNPL Provider')),           # Buy Now Pay Later
        ('corporate', _('Corporate Client')),       # Corporate clients
        ('wholesaler', _('Wholesaler')),
        ('agent', _('Agent')),
    ]

    PAYMENT_TERMS = [
        ('immediate', _('Immediate')),
        ('7_days', _('7 Days')),
        ('15_days', _('15 Days')),
        ('30_days', _('30 Days')),
        ('60_days', _('60 Days')),
        ('90_days', _('90 Days')),
    ]

    # المعلومات الأساسية
    name = models.CharField(max_length=200, verbose_name=_('Partner Name'))
    name_en = models.CharField(
        max_length=200, blank=True, verbose_name=_('English Name'))
    partner_type = models.CharField(
        max_length=20, choices=PARTNER_TYPES, verbose_name=_('Partner Type'))
    code = models.CharField(max_length=20, unique=True,
                            blank=True, verbose_name=_('Partner Code'))
    logo = models.ImageField(
        upload_to='partners/logos/', null=True, blank=True)

    # معلومات الاتصال
    contact_person = models.CharField(
        max_length=100, blank=True, verbose_name=_('Contact Person'))
    phone = models.CharField(max_length=20, blank=True,
                             verbose_name=_('Phone'))
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    website = models.URLField(blank=True, verbose_name=_('Website'))
    address = models.TextField(blank=True, verbose_name=_('Address'))

    # معلومات العقد
    contract_number = models.CharField(
        max_length=50, blank=True, verbose_name=_('Contract Number'))
    contract_start = models.DateField(
        null=True, blank=True, verbose_name=_('Contract Start Date'))
    contract_end = models.DateField(
        null=True, blank=True, verbose_name=_('Contract End Date'))
    contract_document = models.FileField(
        upload_to='partners/contracts/', null=True, blank=True)

    # الشروط المالية
    payment_terms = models.CharField(
        max_length=20,
        choices=PAYMENT_TERMS,
        default='30_days',
        verbose_name=_('Payment Terms')
    )
    default_discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name=_('Default Discount %')
    )

    # حد الائتمان والرصيد
    credit_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name=_('Credit Limit')
    )
    current_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name=_('Current Balance'),
        help_text=_('Amount due from/to partner')
    )

    # للتأمين: نسبة تغطية العميل (ما يدفعه العميل)
    patient_share_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=20,
        verbose_name=_('Patient Share %'),
        help_text=_('Percentage paid by the patient (for insurance)')
    )

    # معلومات إضافية
    tax_number = models.CharField(
        max_length=50, blank=True, verbose_name=_('Tax Number'))
    notes = models.TextField(blank=True, verbose_name=_('Notes'))

    class Meta:
        verbose_name = _('Partner')
        verbose_name_plural = _('Partners')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_partner_type_display()})"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_code()
        super().save(*args, **kwargs)

    def generate_code(self):
        """توليد رمز فريد للشريك"""
        prefix_map = {
            'insurance': 'INS',
            'bnpl': 'BNP',
            'corporate': 'COR',
            'wholesaler': 'WHL',
            'agent': 'AGT',
        }
        prefix = prefix_map.get(self.partner_type, 'PTR')
        count = Partner.objects.filter(
            partner_type=self.partner_type).count() + 1
        return f"{prefix}{count:04d}"

    @property
    def is_contract_active(self):
        """التحقق من أن العقد ساري"""
        today = timezone.now().date()
        if self.contract_start and self.contract_start > today:
            return False
        if self.contract_end and self.contract_end < today:
            return False
        return self.is_active

    @property
    def available_credit(self):
        """الائتمان المتاح"""
        return max(0, self.credit_limit - self.current_balance)


class PartnerBranch(BaseModel):
    """
    فروع الشريك (مثلاً: فروع شركة AXA)
    أو ربط الشريك بفروع محددة من متجرنا
    """
    partner = models.ForeignKey(
        Partner, on_delete=models.CASCADE, related_name='branches')
    branch = models.ForeignKey(
        'branches.Branch',
        on_delete=models.CASCADE,
        related_name='partner_agreements',
        help_text=_('Branch associated with this partner')
    )

    # شروط خاصة بهذا الفرع
    special_discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Branch Special Discount %')
    )

    class Meta:
        verbose_name = _('Partner Branch Link')
        verbose_name_plural = _('Partner Branch Links')
        unique_together = ['partner', 'branch']


class CustomerPartnerLink(BaseModel):
    """
    ربط العميل بشريك (مثل: عميل مؤمن عليه في AXA)
    """
    customer = models.ForeignKey(
        'crm.Customer',
        on_delete=models.CASCADE,
        related_name='partner_links'
    )
    partner = models.ForeignKey(
        Partner,
        on_delete=models.CASCADE,
        related_name='customer_links'
    )

    # معلومات خاصة بالربط
    member_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_('Member ID / Policy Number')
    )
    policy_number = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_('Policy Number')
    )

    # صلاحية التغطية
    coverage_start = models.DateField(
        null=True, blank=True, verbose_name=_('Coverage Start'))
    coverage_end = models.DateField(
        null=True, blank=True, verbose_name=_('Coverage End'))

    # حدود التغطية
    annual_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Annual Limit')
    )
    remaining_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Remaining Limit')
    )

    # نسبة التحمل الخاصة بالعميل (قد تختلف عن الشريك)
    copay_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Copay Percentage %')
    )
    copay_fixed = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Fixed Copay Amount')
    )

    # الفئة (مثلاً: VIP, Gold, Silver)
    coverage_class = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_('Coverage Class')
    )

    notes = models.TextField(blank=True, verbose_name=_('Notes'))

    class Meta:
        verbose_name = _('Customer-Partner Link')
        verbose_name_plural = _('Customer-Partner Links')
        unique_together = ['customer', 'partner']

    def __str__(self):
        return f"{self.customer} - {self.partner.name}"

    @property
    def is_coverage_active(self):
        """التحقق من أن التغطية سارية"""
        today = timezone.now().date()
        if self.coverage_start and self.coverage_start > today:
            return False
        if self.coverage_end and self.coverage_end < today:
            return False
        return self.is_active

    def get_copay_amount(self, total_amount):
        """حساب مبلغ تحمل العميل"""
        if self.copay_fixed:
            return min(self.copay_fixed, total_amount)

        percentage = self.copay_percentage or self.partner.patient_share_percentage
        return total_amount * percentage / 100
