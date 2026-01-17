from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from core.views import BaseViewSet
from .models import PrescriptionRecord
from .serializers import PrescriptionRecordSerializer
from core.utils.filters_utils import FilterOptionsGenerator, get_display_name
from core.utils.create_filterset import create_filterset_class
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

CUSTOMER_RELATED_FIELDS = [
    "customer__id",
    "customer__phone",
    "customer__first_name",
    "customer__last_name",
    "created_by__username",
]
# # 👇 أسماء مخصصة لبعض الحقول
CUSTOMER_FIELD_LABELS = {
    "customer__first_name": "First Name",
    "customer__last_name": "Last Name",
    "created_by__username": "Created By",
    "customer__phone": "Phone",
}

# 👇 تعريف الحقول للفلترة الدقيقة
CUSTOMER_FILTER_FIELDS = {
    "customer": ["exact"],  # ✅ للفلترة المباشرة بـ customer ID
    "customer__id": ["exact"],
    "customer__phone": ["icontains"],
    "customer__email": ["icontains"],
    "customer__first_name": ["icontains"],
    "customer__last_name": ["icontains"],
    "created_by__username": ["icontains"],
    "created_by__first_name": ["icontains"],
}


class PrescriptionViewSet(BaseViewSet):
    # Optimizing query: select_related is good practice here
    queryset = PrescriptionRecord.objects.select_related(
        "customer", "created_by").all()
    serializer_class = PrescriptionRecordSerializer

    # ✅ تعريف حقول الفلترة والبحث
    search_fields = CUSTOMER_RELATED_FIELDS
    field_labels = CUSTOMER_FIELD_LABELS
    # ✅ استخدام filterset_fields بدلاً من filter_fields
    filterset_fields = CUSTOMER_FILTER_FIELDS

    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=["optometrist", "staff"],  # Specific roles
            super_roles=["admin", "owner"],  # Super roles
            required_permissions=["view_prescriptions"]
        )
    ]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        # Optional: Add security filtering if prescriptions should be private to branch/doctor
        return super().get_queryset()
