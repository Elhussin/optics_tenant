# serializers.py

from rest_framework import serializers
from .models import ProductVariant, Stocks, StockMovements, StockTransfer, StockTransferItem, Product



class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class ProductVariantSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = ProductVariant
        fields = '__all__'


class StocksSerializer(serializers.ModelSerializer):
    variant = ProductVariantSerializer(read_only=True)
    
    class Meta:
        model = Stocks
        fields = '__all__'


class StockMovementsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovements
        fields = '__all__'


class StockTransferItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransferItem
        fields = '__all__'


class StockTransferSerializer(serializers.ModelSerializer):
    items = StockTransferItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = StockTransfer
        fields = '__all__'



class StockMovementItemSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    movement_type = serializers.ChoiceField(choices=StockMovements.MovementType.choices)
    quantity = serializers.IntegerField()
    notes = serializers.CharField(allow_blank=True, required=False)

    def validate(self, data):
        if data['movement_type'] in ['sale', 'transfer_out', 'damage']:
            if data['quantity'] >= 0:
                raise serializers.ValidationError("Quantity must be negative for outgoing movements.")
        elif data['movement_type'] in ['purchase', 'transfer_in', 'adjustment']:
            if data['quantity'] <= 0:
                raise serializers.ValidationError("Quantity must be positive for incoming movements.")
        return data


class BulkStockMovementSerializer(serializers.Serializer):
    movements = StockMovementItemSerializer(many=True)
