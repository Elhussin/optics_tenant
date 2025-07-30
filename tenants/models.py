from django_tenants.models import TenantMixin, DomainMixin
from django.db import models
import uuid
from datetime import timedelta
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

# -----------------------
# Subscription Plans Data
# -----------------------

PLAN_CHOICES = [
    ('trial', _('Trial')),
    ('basic', _('Basic')),
    ('premium', _('Premium')),
    ('enterprise', _('Enterprise'))
]

# خطة افتراضية في حال ما وجدت في قاعدة البيانات
PLAN_LIMITS = {
    'trial':      {'max_users': 1,   'max_branches': 1,  'max_products': 200,    'duration_days': 7,   'price_month': 0,   'price_year': 0},
    'basic':      {'max_users': 5,   'max_branches': 2,  'max_products': 1000,   'duration_days': 30,  'price_month': 19,  'price_year': 190},
    'premium':    {'max_users': 50,  'max_branches': 5,  'max_products': 10000,  'duration_days': 30,  'price_month': 49,  'price_year': 490},
    'enterprise': {'max_users': 200, 'max_branches': 20, 'max_products': 100000, 'duration_days': 365, 'price_month': 99,  'price_year': 990}
}

# -----------------------
# Utils
# -----------------------

def get_expiration_date(days=1):
    return timezone.now() + timedelta(days=days)


# -----------------------
# Models
# -----------------------

class PendingTenantRequest(models.Model):
    schema_name = models.CharField(max_length=63, unique=True, verbose_name=_("Schema Name"))
    name = models.CharField(max_length=100, verbose_name=_("Company Name"))
    email = models.EmailField(unique=True, verbose_name=_("Email"))
    password = models.CharField(max_length=128, verbose_name=_("Password"))
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    token_expires_at = models.DateTimeField(default=get_expiration_date(1), verbose_name=_("Token Expires At"))
    is_activated = models.BooleanField(default=False, verbose_name=_("Activated"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    expires_at = models.DateTimeField(default=get_expiration_date(PLAN_LIMITS['trial']['duration_days']), verbose_name=_("Expires At"))
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='trial', verbose_name=_("Plan"))
    requested_plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='trial', verbose_name=_("Requested Plan"))
    max_users = models.IntegerField(default=PLAN_LIMITS['trial']['max_users'], verbose_name=_("Max Users"))
    max_products = models.IntegerField(default=PLAN_LIMITS['trial']['max_products'], verbose_name=_("Max Products"))
    max_branches = models.IntegerField(default=PLAN_LIMITS['trial']['max_branches'], verbose_name=_("Max Branches"))
    is_deleted = models.BooleanField(default=False, verbose_name=_("Deleted"))

    def __str__(self):
        return self.name


class SubscriptionPlan(models.Model):
    code = models.CharField(max_length=20, choices=PLAN_CHOICES, unique=True)
    name = models.CharField(max_length=50)
    max_users = models.IntegerField()
    max_products = models.IntegerField()
    max_branches = models.IntegerField()
    duration_days = models.IntegerField()
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_year = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Client(TenantMixin):
    name = models.CharField(max_length=100, verbose_name=_("Company Name"))
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='trial', verbose_name=_("Plan"))

    max_users = models.IntegerField(default=1, verbose_name=_("Max Users"))
    max_products = models.IntegerField(default=200, verbose_name=_("Max Products"))
    max_branches = models.IntegerField(default=1, verbose_name=_("Max Branches"))
    paid_until = models.DateField(null=True, blank=True, verbose_name=_("Paid Until"))
    on_trial = models.BooleanField(default=True, verbose_name=_("On Trial"))
    is_active = models.BooleanField(default=True, verbose_name=_("Active"))
    is_deleted = models.BooleanField(default=False, verbose_name=_("Deleted"))
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    auto_create_schema = True

    class Meta:
        verbose_name = _("Client")
        verbose_name_plural = _("Clients")

    def __str__(self):
        return self.name

    def apply_plan_limits(self):
        """تطبيق حدود الخطة على العميل"""
        try:
            plan_obj = SubscriptionPlan.objects.get(code=self.plan)
            self.max_users = plan_obj.max_users
            self.max_branches = plan_obj.max_branches
            self.max_products = plan_obj.max_products
        except SubscriptionPlan.DoesNotExist:
            limits = PLAN_LIMITS.get(self.plan)
            if limits:
                self.max_users = limits['max_users']
                self.max_branches = limits['max_branches']
                self.max_products = limits['max_products']

    @property
    def is_plan_expired(self):
        from django.utils.timezone import now
        return (not self.is_active) or (self.paid_until and self.paid_until < now().date())

    @property
    def is_paid(self):
        from django.utils.timezone import now
        return self.is_active and self.paid_until and self.paid_until >= now().date()


class Domain(DomainMixin):
    def __str__(self):
        return self.domain


class Payment(models.Model):
    PAYMENT_METHODS = [
        ('credit_card', _("Credit Card")),
        ('bank_transfer', _("Bank Transfer")),
        ('paypal', _("PayPal")),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.name} - {self.amount} {self.currency} ({self.plan})"

    def save(self, *args, **kwargs):
        """تحديث اشتراك العميل تلقائي بعد الدفع"""
        super().save(*args, **kwargs)
        # تحديث بيانات العميل
        client = self.client
        client.plan = self.plan
        client.paid_until = self.end_date
        client.on_trial = (self.plan == 'trial')
        client.is_active = True
        client.apply_plan_limits()
        client.save()
