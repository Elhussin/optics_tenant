from rest_framework import serializers
from .models import PrescriptionRecord

class PrescriptionRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionRecord
        fields = '__all__'
