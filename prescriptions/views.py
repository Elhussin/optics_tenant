from rest_framework.viewsets import ModelViewSet
from .models import PrescriptionRecord
from .serializers import PrescriptionRecordSerializer
from core.permissions.decorators import permission_required
from django.utils.decorators import method_decorator
# from core.permissions.decorators import role_required

@method_decorator(permission_required(['create_prescription']), name='dispatch')
class PrescriptionViewSet(ModelViewSet):
    queryset = PrescriptionRecord.objects.all()
    serializer_class = PrescriptionRecordSerializer
