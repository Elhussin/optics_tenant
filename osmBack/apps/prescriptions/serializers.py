from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
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

    def _validate_sphere(self, value, field_name):
        """التحقق من قيمة Sphere (عادة بين -20 و +20)"""
        if value is not None:
            try:
                val = float(value)
                if val < -20 or val > 20:
                    raise serializers.ValidationError(
                        _('Sphere value must be between -20 and +20')
                    )
            except ValueError:
                pass  # Let standard choice validation handle invalid numbers
        return value

    def _validate_cylinder(self, value, field_name):
        """التحقق من قيمة Cylinder (عادة بين -10 و +10)"""
        if value is not None:
            try:
                val = float(value)
                if val < -10 or val > 10:
                    raise serializers.ValidationError(
                        _('Cylinder value must be between -10 and +10')
                    )
            except ValueError:
                pass
        return value

    def _validate_axis(self, value, field_name):
        """التحقق من قيمة Axis (بين 0 و 180)"""
        if value is not None and (value < 0 or value > 180):
            raise serializers.ValidationError(
                _('Axis value must be between 0 and 180')
            )
        return value

    def validate_right_sphere(self, value):
        return self._validate_sphere(value, 'right_sphere')

    def validate_left_sphere(self, value):
        return self._validate_sphere(value, 'left_sphere')

    def validate_right_cylinder(self, value):
        return self._validate_cylinder(value, 'right_cylinder')

    def validate_left_cylinder(self, value):
        return self._validate_cylinder(value, 'left_cylinder')

    def validate_right_axis(self, value):
        return self._validate_axis(value, 'right_axis')

    def validate_left_axis(self, value):
        return self._validate_axis(value, 'left_axis')

    def _validate_pupillary_distance(self, value, field_name):
        """التحقق من قيمة PD (عادة بين 25 و 80)"""
        if value is not None and (value < 25 or value > 80):
            raise serializers.ValidationError(
                _('Pupillary distance must be between 25 and 80 mm')
            )
        return value

    def validate_right_pupillary_distance(self, value):
        return self._validate_pupillary_distance(value, 'right_pupillary_distance')

    def validate_left_pupillary_distance(self, value):
        return self._validate_pupillary_distance(value, 'left_pupillary_distance')

    def validate(self, data):
        """
        Cross-field validation for prescription data
        """
        # Check if at least one eye has prescription data
        right_has_data = any([
            data.get('right_sphere'),
            data.get('right_cylinder'),
            data.get('right_axis')
        ])

        left_has_data = any([
            data.get('left_sphere'),
            data.get('left_cylinder'),
            data.get('left_axis')
        ])

        if not right_has_data and not left_has_data:
            raise serializers.ValidationError(
                _('At least one eye must have prescription data (sphere, cylinder, or axis)')
            )

        # Validate that if cylinder is provided, axis should also be provided
        if data.get('right_cylinder') and data.get('right_cylinder') != '-00.00':
            if not data.get('right_axis') and data.get('right_axis') != 0:
                raise serializers.ValidationError({
                    'right_axis': _('Axis is required when cylinder is provided for right eye')
                })

        if data.get('left_cylinder') and data.get('left_cylinder') != '-00.00':
            if not data.get('left_axis') and data.get('left_axis') != 0:
                raise serializers.ValidationError({
                    'left_axis': _('Axis is required when cylinder is provided for left eye')
                })

        # Validate customer is provided
        if not data.get('customer'):
            raise serializers.ValidationError({
                'customer': _('Customer is required for prescription record')
            })

        return data

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
