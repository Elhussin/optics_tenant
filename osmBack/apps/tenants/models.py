from django_tenants.models import TenantMixin, DomainMixin
from django.db import models
import uuid
from datetime import timedelta
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from core.constants.tenants import PAYMENT_METHODS, STATUS_CHOICES, CURRENCY
from apps.tenants.utils.update_client_plan import update_client_plan
from core.utils.expiration_date import expiration_date
from core.models import BaseModel
import logging
from django.core.exceptions import ValidationError
from django.db import connection
from django.core.management import call_command
from django.apps import apps  # Added to resolve SubscriptionPlan

payment_logger = logging.getLogger('paypal')


class SubscriptionPlan(BaseModel):
    """Plan Subscription"""
    name = models.CharField(max_length=50, unique=True,
                            verbose_name=_("Name"))  # trial, basic, premium...
    duration_months = models.PositiveIntegerField(
        default=30, verbose_name=_("Duration Months"))
    duration_years = models.PositiveIntegerField(
        default=365, verbose_name=_("Duration Years"))
    max_users = models.PositiveIntegerField(
        default=1, verbose_name=_("Max Users"))
    max_branches = models.PositiveIntegerField(
        default=1, verbose_name=_("Max Branches"))
    max_products = models.PositiveIntegerField(
        default=200, verbose_name=_("Max Products"))
    month_price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00, verbose_name=_("Month Price"))
    year_price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00, verbose_name=_("Year Price"))
    currency = models.CharField(
        max_length=10, default="USD", choices=CURRENCY, verbose_name=_("Currency"))
    discount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00, verbose_name=_("Discount"))
    has_hr_module = models.BooleanField(
        default=True, verbose_name=_("Has HR Module"))
    has_inventory_module = models.BooleanField(
        default=True, verbose_name=_("Has Inventory Module"))
    has_eye_test_module = models.BooleanField(
        default=True, verbose_name=_("Has Eye Test Module"))
    has_crm_module = models.BooleanField(
        default=True, verbose_name=_("Has CRM Module"))

    class Meta:
        verbose_name = _("Subscription Plan")
        verbose_name_plural = _("Subscription Plans")
        ordering = ["month_price"]

    def __str__(self):
        return f"{self.name} ({self.month_price} {self.currency})"


class PendingTenantRequest(BaseModel):
    """Pending tenant requests"""
    plan = models.ForeignKey(
        "SubscriptionPlan", on_delete=models.SET_NULL, null=True, verbose_name=_("Plan"))
    schema_name = models.CharField(
        max_length=63, unique=True, verbose_name=_("Schema Name"))
    name = models.CharField(max_length=100, verbose_name=_("Company Name"))
    email = models.EmailField(unique=True, verbose_name=_("Email"))
    password = models.CharField(max_length=128, verbose_name=_("Password"))
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    token_expires_at = models.DateTimeField(verbose_name=_("Token Expires At"))
    is_activated = models.BooleanField(
        default=False, verbose_name=_("Activated"))

    expires_at = models.DateTimeField(
        blank=True, null=True, verbose_name=_("Expires At"))

    class Meta:
        verbose_name = _("Pending Tenant Request")
        verbose_name_plural = _("Pending Tenant Requests")

    def __str__(self):
        return self.name

    def clean(self):
        if not self.schema_name.isalnum():
            raise ValidationError(_("Schema name must be alphanumeric"))

    def save(self, *args, **kwargs):
        """Set plan to trial and expires_at to expiration_date"""
        if self.plan and not self.expires_at:
            self.token_expires_at = expiration_date(1)
            # Use duration_months * 30 as approximation since duration_days is not on model
            days = self.plan.duration_months * 30
            self.expires_at = expiration_date(days)

        super().save(*args, **kwargs)


class Client(TenantMixin, BaseModel):
    """Tenants (Clients) """
    plan = models.ForeignKey(
        "SubscriptionPlan", on_delete=models.SET_NULL, null=True, verbose_name=_("Plan"))
    name = models.CharField(max_length=100, verbose_name=_("Company Name"))
    max_users = models.IntegerField(default=1, verbose_name=_("Max Users"))
    max_products = models.IntegerField(
        default=200, verbose_name=_("Max Products"))
    max_branches = models.IntegerField(
        default=1, verbose_name=_("Max Branches"))
    paid_until = models.DateField(
        null=True, blank=True, verbose_name=_("Paid Until"))
    on_trial = models.BooleanField(default=True, verbose_name=_("On Trial"))
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    auto_create_schema = False

    class Meta:
        verbose_name = _("Client")
        verbose_name_plural = _("Clients")

    def __str__(self):
        return self.name

    def apply_plan_limits(self):
        """Apply plan limits to client"""
        if self.plan:
            self.max_users = self.plan.max_users
            self.max_branches = self.plan.max_branches
            self.max_products = self.plan.max_products

    @property
    def is_plan_expired(self):
        """Is the plan expired?"""
        now = timezone.now().date()
        return (not self.is_active) or (self.paid_until and self.paid_until < now)

    @property
    def is_paid(self):
        """Is the client a subscriber?"""
        now = timezone.now().date()
        return self.is_active and self.paid_until and self.paid_until >= now

    def save(self, *args, **kwargs):
        self.apply_plan_limits()  # تحديث القيود قبل الحفظ
        super().save(*args, **kwargs)

    def delete(self, force_drop=False, *args, **kwargs):
        """بما أن Client يرث من BaseModel، نحتاج لتعطيل الـ Soft Delete هنا
        لأن django-tenants يستدعي delete() داخلياً أثناء التهيئة مما يسبب recursion.
        كما يجب دعم وسيط force_drop المتوقع من قبل django-tenants."""
        return models.Model.delete(self, *args, **kwargs)


class Domain(DomainMixin):
    """Domains for tenants"""

    def delete(self, *args, **kwargs):
        return models.Model.delete(self, *args, **kwargs)

    def __str__(self):
        return self.domain


class Payment(BaseModel):
    """سجل المدفوعات"""
    client = models.ForeignKey(
        "Client", on_delete=models.CASCADE, related_name="payments", verbose_name=_("Client"))
    plan = models.ForeignKey(
        "SubscriptionPlan", on_delete=models.SET_NULL, null=True, verbose_name=_("Plan"))
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name=_("Amount"))
    currency = models.CharField(
        max_length=10, default="USD", choices=CURRENCY, verbose_name=_("Currency"))
    method = models.CharField(
        max_length=20, choices=PAYMENT_METHODS, default="paypal", verbose_name=_("Payment Method"))
    transaction_id = models.CharField(
        max_length=100, blank=True, null=True, verbose_name=_("Transaction ID"))
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending", verbose_name=_("Status"))
    direction = models.CharField(max_length=10, choices=[
        ('month', _("Monthly")), ('year', _("Yearly"))], default='month', verbose_name=_("Direction"))

    class Meta:
        verbose_name = _("Payment")
        verbose_name_plural = _("Payments")
        ordering = ["-created_at"]
        # Prevent duplicate pending payments
        constraints = [
            models.UniqueConstraint(
                fields=['client', 'plan', 'status'],
                condition=models.Q(status='pending'),
                name='unique_pending_payment'
            )
        ]

    def __str__(self):
        return f"{self.client} - {self.amount} {self.currency} via {self.method} ({self.status})"

    def apply_to_client(self):
        """Apply plan to client if payment is success"""
        if self.status == 'success':
            try:
                update_client_plan(self)
                payment_logger.info(
                    f"Successfully applied plan {self.plan} to client {self.client}")
            except Exception as e:
                payment_logger.error(
                    f"Failed to apply plan to client: {str(e)}")
                raise
        else:
            payment_logger.warning(
                f"Attempted to apply plan for non-successful payment: {self.id}")

class TenantSettings(BaseModel):
    client = models.OneToOneField(
        'Client', on_delete=models.CASCADE, null=True, blank=True, verbose_name=_('Client'))
    business_name = models.CharField(
        max_length=255, default="Optics Tenant", verbose_name=_('Business Name'))
    description = models.TextField(
        blank=True, default="Default description.", verbose_name=_('Description'))
    # Social Media
    facebook = models.URLField(
        blank=True, default='https://www.facebook.com', verbose_name=_('Facebook'))
    instagram = models.URLField(
        blank=True, default='https://www.instagram.com', verbose_name=_('Instagram'))
    whatsapp = models.CharField(
        max_length=20, blank=True, default='', verbose_name=_('WhatsApp'))
    twitter = models.URLField(
        blank=True, default='https://www.twitter.com', verbose_name=_('Twitter'))
    tiktok = models.URLField(
        blank=True, default='https://www.tiktok.com', verbose_name=_('TikTok'))
    linkedin = models.URLField(
        blank=True, default='https://www.linkedin.com', verbose_name=_('LinkedIn'))

    # Contact Info
    phone = models.CharField(max_length=20, blank=True,
                             default='', verbose_name=_('Phone'))
    email = models.EmailField(blank=True, default='', verbose_name=_('Email'))
    website = models.URLField(blank=True, default='',
                              verbose_name=_('Website'))

    # SEO Settings
    seo_title = models.CharField(
        max_length=255, blank=True, default='', verbose_name=_('SEO Title'))
    seo_description = models.TextField(
        blank=True, default='', verbose_name=_('SEO Description'))
    seo_keywords = models.CharField(
        max_length=255, blank=True, default='', verbose_name=_('SEO Keywords'))

    address = models.CharField(
        max_length=255, blank=True, default='', verbose_name=_('Address'))
    city = models.CharField(max_length=100, blank=True,
                            default='', verbose_name=_('City'))
    state = models.CharField(max_length=100, blank=True,
                             default='', verbose_name=_('State'))
    postal_code = models.CharField(
        max_length=20, blank=True, default='', verbose_name=_('Postal Code'))
    country = models.CharField(
        max_length=100, blank=True, default='', verbose_name=_('Country'))

    # bankDetails
    bank_name = models.CharField(
        max_length=100, blank=True, default='', verbose_name=_('Bank Name'))
    account_number = models.CharField(
        max_length=100, blank=True, default='', verbose_name=_('Account Number'))
    iban = models.CharField(max_length=100, blank=True,
                            default='', verbose_name=_('IBAN'))
    swift_code = models.CharField(
        max_length=100, blank=True, default='', verbose_name=_('SWIFT Code'))

    class Meta:
        verbose_name = _('Tenant Settings')
        verbose_name_plural = _('Tenant Settings')

    def __str__(self):
        return self.business_name if self.business_name else "Tenant Settings"
