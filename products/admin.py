from django.contrib import admin


from .models import( Attributes, AttributeValue,Stock, StockMovement, InventoryDocument, InventoryLineItem,   ProductVariantMarketing,
 ProductVariantReview, ProductVariantQuestion, ProductVariantAnswer, ProductVariantOffer,
 Category, LensCoating, Product, ProductVariant ,ProductImage,Supplier, Manufacturer, Brand
)

admin.site.site_header = "Optics Admin"
admin.site.site_title = "Optics Admin Portal"
admin.site.index_title = "Welcome to the Optics Admin Portal"

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'brand', 'created_at')
    search_fields = ('name', 'category__name', 'brand__name')
    list_filter = ('category', 'brand')
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
    list_filter = ('product',)
    ordering = ('-created_at',)
    pass

admin.site.register(Product, ProductAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Brand, BrandAdmin)
admin.site.register(ProductVariant, ProductVariantAdmin)
admin.site.register(LensCoating)
admin.site.register(Stock)
admin.site.register(StockMovement)
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
admin.site.register(InventoryDocument)
admin.site.register(InventoryLineItem)