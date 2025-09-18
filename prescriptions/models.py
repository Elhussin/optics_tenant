from django.db import models
from core.models import BaseModel
from CRM.models import Customer
from users.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
# Create your models here.
from scripts.lens_power import spherical_lens_powers ,cylinder_lens_powers,additional_lens_powers
from decimal import Decimal
class PrescriptionRecord(BaseModel):
    """Prescription Record"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='prescriptions')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_prescriptions')

    # Right Eye
    right_sphere = models.CharField(max_length=20, choices=spherical_lens_powers,blank=True,null=True ,default="-00.00")
    right_cylinder = models.CharField(max_length=20, choices=cylinder_lens_powers,blank=True,null=True ,default="-00.00")
    right_axis = models.FloatField (null=True, blank=True,validators=[MinValueValidator(0), MaxValueValidator(180)],default=0)
    
    # Left Eye
    left_sphere = models.CharField(max_length=20, choices=spherical_lens_powers,blank=True,null=True ,default="-00.00")
    left_cylinder = models.CharField(max_length=20, choices=cylinder_lens_powers,blank=True,null=True ,default="-00.00")
    left_axis = models.FloatField (null=True, blank=True,validators=[MinValueValidator(0), MaxValueValidator(180)],default=0)

    # Reading ADD
    right_reading_add = models.CharField(max_length=20, choices=additional_lens_powers,blank=True,null=True ,default="-00.00")
    left_reading_add = models.CharField(max_length=20, choices=additional_lens_powers,blank=True,null=True ,default="-00.00")

    
    # Additional Information
    right_pupillary_distance = models.FloatField(null=True, blank=True)
    left_pupillary_distance = models.FloatField(null=True, blank=True)
    sigmant_right = models.CharField(max_length=20, blank=True)
    sigmant_left = models.CharField(max_length=20, blank=True)
    a_v_right = models.CharField(max_length=20, blank=True)
    a_v_left = models.CharField(max_length=20, blank=True)
    # doctor_name = models.CharField(max_length=200, blank=True)
    # prescription_date = models.DateField()
    notes = models.TextField(blank=True)
    
    
    def __str__(self):
        return f"Prescription {self.customer.first_name} {self.customer.last_name} - {self.created_at}"
