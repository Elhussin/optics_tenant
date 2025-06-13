from django.db import models
from core.models import BaseModel
from CRM.models import Customer
from django.core.validators import MinValueValidator, MaxValueValidator
# Create your models here.
from scripts.lens_power import spherical_lens_powers ,cylinder_lens_powers,additional_lens_powers
from decimal import Decimal
class PrescriptionRecord(BaseModel):
    """Prescription Record"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='prescriptions')
    
    # Right Eye
    right_sphere = models.CharField(max_length=20, choices=spherical_lens_powers,blank=True,null=True)
    right_cylinder = models.CharField(max_length=20, choices=cylinder_lens_powers,blank=True,null=True)
    right_axis = models.IntegerField(null=True, blank=True,validators=[MinValueValidator(0), MaxValueValidator(180)])
    
    # Left Eye
    left_sphere = models.CharField(max_length=20, choices=spherical_lens_powers,blank=True,null=True)
    left_cylinder = models.CharField(max_length=20, choices=cylinder_lens_powers,blank=True,null=True)
    left_axis = models.IntegerField(null=True, blank=True,validators=[MinValueValidator(0), MaxValueValidator(180)])

    # Reading ADD
    right_reading_add = models.CharField(max_length=20, choices=additional_lens_powers,blank=True,null=True)
    left_reading_add = models.CharField(max_length=20, choices=additional_lens_powers,blank=True,null=True)
    
    # Additional Information
    right_pupillary_distance = models.IntegerField(null=True, blank=True)
    left_pupillary_distance = models.IntegerField(null=True, blank=True)
    doctor_name = models.CharField(max_length=200, blank=True)
    prescription_date = models.DateField()
    notes = models.TextField(blank=True)
    
    
    def __str__(self):
        return f"Prescription {self.customer.full_name} - {self.prescription_date}"
