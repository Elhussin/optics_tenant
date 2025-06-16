from rest_framework import serializers
from products.models import Stocks, StockMovements, StockTransfer, StockTransferItem

class StocksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stocks
        fields = '__all__'

class StockMovementsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovements
        fields = '__all__'

class StockTransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransfer
        fields = '__all__'

class StockTransferItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransferItem
        fields = '__all__'
