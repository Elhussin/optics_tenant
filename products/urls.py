# urls.py
from django.urls import path
from .views import InventoryMovementAPIView

urlpatterns = [
# urls.py
path('api/inventory/<int:branch_id>/bulk-move/', BulkInventoryMovementAPIView.as_view(), name='bulk-inventory-move'),
]



# urlpatterns = [
#     path('variant/<int:variant_id>/stock-summary/', views.VariantStockSummaryAPIView.as_view(), name='variant-stock-summary'),
#     path('variant/<int:variant_id>/nearest-branch/', views.NearestBranchAPIView.as_view(), name='nearest-branch'),
#     path('orders/can-fulfill/', views.OrderFulfillmentCheckAPIView.as_view(), name='can-fulfill-order'),
# ]