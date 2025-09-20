
from rest_framework import serializers
from .models import PrescriptionRecord


class PrescriptionRecordSerializer(serializers.ModelSerializer):

    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = PrescriptionRecord
        fields = '__all__'

    def to_internal_value(self, data):
        # # Coerce empty strings to None for nullable fields
        
        for field in [
            'right_sphere', 'right_cylinder', 'right_axis',
            'left_sphere', 'left_cylinder', 'left_axis',
            'right_reading_add', 'left_reading_add',
            'right_pupillary_distance', 'left_pupillary_distance',
            'sigmant_right', 'sigmant_left',
            'a_v_right', 'a_v_left',
            'doctor_name', 'notes',
        ]:
            if field in data and data[field] == "":
                data[field] = None

        if 'customer' in data and data['customer'] == "":
            raise serializers.ValidationError({'customer': ['Customer field is required.']})
        

            

        return super().to_internal_value(data)
