
from .product import ProductVariant
from core.models import BaseModel
from django.db import models
from django.utils.translation import gettext_lazy as _


class ProductVariantMarketing(BaseModel):
    GENDER_CHOICES = [
        ('unisex', _('Unisex')),
        ('men', _('Men')),
        ('women', _('Women')),
        ('kids', _('Kids'))
    ]

    AGE_GROUP_CHOICES = [
        ('adult', _('Adult')),
        ('child', _('Child')),
        ('senior', _('Senior'))
    ]
    variant = models.ForeignKey(ProductVariant, related_name='marketing',
                                on_delete=models.CASCADE, verbose_name=_("Product Variant"))
    title = models.CharField(max_length=200, verbose_name=_("Title"))
    description = models.TextField(verbose_name=_("Description"))
    meta_title = models.CharField(
        max_length=200, blank=True, verbose_name=_("Meta Title"))
    meta_description = models.CharField(
        max_length=300, blank=True, verbose_name=_("Meta Description"))
    meta_keywords = models.CharField(
        max_length=200, blank=True, verbose_name=_("Meta Keywords"))
    slug = models.SlugField(unique=True, verbose_name=_("Slug"))
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(
        auto_now=True, verbose_name=_("Updated At"))
    seo_image = models.ImageField(
        upload_to='products/marketing/', blank=True, null=True, verbose_name=_("SEO Image"))
    seo_image_alt = models.CharField(
        max_length=200, blank=True, verbose_name=_("SEO Image Alt Text"))

    gender = models.CharField(
        max_length=10, choices=GENDER_CHOICES, default='unisex', verbose_name=_("Gender"))
    age_group = models.CharField(
        max_length=20, choices=AGE_GROUP_CHOICES, blank=True, verbose_name=_("Age Group"))

    def __str__(self):
        return f"{self.variant.product.name} - {self.variant.color}"

    class Meta:
        verbose_name = _("Product Variant Marketing")
        verbose_name_plural = _("Product Variant Marketing")
