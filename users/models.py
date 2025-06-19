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

    phone = models.CharField(max_length=20, null=True, blank=True)




