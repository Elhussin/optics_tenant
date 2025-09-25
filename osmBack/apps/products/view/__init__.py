from .attributes import AttributesViewSet, AttributeValueViewSet
from .marketing import ProductVariantMarketingViewSet
from .product_support import ProductVariantReviewViewSet, ProductVariantQuestionViewSet, ProductVariantAnswerViewSet, ProductVariantOfferViewSet
from .product import CategoryViewSet, LensCoatingViewSet, ProductViewSet, ProductVariantViewSet, ProductImageViewSet,FlexiblePriceViewSet
from .suppliers import SupplierViewSet, ManufacturerViewSet, BrandViewSet

from .inventory import StocksViewSet, StockMovementsViewSet, StockTransferViewSet, StockTransferItemViewSet


__all__ = [
    "ProductViewSet", "ProductVariantViewSet", "CategoryViewSet",
    "LensCoatingViewSet",
    "StockMovementsViewSet", "StocksViewSet", "StockTransferViewSet", "StockTransferItemViewSet",
    "ProductVariantMarketingViewSet",
    "AttributesViewSet", "AttributeValueViewSet",
    "ProductVariantReviewViewSet", "ProductVariantQuestionViewSet", "ProductVariantAnswerViewSet", "ProductVariantOfferViewSet",
    "SupplierViewSet", "ManufacturerViewSet", "BrandViewSet",
    "InventoryDocumentViewSet", "InventoryLineItemViewSet",
    "ProductImageViewSet",
    "FlexiblePriceViewSet",
]
