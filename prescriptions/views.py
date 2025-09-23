from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from django_filters.rest_framework import DjangoFilterBackend

from .models import PrescriptionRecord
from .serializers import PrescriptionRecordSerializer
from core.utils.filters_utils import FilterOptionsGenerator, create_filterset_class

# تعريف الحقول للفلاتر
filter_fields = {
    "customer__id": ["exact"],
    "customer__phone": ["icontains"],
    "customer__email": ["icontains"],  # ← أضف الحقل الديناميكي هنا
    "customer__first_name": ["icontains"],
    "customer__last_name": ["icontains"],
    "created_by__username": ["icontains"],
    "created_by__id": ["exact"],
}
PrescriptionRecordFilter = create_filterset_class(PrescriptionRecord, filter_fields)

# إنشاء FilterSet ديناميكي


class PrescriptionViewSet(ModelViewSet):
    queryset = PrescriptionRecord.objects.all()
    serializer_class = PrescriptionRecordSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = PrescriptionRecordFilter

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


    # @action(detail=False, methods=["get"])
    # def filter_options(self, request: Request) -> Response:
    #     generator = FilterOptionsGenerator(
    #         queryset=self.get_queryset(),
    #         filterset_class=self.filterset_class,
    #         query_params=request.query_params
    #     )
    #     fields = ["customer__id", "customer__email", "customer__phone"]
    #     options = generator.generate_options(fields)
    #     return Response(options)

    @action(detail=False, methods=["get"])
    def filter_options(self, request: Request) -> Response:
        generator: FilterOptionsGenerator = FilterOptionsGenerator(
            queryset=self.get_queryset(),
            filterset_class=self.filterset_class,
            query_params=request.query_params
        )
        fields: list[str] = ["customer__id", "customer__email", "customer__phone"]
        options: dict[str, list] = generator.generate_options(fields)
        return Response(options)
