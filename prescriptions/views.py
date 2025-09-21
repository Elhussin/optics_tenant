from rest_framework.viewsets import ModelViewSet
from .models import PrescriptionRecord
from .serializers import PrescriptionRecordSerializer

from core.permissions.decorators import permission_required,role_required
from django.utils.decorators import method_decorator
from django_filters.rest_framework import DjangoFilterBackend
from .filters import PrescriptionRecordFilter
# @method_decorator(role_required(['ADMIN','TECHNICIAN','OWNER','owner']), name='dispatch')
# @method_decorator(permission_required(['create_prescription','__all__']), name='dispatch')

class PrescriptionViewSet(ModelViewSet):
    queryset = PrescriptionRecord.objects.all()
    
    serializer_class = PrescriptionRecordSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PrescriptionRecordFilter
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
