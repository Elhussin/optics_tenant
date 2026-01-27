# apps/api/urls.py
"""
Mobile API URLs
"""

from django.urls import path
from apps.api.views_mobile import (
    MobileDashboardView,
    MobileProductSearchView,
    MobileCustomerLookupView,
    MobileQuickSaleView,
    MobileSyncDataView,
    MobileOrderDetailView,
)

urlpatterns = [
    # Dashboard
    path('mobile/dashboard/', MobileDashboardView.as_view(),
         name='mobile-dashboard'),

    # Search
    path('mobile/products/search/', MobileProductSearchView.as_view(),
         name='mobile-product-search'),
    path('mobile/customers/search/', MobileCustomerLookupView.as_view(),
         name='mobile-customer-lookup'),

    # Sales
    path('mobile/quick-sale/', MobileQuickSaleView.as_view(),
         name='mobile-quick-sale'),
    path('mobile/orders/<int:order_id>/',
         MobileOrderDetailView.as_view(), name='mobile-order-detail'),

    # Sync
    path('mobile/sync/', MobileSyncDataView.as_view(), name='mobile-sync'),
]
