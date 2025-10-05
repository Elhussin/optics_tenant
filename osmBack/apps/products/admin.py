from django.contrib import admin


from .models import( Attributes, AttributeValue,StockMovements,Stocks,StockTransfer, StockTransferItem,   ProductVariantMarketing,
 ProductVariantReview, ProductVariantQuestion, ProductVariantAnswer, ProductVariantOffer,
 Category, Product, ProductVariant ,ProductImage,Supplier, Manufacturer, Brand,
 FlexiblePrice
)

admin.site.site_header = "Optics Admin"
admin.site.site_title = "Optics Admin Portal"
admin.site.index_title = "Welcome to the Optics Admin Portal"

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category_id', 'brand_id', 'created_at')
    search_fields = ('name', 'category_id__name', 'brand_id__name')
    list_filter = ('category_id', 'brand_id')
    ordering = ('-created_at',)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    ordering = ('-created_at',)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    ordering = ('-created_at',)
class ProductVariantAdmin(admin.ModelAdmin):
    # list_display = ('product', 'variant_name','created_at')
    search_fields = ('product__name', 'variant_name')
    list_filter = ('product_id',)
    ordering = ('-created_at',)
    

admin.site.register(Product, ProductAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Brand, BrandAdmin)
admin.site.register(ProductVariant, ProductVariantAdmin)
# admin.site.register(LensCoating)
admin.site.register(StockMovements)
admin.site.register(Stocks)
admin.site.register(StockTransfer)
admin.site.register(StockTransferItem)
admin.site.register(ProductVariantMarketing)
admin.site.register(Attributes)
admin.site.register(AttributeValue)
admin.site.register(Supplier)
admin.site.register(Manufacturer)
admin.site.register(ProductImage)
admin.site.register(ProductVariantReview)
admin.site.register(ProductVariantQuestion)
admin.site.register(ProductVariantAnswer)
admin.site.register(ProductVariantOffer)
admin.site.register(FlexiblePrice)
