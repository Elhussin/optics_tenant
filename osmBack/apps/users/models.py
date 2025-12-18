from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.conf import settings
from django.utils.text import slugify
import django.utils.timezone as timezone
from core.models import BaseModel, SoftDeleteManager, SoftDeleteMixin

class Role(BaseModel):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(
        'Permission',
        through='RolePermission',
        related_name='roles'
    )

    class Meta:
        verbose_name = "Role"
        verbose_name_plural = "Roles"
        ordering = ['name']

class Permission(BaseModel):
    code = models.CharField(max_length=100, unique=True)  # create_prescription
    description = models.TextField(blank=True)

class RolePermission(BaseModel):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('role', 'permission')

class SoftDeleteUserManager(SoftDeleteMixin, UserManager):
    pass

class User(AbstractUser):
    role = models.ForeignKey("Role", on_delete=models.SET_NULL, null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    client = models.ForeignKey('tenants.Client', on_delete=models.CASCADE, null=True, blank=True)

    objects = SoftDeleteUserManager()

    def delete(self, using=None, keep_parents=False):
        # CHANGED: Soft delete now also deactivates the user to prevent login
        self.is_deleted = True
        self.is_active = False 
        self.deleted_at = timezone.now()
        self.save()

    def save(self, *args, **kwargs):
        # If is_deleted set to True for first time
        if self.is_deleted and not self.deleted_at:
            self.deleted_at = timezone.now()
            self.is_active = False # Ensure deactivation

        # If restoring
        elif not self.is_deleted and self.deleted_at:
            self.deleted_at = None
            # Do NOT auto-activate. Admin should manually reactivate if needed, or decide policy.
            # But usually restore implies active. Let's keep is_active as is or restore it?
            # Safer to leave is_active control to admin unless explicit restore action.

        super().save(*args, **kwargs)


class ContactUs(BaseModel):
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    message = models.TextField(max_length=500)

class TenantSettings(BaseModel):
    business_name = models.CharField(max_length=255 , default="Optics Tenant")
    description = models.TextField(blank=True, default="Default description.")
    # Social Media
    facebook = models.URLField(blank=True, default='https://www.facebook.com')
    instagram = models.URLField(blank=True, default='https://www.instagram.com')
    whatsapp = models.CharField(max_length=20, blank=True, default='')
    twitter = models.URLField(blank=True, default='https://www.twitter.com')
    tiktok = models.URLField(blank=True, default='https://www.tiktok.com')
    linkedin = models.URLField(blank=True, default='https://www.linkedin.com')

    # Contact Info
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    website = models.URLField(blank=True, default='')

    # SEO Settings
    seo_title = models.CharField(max_length=255, blank=True, default='')
    seo_description = models.TextField(blank=True, default='')
    seo_keywords = models.CharField(max_length=255, blank=True, default='')

    address = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    postal_code = models.CharField(max_length=20, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='')

    # bankDetails - CHANGED: Removed dangerous hardcoded defaults
    bank_name = models.CharField(max_length=100, blank=True, default='')
    account_number = models.CharField(max_length=100, blank=True, default='')
    iban = models.CharField(max_length=100, blank=True, default='')
    swift_code = models.CharField(max_length=100, blank=True, default='')

    def __str__(self):
        return self.business_name if self.business_name else "Tenant Settings"

class Page(BaseModel):
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('ar', 'Arabic'),
    ]
    slug = models.SlugField(max_length=200, unique=True)   
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pages')
    default_language = models.CharField(
        max_length=2, 
        choices=LANGUAGE_CHOICES, 
        default='en'
    )
    is_published = models.BooleanField(default=False)

    class Meta:
        db_table = 'pages'
        ordering = ['-updated_at']

class PageContent(BaseModel):
    page = models.ForeignKey(
        Page, 
        related_name='translations',
        on_delete=models.CASCADE
    )
    language = models.CharField(max_length=2, choices=Page.LANGUAGE_CHOICES)
    title = models.CharField(max_length=200)
    # slug = models.SlugField(max_length=200)
    content = models.TextField(blank=True)
    seo_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(max_length=500, blank=True)
    meta_keywords = models.TextField(blank=True)
    
    class Meta:
        db_table = 'page_translations'
        unique_together = [
            ['page', 'language'],
        ]
