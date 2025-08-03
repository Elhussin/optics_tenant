from django.db import models
from core.permissions.roles import Role
# Create your models here.
from django.contrib.auth.models import AbstractUser
import django.utils.timezone as timezone


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

class Permission(models.Model):
    code = models.CharField(max_length=100, unique=True)  # مثل create_prescription
    description = models.TextField(blank=True)


class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('role', 'permission')

class User(AbstractUser):
    role = models.ForeignKey("Role", on_delete=models.SET_NULL, null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    client = models.ForeignKey('tenants.Client', on_delete=models.CASCADE, null=True, blank=True)


    def save(self, *args, **kwargs):
        # لو تم وضع is_deleted=True لأول مرة
        if self.is_deleted and not self.deleted_at:
            self.deleted_at = timezone.now()

        # لو تم استعادة العنصر
        elif not self.is_deleted and self.deleted_at:
            self.deleted_at = None

        super().save(*args, **kwargs)
