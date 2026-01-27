from core.models import BaseModel
from django.db import models
from django.utils.translation import gettext_lazy as _


class Manufacturer(BaseModel):
    """Manufacturer for glasses"""
    name = models.CharField(max_length=100, unique=True,
                            verbose_name=_("Name"))
    country = models.CharField(
        max_length=50, blank=True, verbose_name=_("Country"))
    website = models.URLField(blank=True, verbose_name=_("Website"))
    email = models.EmailField(blank=True, verbose_name=_("Email"))
    phone = models.CharField(max_length=20, blank=True,
                             verbose_name=_("Phone"))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Manufacturer")
        verbose_name_plural = _("Manufacturers")


class Brand(BaseModel):
    """Brand for glasses"""
    PRODUCT_TYPE_CHOICES = [
        ('CL', _('Contact Lenses')),
        ('SL', _('Spectacle Lenses')),
        ('FR', _('Frames')),
        ('AX', _('Accessories')),
        ('OT', _('Other')),
        ('DV', _('Devices')),
        ('All', _('All'))
    ]

    name = models.CharField(max_length=100, unique=True,
                            verbose_name=_("Name"))
    country = models.CharField(
        max_length=50, blank=True, verbose_name=_("Country"))
    website = models.URLField(blank=True, verbose_name=_("Website"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    product_type = models.CharField(
        max_length=50, choices=PRODUCT_TYPE_CHOICES, default='All', verbose_name=_("Product Type"))
    logo = models.ImageField(
        upload_to='brands/', blank=True, null=True, verbose_name=_("Logo"))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Brand")
        verbose_name_plural = _("Brands")


class Supplier(BaseModel):
    """Suppliers"""
    name = models.CharField(max_length=100, unique=True,
                            verbose_name=_("Name"))
    contact_person = models.CharField(
        max_length=100, blank=True, verbose_name=_("Contact Person"))
    email = models.EmailField(blank=True, verbose_name=_("Email"))
    phone = models.CharField(max_length=20, blank=True,
                             verbose_name=_("Phone"))
    address = models.CharField(max_length=255, blank=True, verbose_name=_(
        "Address"))  # Changed from TextField
    country = models.CharField(
        max_length=50, blank=True, verbose_name=_("Country"))
    website = models.URLField(blank=True, verbose_name=_("Website"))
    payment_terms = models.CharField(
        max_length=100, blank=True, verbose_name=_("Payment Terms"))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Supplier")
        verbose_name_plural = _("Suppliers")
