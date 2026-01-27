from django.db import models
from core.models import BaseModel
from apps.crm.models import Customer
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
# Create your models here.
from scripts.lens_power import spherical_lens_powers, cylinder_lens_powers, additional_lens_powers
from decimal import Decimal

from django.utils.translation import gettext_lazy as _


class PrescriptionRecord(BaseModel):
    """Prescription Record"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE,
                                 related_name='prescriptions', verbose_name=_('Customer'))
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+', verbose_name=_('Created By'))

    # Right Eye
    right_sphere = models.CharField(max_length=20, choices=spherical_lens_powers,
                                    blank=True, null=True, default="-00.00", verbose_name=_('Right Sphere'))
    right_cylinder = models.CharField(max_length=20, choices=cylinder_lens_powers,
                                      blank=True, null=True, default="-00.00", verbose_name=_('Right Cylinder'))
    right_axis = models.FloatField(null=True, blank=True, validators=[MinValueValidator(
        0), MaxValueValidator(180)], default=0, verbose_name=_('Right Axis'))

    # Left Eye
    left_sphere = models.CharField(max_length=20, choices=spherical_lens_powers,
                                   blank=True, null=True, default="-00.00", verbose_name=_('Left Sphere'))
    left_cylinder = models.CharField(max_length=20, choices=cylinder_lens_powers,
                                     blank=True, null=True, default="-00.00", verbose_name=_('Left Cylinder'))
    left_axis = models.FloatField(null=True, blank=True, validators=[MinValueValidator(
        0), MaxValueValidator(180)], default=0, verbose_name=_('Left Axis'))

    # Reading ADD
    right_reading_add = models.CharField(max_length=20, choices=additional_lens_powers,
                                         blank=True, null=True, default="-00.00", verbose_name=_('Right Reading Add'))
    left_reading_add = models.CharField(max_length=20, choices=additional_lens_powers,
                                        blank=True, null=True, default="-00.00", verbose_name=_('Left Reading Add'))

    # Additional Information
    right_pupillary_distance = models.FloatField(
        null=True, blank=True, verbose_name=_('Right PD'))
    left_pupillary_distance = models.FloatField(
        null=True, blank=True, verbose_name=_('Left PD'))

    # Fixed Naming: sigmant -> segment_height
    segment_height_right = models.CharField(
        max_length=20, blank=True, null=True, verbose_name=_('Segment Height Right'))
    segment_height_left = models.CharField(
        max_length=20, blank=True, null=True, verbose_name=_('Segment Height Left'))

    # Fixed Naming: a_v -> visual_acuity
    visual_acuity_right = models.CharField(
        max_length=20, blank=True, null=True, verbose_name=_('Visual Acuity Right'))
    visual_acuity_left = models.CharField(
        max_length=20, blank=True, null=True, verbose_name=_('Visual Acuity Left'))

    vertical_distance_right = models.CharField(
        max_length=20, blank=True, null=True, verbose_name=_('Vertical Distance Right'))
    vertical_distance_left = models.CharField(
        max_length=20, blank=True, null=True, verbose_name=_('Vertical Distance Left'))

    notes = models.TextField(blank=True, null=True, verbose_name=_('Notes'))

    class Meta:
        verbose_name = _('Prescription Record')
        verbose_name_plural = _('Prescription Records')

    def __str__(self):
        return f"Prescription {self.customer.first_name} {self.customer.last_name} - {self.created_at}"
