from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.products.models import Attribute, AttributeValue


class AttributeValueSerializer(serializers.ModelSerializer):
    attribute_name = serializers.CharField(
        source='attribute.name', read_only=True)

    class Meta:
        model = AttributeValue
        fields = '__all__'
        read_only_fields = ['unique_key', 'label']

    def validate_value(self, value):
        """Ensure value is stripped of whitespace."""
        return value.strip()


class AttributeSerializer(serializers.ModelSerializer):
    values = AttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model = Attribute
        fields = '__all__'

    def validate_name(self, value):
        """Ensure attribute name is stripped of whitespace and title cased."""
        return value.strip()
