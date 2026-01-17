# apps/crm/models/customer.py
"""
نماذج العملاء وإدارة العلاقات
"""

from django.db import models
from django.conf import settings
from core.models import BaseModel
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.utils import timezone
from django.contrib.auth import get_user_model


class Customer(BaseModel):
    CUSTOMER_TYPE_CHOICES = [
        ('individual', 'فرد'),
        ('company', 'شركة'),
        ('agent', 'وكيل'),
        ('supplier', 'مورد'),
        ('wholesaler', 'تاجر جملة'),      # جديد
        ('retailer', 'تاجر تجزئة'),       # جديد
        ('distributor', 'موزع'),          # جديد
    ]

    PRICING_TIER_CHOICES = [
        ('retail', 'تجزئة'),
        ('wholesale_1', 'جملة - المستوى 1'),
        ('wholesale_2', 'جملة - المستوى 2'),
        ('wholesale_3', 'جملة - المستوى 3 (VIP)'),
        ('distributor', 'موزع'),
        ('special', 'سعر خاص'),
    ]

    CREDIT_STATUS_CHOICES = [
        ('none', 'بدون ائتمان'),
        ('pending', 'قيد المراجعة'),
        ('approved', 'معتمد'),
        ('suspended', 'موقوف'),
    ]

    """عملاء المتجر"""
    # Personal Information
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="crm_customers")
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    identification_number = models.CharField(
        max_length=20,
        unique=True,
        validators=[MinLengthValidator(10), MaxLengthValidator(10)],
        help_text="Enter a valid identification number 10 digits."
    )
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    customer_type = models.CharField(
        max_length=15, choices=CUSTOMER_TYPE_CHOICES, default='individual')

    # Address
    address_line1 = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)

    # Membership
    is_vip = models.BooleanField(default=False, null=True, blank=True)
    loyalty_points = models.IntegerField(default=0, null=True, blank=True)

    # Marketing
    accepts_marketing = models.BooleanField(default=True)
    registration_number = models.CharField(
        max_length=50, null=True, blank=True)
    tax_number = models.CharField(max_length=50, null=True, blank=True)
    preferred_contact = models.CharField(max_length=10, choices=[
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('sms', 'SMS')
    ], default='email')

    website = models.URLField(null=True, blank=True)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    # ═══════════════════════════════════════════════════════════════════════════
    # حقول البيع بالجملة - Wholesale Fields
    # ═══════════════════════════════════════════════════════════════════════════

    # مستوى التسعير
    pricing_tier = models.CharField(
        max_length=20,
        choices=PRICING_TIER_CHOICES,
        default='retail',
        verbose_name="مستوى التسعير"
    )

    # نسبة الخصم الافتراضية للعميل
    default_discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name="نسبة الخصم الافتراضية"
    )

    # حد الائتمان
    credit_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name="حد الائتمان"
    )

    # الرصيد الحالي (مستحق على العميل)
    current_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name="الرصيد الحالي"
    )

    # حالة الائتمان
    credit_status = models.CharField(
        max_length=15,
        choices=CREDIT_STATUS_CHOICES,
        default='none',
        verbose_name="حالة الائتمان"
    )

    # شروط الدفع (عدد الأيام)
    payment_terms_days = models.PositiveIntegerField(
        default=0,
        verbose_name="شروط الدفع (أيام)",
        help_text="عدد أيام السداد للآجل"
    )

    # الحد الأدنى للطلب (للجملة)
    minimum_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="الحد الأدنى للطلب"
    )

    # مندوب المبيعات المخصص
    sales_representative = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="wholesale_customers",
        verbose_name="مندوب المبيعات"
    )

    # تاريخ التعاقد (للجملة)
    contract_start_date = models.DateField(
        null=True, blank=True,
        verbose_name="تاريخ بداية التعاقد"
    )
    contract_end_date = models.DateField(
        null=True, blank=True,
        verbose_name="تاريخ نهاية التعاقد"
    )

    # ملاحظات الائتمان
    credit_notes = models.TextField(
        blank=True,
        verbose_name="ملاحظات الائتمان"
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def is_wholesale_customer(self):
        """التحقق من أن العميل جملة"""
        return self.customer_type in ['wholesaler', 'distributor'] or \
            self.pricing_tier not in ['retail', 'special']

    @property
    def available_credit(self):
        """الائتمان المتاح"""
        if self.credit_status != 'approved':
            return 0
        return max(0, self.credit_limit - self.current_balance)

    @property
    def credit_utilization_percentage(self):
        """نسبة استخدام الائتمان"""
        if self.credit_limit <= 0:
            return 0
        return min(100, (self.current_balance / self.credit_limit) * 100)

    @property
    def has_active_insurance(self):
        """التحقق من وجود تأمين ساري"""
        return self.partner_links.filter(
            partner__partner_type='insurance',
            is_active=True
        ).exists()

    def get_active_partner_link(self, partner_type='insurance'):
        """الحصول على رابط الشريك النشط"""
        return self.partner_links.filter(
            partner__partner_type=partner_type,
            is_active=True
        ).first()

    def update_balance(self, amount, is_payment=False):
        """تحديث رصيد العميل"""
        from decimal import Decimal
        amount = Decimal(str(amount))

        if is_payment:
            self.current_balance -= amount
        else:
            self.current_balance += amount

        self.save(update_fields=['current_balance'])

    def check_credit_available(self, amount):
        """التحقق من توفر الائتمان للمبلغ المطلوب"""
        if self.credit_status != 'approved':
            return False, "ليس لديك ائتمان معتمد"

        if self.available_credit < amount:
            return False, f"الائتمان المتاح ({self.available_credit}) أقل من المبلغ المطلوب ({amount})"

        return True, "الائتمان متاح"

    def get_applicable_price(self, product_variant):
        """الحصول على السعر المناسب للعميل"""
        # أولاً: التحقق من سعر خاص للعميل
        from apps.products.models import FlexiblePrice

        # سعر خاص للعميل
        special_price = FlexiblePrice.objects.filter(
            variant=product_variant,
            customer=self,
            is_active=True
        ).first()

        if special_price:
            return special_price.price

        # سعر المستوى (tier)
        tier_price = FlexiblePrice.objects.filter(
            variant=product_variant,
            pricing_tier=self.pricing_tier,
            is_active=True
        ).first()

        if tier_price:
            return tier_price.price

        # السعر الافتراضي
        return product_variant.price


class Interaction(BaseModel):
    INTERACTION_TYPES = [
        ('call', 'Call'),
        ('email', 'Email'),
        ('meeting', 'Meeting'),
    ]

    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="interactions")
    interaction_type = models.CharField(
        max_length=10, choices=INTERACTION_TYPES)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.interaction_type} with {self.customer.full_name}"


class Complaint(BaseModel):
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="complaints")
    description = models.TextField()
    status = models.CharField(max_length=20, choices=[(
        'open', 'Open'), ('resolved', 'Resolved')], default='open')

    def __str__(self):
        return f"Complaint by {self.customer.full_name}"


class Opportunity(BaseModel):
    STAGES = [
        ('lead', 'Lead'),
        ('qualified', 'Qualified'),
        ('proposal', 'Proposal'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="opportunities")
    title = models.CharField(max_length=255)
    stage = models.CharField(max_length=20, choices=STAGES, default='lead')
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.stage}"


class Task(BaseModel):
    PRIORITIES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="tasks", null=True, blank=True)
    opportunity = models.ForeignKey(
        Opportunity, on_delete=models.CASCADE, related_name="tasks", null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    priority = models.CharField(
        max_length=10, choices=PRIORITIES, default='medium')
    due_date = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class Campaign(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    customers = models.ManyToManyField(
        Customer, related_name="campaigns", blank=True)

    def __str__(self):
        return self.name


class Document(BaseModel):
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="documents", null=True, blank=True)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')

    def __str__(self):
        return self.title


class Subscription(BaseModel):
    SUBSCRIPTION_TYPES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
        ('lifetime', 'Lifetime'),
    ]
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="subscriptions")
    subscription_type = models.CharField(
        max_length=20, choices=SUBSCRIPTION_TYPES, verbose_name="Subscription Type")
    start_date = models.DateTimeField(
        default=timezone.now, verbose_name="Start Date")
    end_date = models.DateTimeField(verbose_name="End Date")

    def __str__(self):
        return f"{self.customer.full_name} - {self.subscription_type}"

    class Meta:
        verbose_name = "Subscription"
        verbose_name_plural = "Subscriptions"


class CustomerGroup(BaseModel):
    name = models.CharField(max_length=100)
    customers = models.ManyToManyField(Customer, related_name="groups")
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Customer Group"
        verbose_name_plural = "Customer Groups"


class Contact(BaseModel):
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    message = models.TextField(max_length=500)
