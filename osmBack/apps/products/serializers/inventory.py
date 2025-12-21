from rest_framework import serializers
from apps.products.models import Stock, StockMovement, StockTransfer, StockTransferItem


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class StockTransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransfer
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class StockTransferItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransferItem
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
