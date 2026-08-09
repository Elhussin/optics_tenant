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

PRODUCT_MANAGERS = ["InventoryManager", "BranchManager", "SalesClerk"]


class ProductBaseViewSet(BaseViewSet):
    """
    Base ViewSet for Product Management, enforcing Role access.
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=PRODUCT_MANAGERS,
            required_permissions=["view_product"]
        )
    ]


class CategoryViewSet(ProductBaseViewSet):
    """
    ViewSet for managing Product Categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    search_fields = ["name", "parent__name", "description"]


class ProductVariantViewSet(ProductBaseViewSet):
    """
    ViewSet for managing Product Variants.
    Custom logic for creation to support nested pricing/attributes.
    """
    queryset = ProductVariant.objects.select_related(
        'product', 'product__brand').all()
    serializer_class = ProductVariantSerializer

    # Actual search fields - use product__name for relationships
    search_fields = [
        "sku",
        "product__name",
        "product__model",
        "product__brand__name",
    ]

    def get_serializer_class(self):
        """Use CreateProductVariantSerializer for creation"""
        if self.action == 'create':
            from apps.products.serializers import CreateProductVariantSerializer
            return CreateProductVariantSerializer
        return self.serializer_class


class ProductViewSet(ProductBaseViewSet):
    """
    ViewSet for managing main Products.
    """
    queryset = (
        Product.objects.all()
        .prefetch_related(
            'variants',
            'categories'
        )
    ).select_related('brand')

    serializer_class = ProductSerializer
    search_fields = ["name", "description",
                     "model", "brand__name", "categories__name"]


class ProductImageViewSet(ProductBaseViewSet):
    """
    ViewSet for managing Product Images.
    """
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer


class FlexiblePriceViewSet(ProductBaseViewSet):
    """
    ViewSet for managing Flexible Pricing rules.
    """
    queryset = FlexiblePrice.objects.all()
    serializer_class = FlexiblePriceSerializer


class ProductVariantOfferViewSet(ProductBaseViewSet):
    """
    ViewSet for managing Product Offers.
    """
    queryset = ProductVariantOffer.objects.all()
    serializer_class = ProductVariantOfferSerializer


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.products.serializers.product import LensMatrixGenerateSerializer
from apps.products.services.lens_matrix_service import generate_lens_matrix


class LensMatrixGenerateAPIView(APIView):
    """
    API View for bulk generating SPH x CYL lens variants with duplicate prevention.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = LensMatrixGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = generate_lens_matrix(**serializer.validated_data)
        return Response(result, status=status.HTTP_201_CREATED)

