from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.sales.models import PaymentMethod


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Payment Method Serializer"""

    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'name_ar', 'name_en', 'code',
            'is_active', 'icon', 'provider_fees_percent',
            'is_installment', 'gl_account', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_provider_fees_percent(self, value):
        """Validate that fees percentage is between 0 and 100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                str(_('Fees percentage must be between 0 and 100'))
            )
        return value

    def validate_code(self, value):
        """Validate code format"""
        # Ensure code is lowercase
        return value.lower()
