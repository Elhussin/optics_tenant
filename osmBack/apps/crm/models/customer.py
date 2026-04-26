# apps/crm/models/customer.py
"""
نماذج العملاء وإدارة العلاقات
"""

from django.db import models
from django.conf import settings
from core.models import BaseModel
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model


class Customer(BaseModel):
    CUSTOMER_TYPE_CHOICES = [
        ('individual', _('Individual')),
        ('company', _('Company')),
        ('agent', _('Agent')),
        ('supplier', _('Supplier')),
        ('wholesaler', _('Wholesaler')),
        ('retailer', _('Retailer')),
        ('distributor', _('Distributor')),
    ]

    PRICING_TIER_CHOICES = [
        ('retail', _('Retail')),
        ('wholesale_1', _('Wholesale - Level 1')),
        ('wholesale_2', _('Wholesale - Level 2')),
        ('wholesale_3', _('Wholesale - Level 3 (VIP)')),
        ('distributor', _('Distributor')),
        ('special', _('Special Price')),
    ]

    CREDIT_STATUS_CHOICES = [
        ('none', _('No Credit')),
        ('pending', _('Pending Review')),
        ('approved', _('Approved')),
        ('suspended', _('Suspended')),
    ]

    """عملاء المتجر"""
    # Personal Information
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="crm_customers")
    # Personal Information
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="crm_customers")
    first_name = models.CharField(
        max_length=100, blank=True, verbose_name=_('First Name'))
    last_name = models.CharField(
        max_length=100, blank=True, verbose_name=_('Last Name'))
    identification_number = models.CharField(
        max_length=20,
        unique=True,
        validators=[MinLengthValidator(10), MaxLengthValidator(10)],
        verbose_name=_('Identification Number'),
        help_text=_('Enter a valid identification number (10 digits)')
    )
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    phone = models.CharField(max_length=20, blank=True,
                             verbose_name=_('Phone'))
    date_of_birth = models.DateField(
        null=True, blank=True, verbose_name=_('Date of Birth'))
    customer_type = models.CharField(
        max_length=15, choices=CUSTOMER_TYPE_CHOICES, default='individual', verbose_name=_('Customer Type'))

    # Address
    address_line1 = models.CharField(
        max_length=200, blank=True, verbose_name=_('Address Line 1'))
    address_line2 = models.CharField(
        max_length=200, blank=True, verbose_name=_('Address Line 2'))
    city = models.CharField(max_length=100, blank=True, verbose_name=_('City'))
    postal_code = models.CharField(
        max_length=20, blank=True, verbose_name=_('Postal Code'))

    # Membership
    is_vip = models.BooleanField(
        default=False, null=True, blank=True, verbose_name=_('Is VIP'))
    loyalty_points = models.IntegerField(
        default=0, null=True, blank=True, verbose_name=_('Loyalty Points'))

    # Marketing
    accepts_marketing = models.BooleanField(
        default=True, verbose_name=_('Accepts Marketing'))
    registration_number = models.CharField(
        max_length=50, null=True, blank=True, verbose_name=_('Registration Number'))
    tax_number = models.CharField(
        max_length=50, null=True, blank=True, verbose_name=_('Tax Number'))
    preferred_contact = models.CharField(max_length=10, choices=[
        ('email', _('Email')),
        ('phone', _('Phone')),
        ('sms', _('SMS'))
    ], default='email', verbose_name=_('Preferred Contact'))

    website = models.URLField(null=True, blank=True, verbose_name=_('Website'))
    logo = models.ImageField(upload_to='company_logos/',
                             null=True, blank=True, verbose_name=_('Logo'))
    description = models.TextField(
        null=True, blank=True, verbose_name=_('Description'))

    # ═══════════════════════════════════════════════════════════════════════════
    # حقول البيع بالجملة - Wholesale Fields
    # ═══════════════════════════════════════════════════════════════════════════

    # مستوى التسعير
    pricing_tier = models.CharField(
        max_length=20,
        choices=PRICING_TIER_CHOICES,
        default='retail',
        verbose_name=_('Pricing Tier')
    )

    # نسبة الخصم الافتراضية للعميل
    default_discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name=_('Default Discount Percentage')
    )

    # حد الائتمان
    credit_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name=_('Credit Limit')
    )

    # الرصيد الحالي (مستحق على العميل)
    current_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name=_('Current Balance')
    )

    # حالة الائتمان
    credit_status = models.CharField(
        max_length=15,
        choices=CREDIT_STATUS_CHOICES,
        default='none',
        verbose_name=_('Credit Status')
    )

    # شروط الدفع (عدد الأيام)
    payment_terms_days = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Payment Terms (Days)'),
        help_text=_('Number of days for deferred payment')
    )

    # الحد الأدنى للطلب (للجملة)
    minimum_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name=_('Minimum Order Amount')
    )

    # مندوب المبيعات المخصص
    sales_representative = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="wholesale_customers",
        verbose_name=_('Sales Representative')
    )

    # تاريخ التعاقد (للجملة)
    contract_start_date = models.DateField(
        null=True, blank=True,
        verbose_name=_('Contract Start Date')
    )
    contract_end_date = models.DateField(
        null=True, blank=True,
        verbose_name=_('Contract End Date')
    )

    # ملاحظات الائتمان
    credit_notes = models.TextField(
        blank=True,
        verbose_name=_('Credit Notes')
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




class Interaction(BaseModel):
    INTERACTION_TYPES = [
        ('call', _('Call')),
        ('email', _('Email')),
        ('meeting', _('Meeting')),
    ]

    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="interactions")
    interaction_type = models.CharField(
        max_length=10, choices=INTERACTION_TYPES, verbose_name=_('Interaction Type'))
    notes = models.TextField(blank=True, null=True, verbose_name=_('Notes'))

    def __str__(self):
        return f"{self.interaction_type} with {self.customer.full_name}"

    class Meta:
        verbose_name = _('Interaction')
        verbose_name_plural = _('Interactions')


class Complaint(BaseModel):
    STATUS_CHOICES = [
        ('open', _('Open')),
        ('resolved', _('Resolved')),
    ]

    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="complaints")
    description = models.TextField(verbose_name=_('Description'))
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='open', verbose_name=_('Status'))

    def __str__(self):
        return f"Complaint by {self.customer.full_name}"

    class Meta:
        verbose_name = _('Complaint')
        verbose_name_plural = _('Complaints')


class Opportunity(BaseModel):
    STAGES = [
        ('lead', _('Lead')),
        ('qualified', _('Qualified')),
        ('proposal', _('Proposal')),
        ('negotiation', _('Negotiation')),
        ('won', _('Won')),
        ('lost', _('Lost')),
    ]
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="opportunities")
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    stage = models.CharField(
        max_length=20, choices=STAGES, default='lead', verbose_name=_('Stage'))
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Amount'))

    def __str__(self):
        return f"{self.title} - {self.stage}"

    class Meta:
        verbose_name = _('Opportunity')
        verbose_name_plural = _('Opportunities')


class Task(BaseModel):
    PRIORITIES = [
        ('low', _('Low')),
        ('medium', _('Medium')),
        ('high', _('High')),
    ]
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="tasks", null=True, blank=True)
    opportunity = models.ForeignKey(
        Opportunity, on_delete=models.CASCADE, related_name="tasks", null=True, blank=True)
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    description = models.TextField(
        null=True, blank=True, verbose_name=_('Description'))
    priority = models.CharField(
        max_length=10, choices=PRIORITIES, default='medium', verbose_name=_('Priority'))
    due_date = models.DateTimeField(
        null=True, blank=True, verbose_name=_('Due Date'))
    completed = models.BooleanField(default=False, verbose_name=_('Completed'))

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _('Task')
        verbose_name_plural = _('Tasks')


class Campaign(BaseModel):
    name = models.CharField(max_length=255, verbose_name=_('Name'))
    description = models.TextField(verbose_name=_('Description'))
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(verbose_name=_('End Date'))
    customers = models.ManyToManyField(
        Customer, related_name="campaigns", blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Campaign')
        verbose_name_plural = _('Campaigns')


class Document(BaseModel):
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="documents", null=True, blank=True)
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    file = models.FileField(upload_to='documents/', verbose_name=_('File'))

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _('Document')
        verbose_name_plural = _('Documents')


class Subscription(BaseModel):
    SUBSCRIPTION_TYPES = [
        ('monthly', _('Monthly')),
        ('yearly', _('Yearly')),
        ('lifetime', _('Lifetime')),
    ]
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="subscriptions")
    subscription_type = models.CharField(
        max_length=20, choices=SUBSCRIPTION_TYPES, verbose_name=_('Subscription Type'))
    start_date = models.DateTimeField(
        default=timezone.now, verbose_name=_('Start Date'))
    end_date = models.DateTimeField(verbose_name=_('End Date'))

    def __str__(self):
        return f"{self.customer.full_name} - {self.subscription_type}"

    class Meta:
        verbose_name = _('Subscription')
        verbose_name_plural = _('Subscriptions')


class CustomerGroup(BaseModel):
    name = models.CharField(max_length=100, verbose_name=_('Group Name'))
    customers = models.ManyToManyField(Customer, related_name="groups")
    description = models.TextField(blank=True, verbose_name=_('Description'))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Customer Group')
        verbose_name_plural = _('Customer Groups')


class Contact(BaseModel):
    email = models.EmailField(verbose_name=_('Email'))
    phone = models.CharField(max_length=20, verbose_name=_('Phone'))
    name = models.CharField(max_length=100, verbose_name=_('Name'))
    message = models.TextField(max_length=500, verbose_name=_('Message'))

    class Meta:
        verbose_name = _('Contact')
        verbose_name_plural = _('Contacts')
