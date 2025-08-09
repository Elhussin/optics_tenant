from django.db import models
from core.permissions.roles import Role
# Create your models here.
from django.contrib.auth.models import AbstractUser
import django.utils.timezone as timezone
from  core.models import BaseModel
from django.conf import settings
from django.utils.text import slugify


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




class ContactUs(BaseModel):
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    message = models.TextField(max_length=500)


class TenantSettings(BaseModel):
    business_name = models.CharField(max_length=255 , default="Optics Tenant")
    logo = models.ImageField(upload_to='logos/', null=True, blank=True, default='logo.png')
    description = models.TextField(blank=True, default="This is a default description for the tenant settings.")

    # Social Media
    facebook = models.URLField(blank=True, default='https://www.facebook.com')
    instagram = models.URLField(blank=True, default='https://www.instagram.com')
    whatsapp = models.CharField(max_length=20, blank=True, default='whatsapp')
    twitter = models.URLField(blank=True, default='https://www.twitter.com')
    tiktok = models.URLField(blank=True, default='https://www.tiktok.com')
    linkedin = models.URLField(blank=True, default='https://www.linkedin.com')

    # Contact Info
    phone = models.CharField(max_length=20, blank=True, default='123-456-7890')
    email = models.EmailField(blank=True, default='email@example.com')
    website = models.URLField(blank=True, default='https://www.example.com')

    # UI Preferences
    primary_color = models.CharField(max_length=7, blank=True, default='#0000FF')  # Default to blue
    secondary_color = models.CharField(max_length=7, blank=True, default='#FFFFFF')  # Default to white

    # SEO Settings
    seo_title = models.CharField(max_length=255, blank=True, default='Default SEO Title')
    seo_description = models.TextField(blank=True, default='Default SEO Description')
    seo_keywords = models.CharField(max_length=255, blank=True, default='keyword1, keyword2')

    # Other Settings
    timezone = models.CharField(max_length=50, blank=True, default='UTC')
    currency = models.CharField(max_length=10, blank=True, default='USD')
    date_format = models.CharField(max_length=20, blank=True, default='YYYY-MM-DD')
    time_format = models.CharField(max_length=20, blank=True, default='24')

    address = models.CharField(max_length=255, blank=True, default='123 Default St, Default City, Default Country')
    city = models.CharField(max_length=100, blank=True, default='Default City')
    state = models.CharField(max_length=100, blank=True, default='Default State')
    postal_code = models.CharField(max_length=20, blank=True, default='12345')
    country = models.CharField(max_length=100, blank=True, default='Default Country')

    # bankDetails
    bank_name = models.CharField(max_length=100, blank=True, default='Default Bank')
    account_number = models.CharField(max_length=100, blank=True, default='123456789')
    iban = models.CharField(max_length=100, blank=True, default='DE89370400440532013000')
    swift_code = models.CharField(max_length=100, blank=True, default='DEUTDEDBFRA')

    def __str__(self):
        return self.business_name if self.business_name else "Tenant Settings"

class Page(BaseModel):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (PUBLISHED, 'Published'),
    ]
    
    slug = models.SlugField(max_length=50, unique=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pages')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=DRAFT)
    
    def __str__(self):
        # Get the title from default language or first available
        content = self.translations.filter(
            language=settings.LANGUAGE_CODE
        ).first()
        if not content:
            content = self.translations.first()
        return content.title if content else self.slug

    def save(self, *args, **kwargs):
        if not self.slug:
            # Auto-generate slug if not provided
            base_slug = slugify(self.title) if hasattr(self, 'title') else 'page'
            self.slug = self._generate_unique_slug(base_slug)
        super().save(*args, **kwargs)
    
    def _generate_unique_slug(self, base_slug):
        slug = base_slug
        counter = 1
        while Page.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

class PageContent(BaseModel):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="translations")
    language = models.CharField(max_length=10, choices=settings.LANGUAGES)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=True)
    seo_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ('page', 'language')

    def __str__(self):
        return f"{self.page.slug} ({self.language})"

    def save(self, *args, **kwargs):
        # Auto-generate SEO title if not provided
        if not self.seo_title:
            self.seo_title = self.title
        super().save(*args, **kwargs)