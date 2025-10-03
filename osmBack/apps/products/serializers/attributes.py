from rest_framework import serializers
from apps.products.models import Attributes, AttributeValue

class AttributesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attributes
        fields = '__all__'

class AttributeValueSerializer(serializers.ModelSerializer):
    attribute_name = serializers.CharField(source='attribute_id.name', read_only=True)
    class Meta:
        model = AttributeValue
        fields = '__all__'
        
