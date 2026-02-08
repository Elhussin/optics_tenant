from rest_framework import serializers
from apps.products.models.pricing_policy import PricingPolicy


class PricingPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPolicy
        fields = ['id', 'name', 'description', 'is_active']
