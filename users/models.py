from django.db import models
from core.permissions.roles import Role
# Create your models here.
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    role = models.CharField(
        max_length=50,
        choices=[(role.name, role.value) for role in Role],
        default=Role.RECEPTIONIST.name
    )
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)



    def save(self, *args, **kwargs):
        # لو تم وضع is_deleted=True لأول مرة
        if self.is_deleted and not self.deleted_at:
            self.deleted_at = timezone.now()

        # لو تم استعادة العنصر
        elif not self.is_deleted and self.deleted_at:
            self.deleted_at = None

        super().save(*args, **kwargs)
