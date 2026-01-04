from rest_framework import serializers
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
            "user",  # Renamed from user_id
            "department",  # Renamed from department_id
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
        # Protect salary so regular users can't edit it via API if this used for self-update
        # Actually proper permission classes handle who can edit, but serializer can also help.


class LeaveSerializer(serializers.ModelSerializer):
    employee__user__username = serializers.CharField(
        source="employee.user.username", read_only=True, default=None)
    class Meta:

        model = Leave
        exclude = ['is_deleted']
        read_only_fields = ['status']  # Prevent self-approval


class AttendanceSerializer(serializers.ModelSerializer):
    employee__user__username = serializers.CharField(
        source="employee.user.username", read_only=True, default=None)
    class Meta:

        model = Attendance
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


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
