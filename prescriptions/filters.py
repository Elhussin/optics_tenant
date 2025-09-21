# filters.py
import django_filters
from .models import PrescriptionRecord

class PrescriptionRecordFilter(django_filters.FilterSet):
    class Meta:
        model = PrescriptionRecord
        fields = {
            "customer__id": ["exact"],
            "customer__phone": ["exact", "icontains"],
            "created_by__username": ["exact", "icontains"],
            "created_by__first_name": ["exact", "icontains"],
            "created_by__last_name": ["exact", "icontains"],
     
     
        }
