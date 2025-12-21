from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from rest_framework.request import Request
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

# class LensCoatingViewSet(BaseViewSet):
#     queryset = LensCoating.objects.all()
#     serializer_class = LensCoatingSerializer
#     permission_classes = [IsAuthenticated]


class ProductVariantViewSet(ProductBaseViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer

# class ProductVariantViewSet(viewsets.ModelViewSet):
#     queryset = ProductVariant.objects.all()

#     def get_serializer_class(self):
#         variant = self.get_object() if self.action in ['retrieve', 'update', 'partial_update'] else None
#         if variant:
#             return get_variant_serializer_class(variant.product_id.type)

#         # في حالة create، نقرأ نوع المنتج من البيانات القادمة
#         product_type = self.request.data.get('product_type')
#         return get_variant_serializer_class(product_type)


class ProductViewSet(ProductBaseViewSet):

    queryset = (
        Product.objects.all()
        .select_related(
            'manufacturer_id',
            'category_id',
            'supplier_id',
            'brand_id'
        )  # للعلاقات ForeignKey
        .prefetch_related('variants')  # للعلاقات العكسية (OneToMany)
    )
    serializer_class = ProductSerializer


class ProductImageViewSet(ProductBaseViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer


class FlexiblePriceViewSet(ProductBaseViewSet):
    queryset = FlexiblePrice.objects.all()
    serializer_class = FlexiblePriceSerializer


class ProductVariantOfferViewSet(ProductBaseViewSet):
    queryset = ProductVariantOffer.objects.all()
    serializer_class = ProductVariantOfferSerializer
