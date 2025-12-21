from rest_framework import serializers
from apps.products.models import Supplier, Manufacturer, Brand


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
