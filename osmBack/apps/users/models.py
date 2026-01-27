from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.conf import settings
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
import django.utils.timezone as timezone
from core.models import BaseModel, SoftDeleteManager, SoftDeleteMixin


class Role(BaseModel):
    name = models.CharField(max_length=50, unique=True, verbose_name=_('Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    permissions = models.ManyToManyField(
        'Permission',
        through='RolePermission',
        related_name='roles',
        verbose_name=_('Permissions')
    )

    class Meta:
        verbose_name = _('Role')
        verbose_name_plural = _('Roles')
        ordering = ['name']

    def __str__(self):
        return self.name


class Permission(BaseModel):
    code = models.CharField(max_length=100, unique=True,
                            verbose_name=_('Code'))  # create_prescription
    description = models.TextField(blank=True, verbose_name=_('Description'))

    class Meta:
        verbose_name = _('Permission')
        verbose_name_plural = _('Permissions')
        ordering = ['code']

    def __str__(self):
        return self.code


class RolePermission(BaseModel):
    role = models.ForeignKey(
        Role, on_delete=models.CASCADE, verbose_name=_('Role'))
    permission = models.ForeignKey(
        Permission, on_delete=models.CASCADE, verbose_name=_('Permission'))

    class Meta:
        verbose_name = _('Role Permission')
        verbose_name_plural = _('Role Permissions')
        unique_together = ('role', 'permission')


class SoftDeleteUserManager(SoftDeleteMixin, UserManager):
    pass


class User(AbstractUser):
    roles = models.ManyToManyField(
        "Role", related_name="users_list", blank=True, verbose_name=_('Roles'))
    is_deleted = models.BooleanField(
        default=False, verbose_name=_('Is Deleted'))
    deleted_at = models.DateTimeField(
        null=True, blank=True, verbose_name=_('Deleted At'))
    phone = models.CharField(max_length=20, null=True,
                             blank=True, verbose_name=_('Phone'))
    client = models.ForeignKey(
        'tenants.Client', on_delete=models.CASCADE, null=True, blank=True, verbose_name=_('Client'))

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
            self.is_active = False  # Ensure deactivation

        # If restoring
        elif not self.is_deleted and self.deleted_at:
            self.deleted_at = None
            # Do NOT auto-activate. Admin should manually reactivate if needed, or decide policy.
            # But usually restore implies active. Let's keep is_active as is or restore it?
            # Safer to leave is_active control to admin unless explicit restore action.

        super().save(*args, **kwargs)


class ContactUs(BaseModel):
    email = models.EmailField(verbose_name=_('Email'))
    phone = models.CharField(max_length=20, verbose_name=_('Phone'))
    name = models.CharField(max_length=100, verbose_name=_('Name'))
    message = models.TextField(max_length=500, verbose_name=_('Message'))

    class Meta:
        verbose_name = _('Contact Us')
        verbose_name_plural = _('Contact Us Messages')

    def __str__(self):
        return f"{self.name} - {self.email}"


class TenantSettings(BaseModel):
    client = models.OneToOneField(
        'tenants.Client', on_delete=models.CASCADE, null=True, blank=True, verbose_name=_('Client'))
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

    # bankDetails - CHANGED: Removed dangerous hardcoded defaults
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


class Page(BaseModel):
    LANGUAGE_CHOICES = [
        ('en', _('English')),
        ('ar', _('Arabic')),
    ]
    client = models.ForeignKey(
        'tenants.Client', on_delete=models.CASCADE, null=True, blank=True, verbose_name=_('Client'))
    slug = models.SlugField(max_length=200, unique=True,
                            verbose_name=_('Slug'))
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='pages', verbose_name=_('Author'))
    default_language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
        default='en',
        verbose_name=_('Default Language')
    )
    is_published = models.BooleanField(
        default=False, verbose_name=_('Is Published'))

    class Meta:
        verbose_name = _('Page')
        verbose_name_plural = _('Pages')
        db_table = 'pages'
        ordering = ['-updated_at']
        unique_together = ('client', 'slug')

    def __str__(self):
        return self.slug


class PageContent(BaseModel):
    page = models.ForeignKey(
        Page,
        related_name='translations',
        on_delete=models.CASCADE,
        verbose_name=_('Page')
    )
    language = models.CharField(
        max_length=2, choices=Page.LANGUAGE_CHOICES, verbose_name=_('Language'))
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    # slug = models.SlugField(max_length=200)
    content = models.TextField(blank=True, verbose_name=_('Content'))
    seo_title = models.CharField(
        max_length=200, blank=True, verbose_name=_('SEO Title'))
    meta_description = models.TextField(
        max_length=500, blank=True, verbose_name=_('Meta Description'))
    meta_keywords = models.TextField(
        blank=True, verbose_name=_('Meta Keywords'))

    class Meta:
        verbose_name = _('Page Content')
        verbose_name_plural = _('Page Contents')
        db_table = 'page_translations'
        unique_together = [
            ['page', 'language'],
        ]

    def __str__(self):
        return f"{self.page.slug} ({self.language})"
