from django_tenants.models import TenantMixin, DomainMixin
from django.db import models
import uuid
from datetime import timedelta
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from core.constants.tenants import PAYMENT_METHODS, STATUS_CHOICES, CURANCY
from core.utils.update_client_plan import update_client_plan
from core.utils.expiration_date import expiration_date

class SubscriptionPlan(models.Model):
    """Plane Subscription """
    name = models.CharField(max_length=50, unique=True)  # trial, basic, premium...
    duration_days = models.PositiveIntegerField()
    max_users = models.PositiveIntegerField()
    max_branches = models.PositiveIntegerField()
    max_products = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default="USD", choices=CURANCY)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("Subscription Plan")
        verbose_name_plural = _("Subscription Plans")
        ordering = ["price"]

    def __str__(self):
        return f"{self.name} ({self.price} {self.currency})"

class PendingTenantRequest(models.Model):
    """Pending tenant requests"""
    plan = models.ForeignKey("SubscriptionPlan", on_delete=models.SET_NULL, null=True,)
    schema_name = models.CharField(max_length=63, unique=True, verbose_name=_("Schema Name"))
    name = models.CharField(max_length=100, verbose_name=_("Company Name"))
    email = models.EmailField(unique=True, verbose_name=_("Email"))
    password = models.CharField(max_length=128, verbose_name=_("Password"))
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    token_expires_at = models.DateTimeField(verbose_name=_("Token Expires At"))
    is_activated = models.BooleanField(default=False, verbose_name=_("Activated"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    expires_at = models.DateTimeField(blank=True, null=True, verbose_name=_("Expires At"))
    is_deleted = models.BooleanField(default=False, verbose_name=_("Deleted"))

    class Meta:
        verbose_name = _("Pending Tenant Request")
        verbose_name_plural = _("Pending Tenant Requests")

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Set plan to trial and expires_at to expiration_date"""
        if self.plan and not self.expires_at:
            self.token_expires_at = expiration_date(1)
            self.expires_at = expiration_date(self.plan.duration_days)
            self.plan = "SubscriptionPlan".objects.get(name="trial")
        super().save(*args, **kwargs)

class Client(TenantMixin):
    """Tenants (Clients) """
    plan = models.ForeignKey("SubscriptionPlan", on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=100, verbose_name=_("Company Name"))
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

class Domain(DomainMixin):
    """Domains for tenants"""
    def __str__(self):
        return self.domain

class Payment(models.Model):
    """سجل المدفوعات"""
    client = models.ForeignKey("Client", on_delete=models.CASCADE, related_name="payments")
    plan = models.ForeignKey("SubscriptionPlan", on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD", choices=CURANCY)
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default="paypal")
    transaction_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Payment")
        verbose_name_plural = _("Payments")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.client} - {self.amount} {self.currency} via {self.method} ({self.status})"

    def apply_to_client(self):
        """Apply plan to client if payment is success"""
        update_client_plan(self)
