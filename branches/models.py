from django.db import models
from core.models import BaseModel
from HRM.models import Employee

# Create your models here.
class Branch(BaseModel):
    BRANCH_CHOICES = [
        ('store', 'Store'),
        ('branch', 'Branch'),
    ]
    name = models.CharField(max_length=100,unique=True)
    branch_code = models.CharField(max_length=10, unique=True)
    branch_type = models.CharField(max_length=10, choices=BRANCH_CHOICES)
    country = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    is_main_branch = models.BooleanField(default=False)
    allows_online_orders = models.BooleanField(default=True)
    
    # Operating hours (JSON for flexibility)
    operating_hours = models.JSONField(
        default=dict,
        help_text="Store operating hours for each day",
        blank=True
    )
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Branches"
        unique_together = ('branch_code', 'branch_type')


class BranchUsers(BaseModel):
    BRANCH_CHOICES = [
        ('manager', 'Manager'),
        ('staff', 'Staff'),
    ]
    role = models.CharField(max_length=10, choices=BRANCH_CHOICES)
    branch_id = models.ForeignKey(Branch, on_delete=models.CASCADE)
    employee_id = models.ForeignKey(Employee, on_delete=models.CASCADE)
    status = models.BooleanField(default=True)           /'''''
    notes = models.TextField(null=True, blank=True)
    def __str__(self):
        return f"{self.employee.user.username} - {self.branch}"    
    
    class Meta:
        unique_together = ('branch', 'employee')

