
from apps.products.models import Stock, StockMovement, StockTransfer, StockTransferItem
from apps.products.serializers import StockSerializer, StockMovementSerializer, StockTransferSerializer, StockTransferItemSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

INVENTORY_MANAGERS = ["manager", "store_keeper"]
SUPER_ROLES = ["admin", "owner"]


class InventoryBaseViewSet(BaseViewSet):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=INVENTORY_MANAGERS,
            super_roles=SUPER_ROLES
        )
    ]


class StocksViewSet(InventoryBaseViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer


class StockMovementsViewSet(InventoryBaseViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer


class StockTransferViewSet(InventoryBaseViewSet):
    queryset = StockTransfer.objects.all()
    serializer_class = StockTransferSerializer


class StockTransferItemViewSet(InventoryBaseViewSet):
    queryset = StockTransferItem.objects.all()
    serializer_class = StockTransferItemSerializer
