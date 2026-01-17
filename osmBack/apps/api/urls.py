# apps/api/urls.py
"""
Mobile API URLs
"""

from django.urls import path
from apps.api.views_mobile import (
    mobile_dashboard,
    mobile_product_search,
    mobile_customer_lookup,
    mobile_quick_sale,
    mobile_sync_data,
    mobile_order_detail,
)

urlpatterns = [
    # Dashboard
    path('mobile/dashboard/', mobile_dashboard, name='mobile-dashboard'),

    # Search
    path('mobile/products/search/', mobile_product_search,
         name='mobile-product-search'),
    path('mobile/customers/search/', mobile_customer_lookup,
         name='mobile-customer-lookup'),

    # Sales
    path('mobile/quick-sale/', mobile_quick_sale, name='mobile-quick-sale'),
    path('mobile/orders/<int:order_id>/',
         mobile_order_detail, name='mobile-order-detail'),

    # Sync
    path('mobile/sync/', mobile_sync_data, name='mobile-sync'),
]
