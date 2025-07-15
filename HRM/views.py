from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework import viewsets
from .serializers import EmployeeSerializer, LeaveSerializer,AttendanceSerializer,PerformanceReviewSerializer,PayrollSerializer,TaskSerializer,NotificationSerializer,DepartmentSerializer
from .models import Employee,Leave,Attendance,PerformanceReview,Payroll,Task,Notification,Department
from django_filters.rest_framework import DjangoFilterBackend
from .filters import EmployeeFilter,DepartmentFilter
from core.utils.options_builder import build_choices_from_queryset, build_choices_from_list
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


# class DepartmentViewSet(viewsets.ModelViewSet):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer
#     filter_backends = [DjangoFilterBackend]
#     filterset_class = DepartmentFilter

#     def destroy(self, request, *args, **kwargs):
#         return Response({"detail": "You can't remove this item. Use  delete instead."}, status=405)

class DepartmentViewSet(viewsets.ModelViewSet):

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = DepartmentFilter

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Department.objects.all()
        return Department.objects.filter(is_deleted=False)
#     def destroy(self, request, *args, **kwargs):
#         return Response({"detail": "You can't remove this item. Use  delete instead."}, status=405)


class EmployeeFormOptionsView(APIView):
    def get(self, request):
        return Response({
            "departments": build_choices_from_queryset(Department.objects.all()),
            "users": build_choices_from_queryset(User.objects.all(), label_field="username"),
            "positions": build_choices_from_list(Employee.Position),
        })
        

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = EmployeeFilter


class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
