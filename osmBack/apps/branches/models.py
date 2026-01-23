from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel
from apps.hrm.models import Employee

# Create your models here.


class Branch(BaseModel):
    BRANCH_CHOICES = [
        ('store', _('Store')),
        ('branch', _('Branch')),
    ]
    name = models.CharField(max_length=100, unique=True,
                            verbose_name=_('Branch Name'))
    branch_code = models.CharField(
        max_length=10,
        unique=True,
        editable=False,
        blank=True,
        verbose_name=_('Branch Code')
    )
    branch_type = models.CharField(
        max_length=10,
        choices=BRANCH_CHOICES,
        verbose_name=_('Branch Type')
    )
    country = models.TextField(blank=True, verbose_name=_('Country'))
    city = models.CharField(max_length=100, blank=True, verbose_name=_('City'))
    address = models.TextField(blank=True, verbose_name=_('Address'))
    phone = models.CharField(max_length=20, blank=True,
                             verbose_name=_('Phone'))
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    is_main_branch = models.BooleanField(
        default=False, verbose_name=_('Is Main Branch'))
    allows_online_orders = models.BooleanField(
        default=True, verbose_name=_('Allows Online Orders'))
    operating_hours = models.JSONField(
        default=dict, blank=True, verbose_name=_('Operating Hours'))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Branch')
        verbose_name_plural = _('Branches')

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
    branch = models.ForeignKey(
        Branch, on_delete=models.CASCADE, related_name='staff', verbose_name=_('Branch'))
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE,
                                 related_name='assigned_branches', verbose_name=_('Employee'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    notes = models.TextField(null=True, blank=True, verbose_name=_('Notes'))

    def __str__(self):
        return f"{self.employee.user.username} - {self.branch.name}"

    class Meta:
        unique_together = ('branch', 'employee')
        verbose_name = _('Branch User')
        verbose_name_plural = _('Branch Users')


class Shift(BaseModel):
    branch = models.ForeignKey(
        Branch, on_delete=models.CASCADE, related_name='shifts', verbose_name=_('Branch'))
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name='shifts', verbose_name=_('Employee'))
    start_time = models.DateTimeField(verbose_name=_('Start Time'))
    end_time = models.DateTimeField(verbose_name=_('End Time'))
    notes = models.TextField(blank=True, null=True, verbose_name=_('Notes'))

    def __str__(self):
        return f"{self.employee.user.username} - {self.branch.name} ({self.start_time.date()})"

    class Meta:
        ordering = ['-start_time']
        verbose_name = _('Shift')
        verbose_name_plural = _('Shifts')
