from rest_framework import serializers
from apps.sales.models import PaymentMethod


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'name_ar', 'name_en', 'code',
            'is_active', 'icon', 'provider_fees_percent',
            'is_installment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
