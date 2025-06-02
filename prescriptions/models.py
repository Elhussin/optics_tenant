from django.db import models
from users.models import Customer

# Create your models here.
class PrescriptionRecord(models.Model):
    """Prescription Record"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='prescriptions')
    
    # Right Eye
    right_sphere = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    right_cylinder = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    right_axis = models.IntegerField(null=True, blank=True)
    
    # Left Eye
    left_sphere = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    left_cylinder = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    left_axis = models.IntegerField(null=True, blank=True)

    # Reading ADD
    right_reading_add = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    left_reading_add = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Additional Information
    right_pupillary_distance = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    left_pupillary_distance = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    doctor_name = models.CharField(max_length=200, blank=True)
    prescription_date = models.DateField()
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)  # the current prescription
    
    def __str__(self):
        return f"Prescription {self.customer.full_name} - {self.prescription_date}"
