

# Create your models here.
from django_tenants.models import TenantMixin, DomainMixin
from django.db import models
import uuid
class Client(TenantMixin):
    name = models.CharField(max_length=100)
    paid_until = models.DateField(null=True, blank=True)
    on_trial = models.BooleanField(default=True)

    # True to automatically create schema on save
    auto_create_schema = True

    def __str__(self):
        return self.name

class Domain(DomainMixin):
    pass


class PendingTenantRequest(models.Model):
    schema_name = models.CharField(max_length=63, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_activated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)