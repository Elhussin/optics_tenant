from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Category, Product, ProductVariant,FlexiblePrice,ProductImage

from products.serializers.inventory import StocksSerializer, StockMovementsSerializer, StockTransferSerializer, StockTransferItemSerializer
from products.serializers.product import CategorySerializer, ProductSerializer, ProductVariantSerializer, FlexiblePriceSerializer, ProductImageSerializer

from rest_framework import filters, status

from rest_framework.parsers import MultiPartParser, FormParser
# Search and Price Calculation Views
from CRM.models import Customer
from branches.models import Branch
from rest_framework.views import APIView
import six
from django.db.models import Q
from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'pk'


class ProductFilter(filters.FilterSet):
    class Meta:
        model = Product
        fields = {
            'category': ['exact'],
            'brand': ['exact'],
            'type': ['exact'],
            'is_active': ['exact'],
        }

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related(
        'category', 'supplier', 'manufacturer', 'brand'
    ).prefetch_related('variants')
    serializer_class = ProductSerializer
    # filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'model', 'brand__name']
    ordering_fields = ['name', 'created_at', 'selling_price']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ProductRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related(
        'category', 'supplier', 'manufacturer', 'brand'
    ).prefetch_related('variants', 'variants__images')
    serializer_class = ProductSerializer
    lookup_field = 'pk'



class ProductVariantListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductVariantSerializer
    
    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return ProductVariant.objects.filter(product_id=product_id).select_related(
            'product', 'frame_color', 'lens_color', 'lens_type'
        ).prefetch_related('lens_coatings', 'images')

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        serializer.save(product_id=product_id, created_by=self.request.user)

class ProductVariantRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductVariant.objects.select_related(
        'product', 'frame_color', 'lens_color', 'lens_type'
    ).prefetch_related('lens_coatings', 'images')
    serializer_class = ProductVariantSerializer
    lookup_field = 'pk'



class FlexiblePriceListCreateView(generics.ListCreateAPIView):
    serializer_class = FlexiblePriceSerializer
    
    def get_queryset(self):
        variant_id = self.kwargs.get('variant_id')
        return FlexiblePrice.objects.filter(variant_id=variant_id).select_related(
            'variant', 'customer', 'customer_group', 'branch'
        )

    def perform_create(self, serializer):
        variant_id = self.kwargs.get('variant_id')
        serializer.save(variant_id=variant_id, created_by=self.request.user)

class FlexiblePriceRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FlexiblePrice.objects.select_related(
        'variant', 'customer', 'customer_group', 'branch'
    )
    serializer_class = FlexiblePriceSerializer
    lookup_field = 'pk'



class ProductImageListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductImageSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        variant_id = self.kwargs.get('variant_id')
        return ProductImage.objects.filter(variant_id=variant_id)

    def perform_create(self, serializer):
        variant_id = self.kwargs.get('variant_id')
        serializer.save(variant_id=variant_id)

class ProductImageRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'pk'




class ProductSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '')
        category = request.query_params.get('category', None)
        
        queryset = ProductVariant.objects.select_related(
            'product', 'product__brand', 'frame_color', 'lens_color'
        ).prefetch_related('images')
        
        if query:
            queryset = queryset.filter(
                Q(product__name__icontains=query) |
                Q(product__model__icontains=query) |
                Q(product__brand__name__icontains=query) |
                Q(sku__icontains=query)
            )
        
        if category:
            queryset = queryset.filter(product__category_id=category)
        
        serializer = ProductVariantListSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ProductPriceCalculatorView(APIView):
    def post(self, request, variant_id):
        variant = generics.get_object_or_404(ProductVariant, pk=variant_id)
        customer_id = request.data.get('customer_id')
        branch_id = request.data.get('branch_id')
        quantity = request.data.get('quantity', 1)
        
        price = variant.get_price_for(
            customer=Customer.objects.get(pk=customer_id) if customer_id else None,
            branch=Branch.objects.get(pk=branch_id) if branch_id else None,
            quantity=quantity
        )
        
        return Response({
            'variant_id': variant_id,
            'original_price': variant.selling_price,
            'final_price': price,
            'currency': 'SAR'
        }, status=status.HTTP_200_OK)
    