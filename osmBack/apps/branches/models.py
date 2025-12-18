from django.db import models
from core.models import BaseModel
from apps.hrm.models import Employee

# Create your models here.
class Branch(BaseModel):
    BRANCH_CHOICES = [
        ('store', 'Store'),
        ('branch', 'Branch'),
    ]
    name = models.CharField(max_length=100, unique=True)
    branch_code = models.CharField(max_length=10, unique=True, editable=False, blank=True)

    branch_type = models.CharField(max_length=10, choices=BRANCH_CHOICES)
    country = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    is_main_branch = models.BooleanField(default=False)
    allows_online_orders = models.BooleanField(default=True)

    operating_hours = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Branches"

    def save(self, *args, **kwargs):
        if not self.branch_code:
            self.branch_code = self.generate_unique_code()
        super().save(*args, **kwargs)

    def generate_unique_code(self):
        prefix = "ST" if self.branch_type == "store" else "BR"
        # Safer approach than simple count: ensure uniqueness
        count = Branch.objects.filter(branch_type=self.branch_type).count() + 1
        code = f"{prefix}{count:03d}"
        
        # Simple collision avoidance loop
        while Branch.objects.filter(branch_code=code).exists():
            count += 1
            code = f"{prefix}{count:03d}"
            
        return code


class BranchUsers(BaseModel):
    # Fixed Naming: Removed _id suffix to prevent branch_id_id
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='staff')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='assigned_branches')
    is_active = models.BooleanField(default=True) # Renamed from status
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.employee.user.username} - {self.branch.name}"    
    
    class Meta:
        unique_together = ('branch', 'employee')


class Shift(BaseModel):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='shifts')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='shifts')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.employee.user.username} - {self.branch.name} ({self.start_time.date()})"

    class Meta:
        ordering = ['-start_time']
