

from rest_framework.routers import DefaultRouter
from django.urls import path, include

from .views import *
router = DefaultRouter()
router.register(r'variants', ProductVariantViewSet, basename='product-variant')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'manufacturers', ManufacturerViewSet, basename='manufacturer')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'attributes', AttributesViewSet, basename='attributes')
router.register(r'attribute-values', AttributeValueViewSet,
                basename='attribute-value')
router.register(r'marketing', ProductVariantMarketingViewSet,
                basename='product-variant-marketing')
router.register(r'reviews', ProductVariantReviewViewSet,
                basename='product-variant-review')
router.register(r'questions', ProductVariantQuestionViewSet,
                basename='product-variant-question')
router.register(r'answers', ProductVariantAnswerViewSet,
                basename='product-variant-answer')
router.register(r'offers', ProductVariantOfferViewSet,
                basename='product-variant-offer')
router.register(r'categories', CategoryViewSet, basename='category')
# router.register(r'lens-coatings', LensCoatingViewSet, basename='lens-coating')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'product-images', ProductImageViewSet,
                basename='product-image')
router.register(r'flexible-prices', FlexiblePriceViewSet,
                basename='flexible-price')
router.register(r'stocks', StocksViewSet, basename='stocks')
router.register(r'stock-movements', StockMovementsViewSet,
                basename='stock-movements')
router.register(r'stock-transfers', StockTransferViewSet,
                basename='stock-transfer')
router.register(r'stock-transfer-items', StockTransferItemViewSet,
                basename='stock-transfer-item')
router.register(r'purchase-orders', PurchaseOrderViewSet,
                basename='purchase-order')


urlpatterns = [
    # Import
    path('products/import-csv/', ProductImportView.as_view(),
         name='product-import-csv'),

    # Helper Views
    path('variants/<int:variant_id>/stock-summary/',
         VariantStockSummaryAPIView.as_view(), name='variant-stock-summary'),
    path('variants/<int:variant_id>/nearest-branch/',
         NearestBranchAPIView.as_view(), name='nearest-branch'),
    path('orders/fulfillment-check/',
         OrderFulfillmentCheckAPIView.as_view(), name='order-fulfillment-check'),

    # Manager Views
    path('branches/active/', ActiveBranchesView.as_view(), name='active-branches'),
    path('branches/main/', MainBranchView.as_view(), name='main-branch'),
    path('branches/<int:branch_id>/low-stock/',
         LowStockByBranchView.as_view(), name='branch-low-stock'),
    path('variants/<int:variant_id>/total-stock/',
         VariantTotalStockView.as_view(), name='variant-total-stock'),

    path('', include(router.urls)),
]
