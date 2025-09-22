from rest_framework.viewsets import ModelViewSet
from .models import PrescriptionRecord
from .serializers import PrescriptionRecordSerializer

from core.permissions.decorators import permission_required,role_required
from django.utils.decorators import method_decorator
from django_filters.rest_framework import DjangoFilterBackend
from .filters import PrescriptionRecordFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
# @method_decorator(role_required(['ADMIN','TECHNICIAN','OWNER','owner']), name='dispatch')
# @method_decorator(permission_required(['create_prescription','__all__']), name='dispatch')

class PrescriptionViewSet(ModelViewSet):
    queryset = PrescriptionRecord.objects.all()
    permission_classes = [AllowAny]
    serializer_class = PrescriptionRecordSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PrescriptionRecordFilter
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["get"])
    def filter_options(self, request):
        customer = PrescriptionRecord.objects.values_list('customer__id', flat=True).distinct()
        emails = PrescriptionRecord.objects.values_list('customer__email', flat=True).distinct()
        phones = PrescriptionRecord.objects.values_list('customer__phone', flat=True).distinct()
        first_names = PrescriptionRecord.objects.values_list('customer__first_name', flat=True).distinct()
        last_names = PrescriptionRecord.objects.values_list('customer__last_name', flat=True).distinct()

        return Response({
            "customer": list(filter(None, customer)),
            "emails": list(filter(None, emails)),
            "phones": list(filter(None, phones)),
            "first_names": list(filter(None, first_names)),
            "last_names": list(filter(None, last_names)),
        })



# استخدام pagination  لتحديد عدد الصفحات 

# from rest_framework.pagination import PageNumberPagination
# from rest_framework.viewsets import ModelViewSet

# class UserPagination(PageNumberPagination):
#     page_size = 10

# class UserViewSet(ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     pagination_class = UserPagination
