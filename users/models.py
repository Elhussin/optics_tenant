from django.db import models
from core.permissions.roles import Role
# Create your models here.
from django.contrib.auth.models import AbstractUser
import django.utils.timezone as timezone
from  core.models import BaseModel
from django.conf import settings

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(
        'Permission',
        through='RolePermission',
        related_name='roles'
    )

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


class Page(BaseModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.CharField(max_length=255, blank=True, null=True)
    author = models.ForeignKey('User', on_delete=models.CASCADE, related_name='pages')

    def __str__(self):
        return self.title


class PageContent(BaseModel):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="translations")
    language = models.CharField(max_length=10, choices=settings.LANGUAGES)
    title = models.CharField(max_length=255)
    content = models.TextField()
    seo_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ('page', 'language')  # لضمان عدم تكرار لغة معينة لنفس الصفحة

    def __str__(self):
        return f"{self.page.slug} ({self.language})"

class ContactUs(BaseModel):
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    message = models.TextField(max_length=500)




