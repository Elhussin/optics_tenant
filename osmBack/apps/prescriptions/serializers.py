from rest_framework import serializers
from .models import PrescriptionRecord
from apps.crm.serializers import CustomerSerializer
from apps.users.serializers import UserSerializer


class PrescriptionRecordSerializer(serializers.ModelSerializer):

    # customer = CustomerSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    customer_name = serializers.CharField(
        source="customer.first_name", read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True)

    class Meta:
        model = PrescriptionRecord
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
        extra_kwargs = {
            'right_sphere': {'allow_null': True},
            'right_cylinder': {'allow_null': True},
            'left_sphere': {'allow_null': True},
            'left_cylinder': {'allow_null': True},
            'notes': {'allow_null': True},
        }

    def to_internal_value(self, data):
        # Clean empty strings to None for fields that might be sent as ""
        fields_to_clean = [
            'right_sphere', 'right_cylinder', 'right_axis',
            'left_sphere', 'left_cylinder', 'left_axis',
            'right_reading_add', 'left_reading_add',
            'right_pupillary_distance', 'left_pupillary_distance',
            'segment_height_right', 'segment_height_left',
            'visual_acuity_right', 'visual_acuity_left',
            'notes',
        ]

        for field in fields_to_clean:
            if field in data and data[field] == "":
                data[field] = None

        return super().to_internal_value(data)
