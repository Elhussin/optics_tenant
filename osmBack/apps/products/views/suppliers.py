from rest_framework.permissions import IsAuthenticated
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

from apps.products.models import Supplier, Manufacturer, Brand
from apps.products.serializers.suppliers import (
    SupplierSerializer, ManufacturerSerializer, BrandSerializer
)

SUPPLY_MANAGERS = ["InventoryManager", "BranchManager"]


class SupplierBaseViewSet(BaseViewSet):
    """
    Base ViewSet for Supplier Management.
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=SUPPLY_MANAGERS,
            required_permissions=["view_inventory"]
        )
    ]


class SupplierViewSet(SupplierBaseViewSet):
    """
    ViewSet for managing Suppliers.
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class ManufacturerViewSet(SupplierBaseViewSet):
    """
    ViewSet for managing Manufacturers.
    """
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer


class BrandViewSet(SupplierBaseViewSet):
    """
    ViewSet for managing Brands.
    """
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
