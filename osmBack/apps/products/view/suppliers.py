from rest_framework import serializers
from apps.products.models import Supplier, Manufacturer, Brand
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.products.serializers.suppliers import (
    SupplierSerializer, ManufacturerSerializer, BrandSerializer
)
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

SUPPLY_MANAGERS = ["manager", "store_keeper"]
SUPER_ROLES = ["admin", "owner"]


class SupplierBaseViewSet(BaseViewSet):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=SUPPLY_MANAGERS,
            super_roles=SUPER_ROLES
        )
    ]


class SupplierViewSet(SupplierBaseViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class ManufacturerViewSet(SupplierBaseViewSet):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer


class BrandViewSet(SupplierBaseViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
