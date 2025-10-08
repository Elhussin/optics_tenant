# from Learn.scripts.python.json_to_csv import f
from rest_framework import serializers
from apps.products.models import Attributes, AttributeValue


class AttributeValueSerializer(serializers.ModelSerializer):
    attribute_name = serializers.CharField(source='attribute_id.name', read_only=True)
    class Meta:
        model = AttributeValue
        fields = '__all__'
        # fields = ['id', 'value', 'attribute_id', 'attribute_name']
        

class AttributesSerializer(serializers.ModelSerializer):
    values = AttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model = Attributes
        # fields = ['id', 'name', 'values']
        fields = '__all__'

