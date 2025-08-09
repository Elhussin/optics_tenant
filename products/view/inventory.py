
from products.models import Stocks, StockMovements, StockTransfer, StockTransferItem
from products.serializers import StocksSerializer, StockMovementsSerializer, StockTransferSerializer, StockTransferItemSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class StocksViewSet(viewsets.ModelViewSet):
    queryset = Stocks.objects.all()
    serializer_class = StocksSerializer
    permission_classes = [IsAuthenticated]

class StockMovementsViewSet(viewsets.ModelViewSet):
    queryset = StockMovements.objects.all()
    serializer_class = StockMovementsSerializer
    permission_classes = [IsAuthenticated]

class StockTransferViewSet(viewsets.ModelViewSet):
    queryset = StockTransfer.objects.all()
    serializer_class = StockTransferSerializer
    permission_classes = [IsAuthenticated]
    
class StockTransferItemViewSet(viewsets.ModelViewSet):
    queryset = StockTransferItem.objects.all()
    serializer_class = StockTransferItemSerializer
    permission_classes = [IsAuthenticated]