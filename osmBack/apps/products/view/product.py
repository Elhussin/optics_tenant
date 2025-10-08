from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from apps.products.models import (
    Category, Product, ProductVariant, 
    ProductImage, FlexiblePrice,ProductVariantOffer
)


from apps.products.serializers import (
    ProductVariantSerializer, ProductSerializer, CategorySerializer,
 ProductImageSerializer, FlexiblePriceSerializer,ProductVariantOfferSerializer
)

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.views import BaseViewSet
class CategoryViewSet(BaseViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

# class LensCoatingViewSet(BaseViewSet):
#     queryset = LensCoating.objects.all()
#     serializer_class = LensCoatingSerializer
#     permission_classes = [IsAuthenticated]


class ProductVariantViewSet(BaseViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(BaseViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class ProductImageViewSet(BaseViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated]

class FlexiblePriceViewSet(BaseViewSet):
    queryset = FlexiblePrice.objects.all()
    serializer_class = FlexiblePriceSerializer
    permission_classes = [IsAuthenticated]

class ProductVariantOfferViewSet(BaseViewSet):
    queryset = ProductVariantOffer.objects.all()
    serializer_class = ProductVariantOfferSerializer
    permission_classes = [IsAuthenticated]
