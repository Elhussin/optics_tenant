from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryListCreateView, CategoryRetrieveUpdateDestroyView,
    ProductListCreateView, ProductRetrieveUpdateDestroyView,
    ProductVariantListCreateView, ProductVariantRetrieveUpdateDestroyView,
    FlexiblePriceListCreateView, FlexiblePriceRetrieveUpdateDestroyView,
    ProductImageListCreateView, ProductImageRetrieveUpdateDestroyView,
    ProductSearchView, ProductPriceCalculatorView
)

router = DefaultRouter()
# Registering viewsets with the router


urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryRetrieveUpdateDestroyView.as_view(), name='category-detail'),
    
    path('products/', ProductListCreateView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductRetrieveUpdateDestroyView.as_view(), name='product-detail'),
    
    path('products/<int:product_id>/variants/', ProductVariantListCreateView.as_view(), name='variant-list'),
    path('variants/<int:pk>/', ProductVariantRetrieveUpdateDestroyView.as_view(), name='variant-detail'),
    
    path('variants/<int:variant_id>/prices/', FlexiblePriceListCreateView.as_view(), name='price-list'),
    path('prices/<int:pk>/', FlexiblePriceRetrieveUpdateDestroyView.as_view(), name='price-detail'),
    
    path('variants/<int:variant_id>/images/', ProductImageListCreateView.as_view(), name='image-list'),
    path('images/<int:pk>/', ProductImageRetrieveUpdateDestroyView.as_view(), name='image-detail'),
    
    path('search/', ProductSearchView.as_view(), name='product-search'),
    path('variants/<int:variant_id>/calculate-price/', ProductPriceCalculatorView.as_view(), name='price-calculator'),
    
    path('', include(router.urls)),
]