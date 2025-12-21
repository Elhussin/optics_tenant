from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from .serializers import EmployeeSerializer, LeaveSerializer, AttendanceSerializer, PerformanceReviewSerializer, PayrollSerializer, TaskSerializer, NotificationSerializer, DepartmentSerializer
from .models import Employee, Leave, Attendance, PerformanceReview, Payroll, Task, Notification, Department
from django_filters.rest_framework import DjangoFilterBackend
from .filters import EmployeeFilter, DepartmentFilter
from core.utils.options_builder import build_choices_from_queryset, build_choices_from_list
from django.contrib.auth import get_user_model
from core.views import BaseViewSet
from rest_framework.views import APIView
# Assuming this import is needed for RoleOrPermissionRequired
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

User = get_user_model()


class DepartmentViewSet(BaseViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = DepartmentFilter

    def get_queryset(self):
        # Departments are generally public internal info, but maybe hide deleted
        return Department.objects.all()


class EmployeeFormOptionsView(APIView):
    def get(self, request):
        return Response({
            "departments": build_choices_from_queryset(Department.objects.all()),
            "users": build_choices_from_queryset(User.objects.all(), label_field="username"),
            "positions": build_choices_from_list(Employee.Position),
        })


# Helper roles
HR_ROLES = ["hr", "manager"]
SUPER_ROLES = ["admin", "owner"]


class HRMBaseViewSet(BaseViewSet):
    """
    Base ViewSet for HRM that helps restrict access based on employee role.
    """
    permission_classes = [
        permissions.IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=HR_ROLES, super_roles=SUPER_ROLES)
    ]

    def get_employee(self):
        if hasattr(self.request.user, 'employee'):
            return self.request.user.employee
        return None

    def is_hr_or_admin(self):
        # We rely on Permission classes for general access, but this helps for field-level filtering
        user = self.request.user
        if user.is_superuser:
            return True
        if hasattr(user, 'role') and user.role.name in (HR_ROLES + SUPER_ROLES):
            return True
        # Also check internal employee position as fallback if roles aren't perfectly synced
        emp = self.get_employee()
        # Adjust strings based on choices
        if emp and emp.position in ['hr', "HR Manager", "Admin"]:
            return True
        return False


class EmployeeViewSet(HRMBaseViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = EmployeeFilter

    def get_permissions(self):
        # Everyone can list (directory), but only HR can create/edit
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()


class LeaveViewSet(HRMBaseViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

    def get_permissions(self):
        # Allow employees to Create/List their OWN leaves
        if self.action in ['create', 'list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        if self.is_hr_or_admin():
            return Leave.objects.all()
        # Regular user sees only own leaves
        emp = self.get_employee()
        if emp:
            return Leave.objects.filter(employee=emp)
        return Leave.objects.none()

    def perform_create(self, serializer):
        # Auto-assign employee
        emp = self.get_employee()
        if emp:
            serializer.save(employee=emp)
        else:
            # HR creating for someone else? Logic depends on form.
            serializer.save()


class AttendanceViewSet(HRMBaseViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        # Employees can view their attendance? Maybe check in/out?
        if self.action in ['list', 'retrieve', 'create']:  # If self-check-in allowed
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        if self.is_hr_or_admin():
            return Attendance.objects.all()
        emp = self.get_employee()
        if emp:
            return Attendance.objects.filter(employee=emp)
        return Attendance.objects.none()


class PerformanceReviewViewSet(HRMBaseViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    # Only HR writes reviews. Employees can read theirs.

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        if self.is_hr_or_admin():
            return PerformanceReview.objects.all()
        emp = self.get_employee()
        if emp:
            return PerformanceReview.objects.filter(employee=emp)
        return PerformanceReview.objects.none()


class PayrollViewSet(HRMBaseViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    # Strict HR only for creation.

    def get_permissions(self):
        # Employees view only
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        if self.is_hr_or_admin():
            return Payroll.objects.all()
        emp = self.get_employee()
        if emp:
            return Payroll.objects.filter(employee=emp)
        return Payroll.objects.none()


class TaskViewSet(HRMBaseViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_permissions(self):
        # List/Update status allowed for employees
        if self.action in ['list', 'retrieve', 'partial_update', 'update']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        if self.is_hr_or_admin():
            return Task.objects.all()
        emp = self.get_employee()
        if emp:
            # Employee sees tasks assigned TO them
            return Task.objects.filter(employee=emp)
        return Task.objects.none()


class NotificationViewSet(HRMBaseViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def get_permissions(self):
        # Everyone sees their own notifications
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Everyone only sees OWN notifications
        emp = self.get_employee()
        if emp:
            return Notification.objects.filter(employee=emp)
        return Notification.objects.none()
