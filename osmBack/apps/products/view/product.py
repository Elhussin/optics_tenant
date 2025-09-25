from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from apps.products.models import (
    Category, LensCoating, Product, ProductVariant, 
    ProductImage, FlexiblePrice,ProductVariantOffer
)


from apps.products.serializers import (
    ProductVariantSerializer, ProductSerializer, CategorySerializer,
    LensCoatingSerializer, ProductImageSerializer, FlexiblePriceSerializer,ProductVariantOfferSerializer
)

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

class LensCoatingViewSet(viewsets.ModelViewSet):
    queryset = LensCoating.objects.all()
    serializer_class = LensCoatingSerializer
    permission_classes = [IsAuthenticated]


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated]

class FlexiblePriceViewSet(viewsets.ModelViewSet):
    queryset = FlexiblePrice.objects.all()
    serializer_class = FlexiblePriceSerializer
    permission_classes = [IsAuthenticated]

class ProductVariantOfferViewSet(viewsets.ModelViewSet):
    queryset = ProductVariantOffer.objects.all()
    serializer_class = ProductVariantOfferSerializer
    permission_classes = [IsAuthenticated]
