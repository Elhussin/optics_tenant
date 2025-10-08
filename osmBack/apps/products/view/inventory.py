
from apps.products.models import Stocks, StockMovements, StockTransfer, StockTransferItem
from apps.products.serializers import StocksSerializer, StockMovementsSerializer, StockTransferSerializer, StockTransferItemSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.views import BaseViewSet
class StocksViewSet(BaseViewSet):
    queryset = Stocks.objects.all()
    serializer_class = StocksSerializer
    permission_classes = [IsAuthenticated]

class StockMovementsViewSet(BaseViewSet):
    queryset = StockMovements.objects.all()
    serializer_class = StockMovementsSerializer
    permission_classes = [IsAuthenticated]

class StockTransferViewSet(BaseViewSet):
    queryset = StockTransfer.objects.all()
    serializer_class = StockTransferSerializer
    permission_classes = [IsAuthenticated]
    
class StockTransferItemViewSet(BaseViewSet):
    queryset = StockTransferItem.objects.all()
    serializer_class = StockTransferItemSerializer
    permission_classes = [IsAuthenticated]
