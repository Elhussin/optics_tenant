from rest_framework import serializers
from products.models import ProductVariantMarketing


class ProductVariantMarketingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariantMarketing
        fields = '__all__'
