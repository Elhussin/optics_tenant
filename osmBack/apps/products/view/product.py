from apps.products.models import (
    Category, Product, ProductVariant,
    ProductImage, FlexiblePrice, ProductVariantOffer
)


from apps.products.serializers import (
    ProductVariantSerializer, ProductSerializer, CategorySerializer,
    ProductImageSerializer, FlexiblePriceSerializer, ProductVariantOfferSerializer
)

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

PRODUCT_MANAGERS = ["manager", "store_keeper"]
SUPER_ROLES = ["admin", "owner"]


class ProductBaseViewSet(BaseViewSet):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=PRODUCT_MANAGERS,
            super_roles=SUPER_ROLES
        )
    ]


class CategoryViewSet(ProductBaseViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    search_fields = ["name", "parent__name", "description"]


class ProductVariantViewSet(ProductBaseViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer


class ProductViewSet(ProductBaseViewSet):
    queryset = (
        Product.objects.all()
        # .select_related('brand')  # Removed incorrect comments, kept valid logic
        .prefetch_related(
            'variants',
            'categories'
        ) 
    ).select_related('brand') # Chained correctly
    
    serializer_class = ProductSerializer
    search_fields = ["name", "description", "model", "brand__name", "categories__name"]


class ProductImageViewSet(ProductBaseViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer


class FlexiblePriceViewSet(ProductBaseViewSet):
    queryset = FlexiblePrice.objects.all()
    serializer_class = FlexiblePriceSerializer


class ProductVariantOfferViewSet(ProductBaseViewSet):
    queryset = ProductVariantOffer.objects.all()
    serializer_class = ProductVariantOfferSerializer
