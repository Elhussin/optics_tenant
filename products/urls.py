from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

urlpatterns = [

path('api/inventory/<int:branch_id>/bulk-move/', BulkInventoryMovementAPIView.as_view(), name='bulk-inventory-move'),
]



router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'variants', ProductVariantViewSet)
router.register(r'stocks', StocksViewSet)
router.register(r'movements', StockMovementsViewSet)
router.register(r'transfers', StockTransferViewSet)
router.register(r'transfer-items', StockTransferItemViewSet)


urlpatterns = [
    path('api/', include(router.urls)),
]

# urlpatterns = [
#     path('variant/<int:variant_id>/stock-summary/', views.VariantStockSummaryAPIView.as_view(), name='variant-stock-summary'),
#     path('variant/<int:variant_id>/nearest-branch/', views.NearestBranchAPIView.as_view(), name='nearest-branch'),
#     path('orders/can-fulfill/', views.OrderFulfillmentCheckAPIView.as_view(), name='can-fulfill-order'),
# ]