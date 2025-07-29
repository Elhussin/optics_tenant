

# Create your models here.
from django_tenants.models import TenantMixin, DomainMixin
from django.db import models
import uuid
from datetime import timedelta
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

def get_expiration_date():
    return timezone.now() + timedelta(days=1)


PLAN_CHOICES = [
    ('trial', _('Trial')),
    ('basic', _('Basic')),
    ('premium', _('Premium')),
    ('enterprise', _('Enterprise'))
]

PLAN_LIMITS = {
    'trial': {'max_users': 1, 'max_branches': 1},
    'basic': {'max_users': 5, 'max_branches': 2},
    'premium': {'max_users': 50, 'max_branches': 5},
    'enterprise': {'max_users': 200, 'max_branches': 20}
}

class PendingTenantRequest(models.Model):
    schema_name = models.CharField(max_length=63, unique=True,verbose_name=_("Company Name"))
    name = models.CharField(max_length=100,verbose_name=_("Name"))
    email = models.EmailField(unique=True,verbose_name=_("Email"))
    password = models.CharField(max_length=128,verbose_name=_("Password"))
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_activated = models.BooleanField(default=False,verbose_name=_("Activated"))
    created_at = models.DateTimeField(auto_now_add=True,verbose_name=_("Created At"))
    expires_at = models.DateTimeField(default=get_expiration_date,verbose_name=_("Expires At"))  
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='trial',verbose_name=_("Plan"))
    max_users = models.IntegerField(default=5,verbose_name=_("Max Users"))
    max_products = models.IntegerField(default=1000,verbose_name=_("Max Products"))
    max_branches = models.IntegerField(default=1,verbose_name=_("Max Branches"))
    

    

class Client(TenantMixin):
    name = models.CharField(max_length=100,verbose_name=_("Company Name"))
    paid_until = models.DateField(null=True, blank=True,verbose_name=_("Paid Until"))
    on_trial = models.BooleanField(default=True,verbose_name=_("On Trial"))
    auto_create_schema = True

    def __str__(self):
        return self.name

class Domain(DomainMixin):
    pass







