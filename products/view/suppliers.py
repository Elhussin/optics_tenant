from rest_framework import serializers
from products.models import Supplier, Manufacturer, Brand
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from products.serializers.suppliers import (
    SupplierSerializer, ManufacturerSerializer, BrandSerializer
)

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

class ManufacturerViewSet(viewsets.ModelViewSet):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
    permission_classes = [IsAuthenticated]

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticated]

