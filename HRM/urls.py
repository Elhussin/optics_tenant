from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, LeaveViewSet, AttendanceViewSet, PerformanceReviewViewSet, PayrollViewSet, TaskViewSet, NotificationViewSet
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'leaves', LeaveViewSet)
router.register(r'attendances', AttendanceViewSet)
router.register(r'performance-reviews', PerformanceReviewViewSet)
router.register(r'payrolls', PayrollViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'notifications', NotificationViewSet)


urlpatterns = [
    path('', include(router.urls)),
]
