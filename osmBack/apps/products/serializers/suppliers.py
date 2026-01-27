from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.products.models import Supplier, Manufacturer, Brand


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [f.name for f in Supplier._meta.fields if f.name != 'is_deleted']
        # fields = '__all__'
        # exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        return value.strip()

    def validate_email(self, value):
        if value:
            return value.lower().strip()
        return value


class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = [f.name for f in Manufacturer._meta.fields if f.name != 'is_deleted']
        # fields = '__all__'
        # exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        return value.strip()

    def validate_email(self, value):
        if value:
            return value.lower().strip()
        return value


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'
        # exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        return value.strip()
