from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import PrescriptionRecord
from .serializers import PrescriptionRecordSerializer
from core.utils.filters_utils import FilterOptionsGenerator, create_filterset_class,get_display_name
CUSTOMER_RELATED_FIELDS = [
    "customer__id",
    "customer__phone",
    "customer__first_name",
    "customer__last_name",
    "created_by__username",
]
# # 👇 أسماء مخصصة لبعض الحقول
CUSTOM_FIELD_LABELS = {
    "customer__first_name": "First Name",
    "customer__last_name": "Last Name",
    "created_by__username": "Created By",
    "customer__phone": "Phone",
    

}

# 👇 تعريف الحقول للفلترة الدقيقة
filter_fields = {
    "customer__id": ["exact"],
    "customer__phone": ["icontains"],
    "customer__email": ["icontains"],
    "customer__first_name": ["icontains"],
    "customer__last_name": ["icontains"],
    "created_by__username": ["icontains"],
    "created_by__first_name": ["icontains"],
}

PrescriptionRecordFilter = create_filterset_class(PrescriptionRecord, filter_fields)





class PrescriptionViewSet(ModelViewSet):
    queryset = PrescriptionRecord.objects.select_related(
        "customer", "created_by"
    ).all()
    serializer_class = PrescriptionRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = PrescriptionRecordFilter
    search_fields = CUSTOMER_RELATED_FIELDS

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    @action(detail=False, methods=["get"])
    def filter_options(self, request):
        generator = FilterOptionsGenerator(
            queryset=self.get_queryset(),
            filterset_class=self.filterset_class,
            query_params=request.query_params,
        )
        options = generator.generate_options(CUSTOMER_RELATED_FIELDS)

        # 👇 كل حقل يرجع مع الاسم الأصلي + label + القيم
        formatted_options = [
            {
                "name": field,                # الاسم الأصلي (key للـ frontend)
                "label": get_display_name(CUSTOM_FIELD_LABELS,field),  # الاسم المعروض
                "values": values,             # القيم المتاحة
            }
            for field, values in options.items()
        ]
        return Response(formatted_options)
