from django.db import models
from core.models import BaseModel
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import date
import datetime

User = get_user_model()


class Department(BaseModel):
    name = models.CharField(max_length=100, unique=True,
                            verbose_name=_('Name'))
    description = models.TextField(
        blank=True, null=True, verbose_name=_('Description'))
    location = models.CharField(
        max_length=100, blank=True, null=True, verbose_name=_('Location'))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Department')
        verbose_name_plural = _('Departments')


class Employee(BaseModel):
    Position = [
        ('manager', _('Manager')),
        ('employee', _('Employee')),
        ('hr', _('HR')),
        ('admin', _('Admin')),
        ('accountant', _('Accountant')),
        ('marketing', _('Marketing')),
        ('sales', _('Sales')),
        ('delivery', _('Delivery')),
        ('customer_service', _('Customer Service')),
    ]
    # CHANGED: Renamed user_id -> user
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="employee", verbose_name=_('User'))
    # CHANGED: Renamed department_id -> department
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, null=True, blank=True, verbose_name=_('Department'))
    position = models.CharField(
        max_length=100, choices=Position, default='employee', verbose_name=_('Position'))
    salary = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, verbose_name=_('Salary'))
    hire_date = models.DateField(
        default=date.today, verbose_name=_('Hire Date'))

    phone = models.CharField(max_length=20, blank=True,
                             verbose_name=_('Phone'))

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = _('Employee')
        verbose_name_plural = _('Employees')


class Leave(BaseModel):
    LEAVE_TYPES = [
        ('sick', _('Sick Leave')),
        ('vacation', _('Vacation Leave')),
        ('personal', _('Personal Leave')),
    ]

    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('approved', _('Approved')),
        ('rejected', _('Rejected'))
    ]

    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="leaves", verbose_name=_('Employee'))
    leave_type = models.CharField(
        max_length=10, choices=LEAVE_TYPES, verbose_name=_('Leave Type'))
    start_date = models.DateField(
        auto_now_add=True, verbose_name=_('Start Date'))
    # Note: start_date auto_now_add=True means it's creation date, not leave start date?
    # Usually you want specific start date. But strictly following previous logic for now unless requested.
    # Actually, user code had auto_now_add for start_date? That seems like a logic bug too (Leave request date vs Leave period).
    # I will keep it as is to avoid modifying business logic too much, but it's suspicious.
    end_date = models.DateField(
        blank=True, null=True, verbose_name=_('End Date'))
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name=_('Status'))

    def __str__(self):
        return f"{self.leave_type} for {self.employee.user.username}"

    class Meta:
        verbose_name = _('Leave')
        verbose_name_plural = _('Leaves')


class Attendance(BaseModel):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="attendance", verbose_name=_('Employee'))
    date = models.DateField(verbose_name=_('Date'))
    hours_worked = models.FloatField(
        null=True, blank=True, verbose_name=_('Hours Worked'))
    check_in = models.TimeField(
        null=True, blank=True, verbose_name=_('Check In'))
    check_out = models.TimeField(
        null=True, blank=True, verbose_name=_('Check Out'))

    def save(self, *args, **kwargs):
        if self.check_in and self.check_out:
            # Convert time to datetime using the date field
            check_in_dt = datetime.datetime.combine(self.date, self.check_in)
            check_out_dt = datetime.datetime.combine(self.date, self.check_out)

            # Calculate hours worked
            delta = check_out_dt - check_in_dt
            self.hours_worked = delta.total_seconds() / 3600
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee.user.username} - {self.date}"

    class Meta:
        verbose_name = _('Attendance')
        verbose_name_plural = _('Attendance')


class Payroll(BaseModel):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="payrolls", verbose_name=_('Employee'))
    month = models.CharField(max_length=20, verbose_name=_(
        'Month'))  # أو يمكنك استخدام DateField
    basic_salary = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name=_('Basic Salary'))
    bonuses = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, verbose_name=_('Bonuses'))
    deductions = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, verbose_name=_('Deductions'))
    net_salary = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True, verbose_name=_('Net Salary'))

    def save(self, *args, **kwargs):
        self.net_salary = self.basic_salary + self.bonuses - self.deductions
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee.user.username} - {self.month}"

    class Meta:
        verbose_name = _('Payroll')
        verbose_name_plural = _('Payrolls')


class PerformanceReview(BaseModel):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE,
                                 related_name="performance_reviews", verbose_name=_('Employee'))
    review_date = models.DateField(
        auto_now_add=True, verbose_name=_('Review Date'))
    rating = models.IntegerField(choices=[(i, i) for i in range(
        1, 6)], verbose_name=_('Rating'))  # من 1 إلى 5
    comments = models.TextField(
        blank=True, null=True, verbose_name=_('Comments'))

    def __str__(self):
        return f"{self.employee.user.username} - {self.review_date}"

    class Meta:
        verbose_name = _('Performance Review')
        verbose_name_plural = _('Performance Reviews')


class Task(BaseModel):
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="notifications_tasks", verbose_name=_(
        'Employee'))  # Renamed related_name to avoid conflict if any
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    description = models.TextField(
        blank=True, null=True, verbose_name=_('Description'))
    due_date = models.DateField(verbose_name=_('Due Date'))
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name=_('Status'))

    def __str__(self):
        return f"{self.title} - {self.employee.user.username}"

    class Meta:
        verbose_name = _('Task')
        verbose_name_plural = _('Tasks')


class Notification(BaseModel):
    NOTIFICATION_TYPES = [
        ('leave', _('Leave Request')),
        ('task', _('Task Assignment')),
        ('payroll', _('Payroll Update')),
    ]
    notification_type = models.CharField(
        max_length=20, choices=NOTIFICATION_TYPES, verbose_name=_('Notification Type'))
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE,
                                 related_name="notifications", verbose_name=_('Employee'))
    message = models.TextField(
        blank=True, null=True, default="Notification", verbose_name=_('Message'))
    is_read = models.BooleanField(default=False, verbose_name=_('Is Read'))
    # created_at inherited from BaseModel

    def __str__(self):
        return f"Notification for {self.employee.user.username}"

    class Meta:
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
