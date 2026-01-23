from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import (Department, Employee, Leave, Attendance,
                     PerformanceReview, Payroll, Task, Notification)


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.username", read_only=True, default=None)
    department_name = serializers.CharField(
        source="department.name", read_only=True, default=None)

    class Meta:
        model = Employee
        fields = [
            "id",
            "user", 
            "department", 
            "user_name",
            "department_name",
            "position",
            "salary",
            "phone",
            "hire_date",
            "is_active",
            "is_deleted",
            "created_at",
            "updated_at",
        ]
  

class LeaveSerializer(serializers.ModelSerializer):
    employee__user__username = serializers.CharField(
        source="employee.user.username", read_only=True, default=None)

    class Meta:
        model = Leave
        exclude = ['is_deleted']
        read_only_fields = ['status']  # Prevent self-approval

    def validate(self, data):
        """التحقق من صحة الإجازة"""
        start_date = data.get('start_date') or (
            self.instance.start_date if self.instance else None)
        end_date = data.get('end_date') or (
            self.instance.end_date if self.instance else None)

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                _('End date must be after or equal to start date')
            )

        return data


class AttendanceSerializer(serializers.ModelSerializer):
    employee__user__username = serializers.CharField(
        source="employee.user.username", read_only=True, default=None)

    class Meta:
        model = Attendance
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """التحقق من صحة الحضور"""
        check_in = data.get('check_in') or (
            self.instance.check_in if self.instance else None)
        check_out = data.get('check_out') or (
            self.instance.check_out if self.instance else None)

        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError(
                _('Check-out time must be after check-in time')
            )

        return data


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee__user__username = serializers.CharField(
        source="employee.user.username", read_only=True, default=None)

    class Meta:

        model = PerformanceReview
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PayrollSerializer(serializers.ModelSerializer):
    employee__user__username = serializers.CharField(
        source="employee.user.username", read_only=True, default=None)

    class Meta:
        model = Payroll
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_basic_salary(self, value):
        """التحقق من الراتب"""
        if value is not None and value < 0:
            raise serializers.ValidationError(
                _('Basic salary cannot be negative')
            )
        return value

    def validate_deductions(self, value):
        """التحقق من الخصومات"""
        if value is not None and value < 0:
            raise serializers.ValidationError(
                _('Deductions cannot be negative')
            )
        return value

    def validate_bonuses(self, value):
        """التحقق من المكافآت"""
        if value is not None and value < 0:
            raise serializers.ValidationError(
                _('Bonuses cannot be negative')
            )
        return value


class TaskSerializer(serializers.ModelSerializer):
    employee__user__username = serializers.CharField(
        source="employee.user.username", read_only=True, default=None)

    class Meta:

        model = Task
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    employee__user__username = serializers.CharField(
        source="employee.user.username", read_only=True, default=None)

    class Meta:

        model = Notification
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
