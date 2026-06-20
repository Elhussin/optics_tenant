from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel

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
        'users.User', on_delete=models.CASCADE, related_name='pages', verbose_name=_('Author'))
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
