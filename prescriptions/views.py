from rest_framework.viewsets import ModelViewSet
from .models import PrescriptionRecord
from .serializers import PrescriptionRecordSerializer

from core.permissions.decorators import permission_required,role_required
from django.utils.decorators import method_decorator

@method_decorator(role_required(['ADMIN','TECHNICIAN','OWNER']), name='dispatch')
@method_decorator(permission_required(['create_prescription']), name='dispatch')
class PrescriptionViewSet(ModelViewSet):
    queryset = PrescriptionRecord.objects.all()
    
    serializer_class = PrescriptionRecordSerializer
