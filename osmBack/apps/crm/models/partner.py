# apps/crm/models/partner.py
"""
نماذج الشركاء (التأمين، التقسيط، شركات العملاء، تجار الجملة)
"""

from django.db import models
from django.utils import timezone
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
        ('insurance', 'شركة تأمين'),
        ('bnpl', 'شركة تقسيط'),           # Buy Now Pay Later
        ('corporate', 'شركة عملاء'),       # Corporate clients
        ('wholesaler', 'تاجر جملة'),
        ('agent', 'وكيل'),
    ]

    PAYMENT_TERMS = [
        ('immediate', 'فوري'),
        ('7_days', '7 أيام'),
        ('15_days', '15 يوم'),
        ('30_days', '30 يوم'),
        ('60_days', '60 يوم'),
        ('90_days', '90 يوم'),
    ]

    # المعلومات الأساسية
    name = models.CharField(max_length=200, verbose_name="اسم الشريك")
    name_en = models.CharField(
        max_length=200, blank=True, verbose_name="الاسم بالإنجليزية")
    partner_type = models.CharField(
        max_length=20, choices=PARTNER_TYPES, verbose_name="نوع الشريك")
    code = models.CharField(max_length=20, unique=True,
                            blank=True, verbose_name="رمز الشريك")
    logo = models.ImageField(
        upload_to='partners/logos/', null=True, blank=True)

    # معلومات الاتصال
    contact_person = models.CharField(
        max_length=100, blank=True, verbose_name="مسؤول التواصل")
    phone = models.CharField(max_length=20, blank=True, verbose_name="الهاتف")
    email = models.EmailField(blank=True, verbose_name="البريد الإلكتروني")
    website = models.URLField(blank=True, verbose_name="الموقع الإلكتروني")
    address = models.TextField(blank=True, verbose_name="العنوان")

    # معلومات العقد
    contract_number = models.CharField(
        max_length=50, blank=True, verbose_name="رقم العقد")
    contract_start = models.DateField(
        null=True, blank=True, verbose_name="بداية العقد")
    contract_end = models.DateField(
        null=True, blank=True, verbose_name="نهاية العقد")
    contract_document = models.FileField(
        upload_to='partners/contracts/', null=True, blank=True)

    # الشروط المالية
    payment_terms = models.CharField(
        max_length=20,
        choices=PAYMENT_TERMS,
        default='30_days',
        verbose_name="شروط الدفع"
    )
    default_discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name="نسبة الخصم الافتراضية %"
    )

    # حد الائتمان والرصيد
    credit_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name="حد الائتمان"
    )
    current_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name="الرصيد الحالي",
        help_text="المبلغ المستحق على/لصالح الشريك"
    )

    # للتأمين: نسبة تغطية العميل (ما يدفعه العميل)
    patient_share_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=20,
        verbose_name="نسبة مشاركة العميل %",
        help_text="النسبة التي يدفعها العميل من الفاتورة (للتأمين)"
    )

    # معلومات إضافية
    tax_number = models.CharField(
        max_length=50, blank=True, verbose_name="الرقم الضريبي")
    notes = models.TextField(blank=True, verbose_name="ملاحظات")

    class Meta:
        verbose_name = "شريك"
        verbose_name_plural = "الشركاء"
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
        help_text="الفرع المرتبط بهذا الشريك"
    )

    # شروط خاصة بهذا الفرع
    special_discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="خصم خاص بالفرع %"
    )

    class Meta:
        verbose_name = "ربط شريك بفرع"
        verbose_name_plural = "ارتباطات الشركاء بالفروع"
        unique_together = ['partner', 'branch']


class PartnerPriceList(BaseModel):
    """
    قائمة أسعار خاصة بشريك معين
    مثال: أسعار AXA الخاصة بالنظارات الطبية
    """
    PRICE_TYPE = [
        ('discount', 'خصم على السعر الأصلي'),
        ('fixed', 'سعر ثابت'),
        ('markup', 'زيادة على التكلفة'),
    ]

    partner = models.ForeignKey(
        Partner, on_delete=models.CASCADE, related_name='price_lists')
    name = models.CharField(max_length=100, verbose_name="اسم القائمة")
    description = models.TextField(blank=True)

    # نوع التسعير
    price_type = models.CharField(
        max_length=20, choices=PRICE_TYPE, default='discount')

    # قيمة التعديل
    adjustment_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="قيمة التعديل",
        help_text="نسبة للخصم، مبلغ للثابت، نسبة للزيادة"
    )

    # صلاحية القائمة
    valid_from = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)

    # التطبيق
    applies_to_all = models.BooleanField(
        default=False,
        verbose_name="تطبق على كل المنتجات"
    )

    class Meta:
        verbose_name = "قائمة أسعار شريك"
        verbose_name_plural = "قوائم أسعار الشركاء"
        ordering = ['partner', 'name']

    def __str__(self):
        return f"{self.partner.name} - {self.name}"

    def is_valid(self, date=None):
        """التحقق من صلاحية القائمة"""
        date = date or timezone.now().date()
        if self.valid_from and self.valid_from > date:
            return False
        if self.valid_until and self.valid_until < date:
            return False
        return self.is_active


class PartnerPriceListItem(BaseModel):
    """
    عناصر قائمة الأسعار - منتجات أو فئات محددة
    """
    price_list = models.ForeignKey(
        PartnerPriceList,
        on_delete=models.CASCADE,
        related_name='items'
    )

    # يمكن الربط بمنتج أو فئة
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    category = models.ForeignKey(
        'products.Category',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    # سعر خاص (يتجاوز تسعير القائمة)
    special_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="سعر خاص"
    )
    special_discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="خصم خاص %"
    )

    class Meta:
        verbose_name = "عنصر قائمة أسعار"
        verbose_name_plural = "عناصر قوائم الأسعار"

    def get_price_for_variant(self, variant, base_price):
        """حساب السعر النهائي للمنتج"""
        # إذا كان هناك سعر خاص للعنصر
        if self.special_price:
            return self.special_price

        if self.special_discount:
            return base_price * (1 - self.special_discount / 100)

        # استخدام تسعير القائمة
        price_list = self.price_list
        if price_list.price_type == 'discount':
            return base_price * (1 - price_list.adjustment_value / 100)
        elif price_list.price_type == 'fixed':
            return price_list.adjustment_value
        elif price_list.price_type == 'markup':
            # يحتاج تكلفة المنتج
            cost = getattr(variant, 'cost_price', base_price * 0.6)
            return cost * (1 + price_list.adjustment_value / 100)

        return base_price


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
        verbose_name="رقم العضوية/البوليصة"
    )
    policy_number = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="رقم البوليصة"
    )

    # صلاحية التغطية
    coverage_start = models.DateField(
        null=True, blank=True, verbose_name="بداية التغطية")
    coverage_end = models.DateField(
        null=True, blank=True, verbose_name="نهاية التغطية")

    # حدود التغطية
    annual_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="الحد السنوي"
    )
    remaining_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="المتبقي من الحد"
    )

    # نسبة التحمل الخاصة بالعميل (قد تختلف عن الشريك)
    copay_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="نسبة التحمل %"
    )
    copay_fixed = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="مبلغ تحمل ثابت"
    )

    # الفئة (مثلاً: VIP, Gold, Silver)
    coverage_class = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="فئة التغطية"
    )

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "ربط عميل بشريك"
        verbose_name_plural = "ارتباطات العملاء بالشركاء"
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
