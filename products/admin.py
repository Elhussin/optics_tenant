from django.contrib import admin
from .models import Product, Category, Brand ,ProductVariant 
# Register your models here.


# class ProductAdmin(admin.ModelAdmin):
#     list_display = ('name', 'category', 'brand', 'price', 'created_at')
#     search_fields = ('name', 'category__name', 'brand__name')
#     list_filter = ('category', 'brand')
#     ordering = ('-created_at',)
# class CategoryAdmin(admin.ModelAdmin):
#     list_display = ('name', 'created_at')
#     search_fields = ('name',)
#     ordering = ('-created_at',)
# class BrandAdmin(admin.ModelAdmin):
#     list_display = ('name', 'created_at')
#     search_fields = ('name',)
#     ordering = ('-created_at',)
# class ProductVariantAdmin(admin.ModelAdmin):
#     list_display = ('product', 'variant_name', 'price', 'created_at')
#     search_fields = ('product__name', 'variant_name')
#     list_filter = ('product',)
#     ordering = ('-created_at',)
# admin.site.register(Product, ProductAdmin)
# admin.site.register(Category, CategoryAdmin)
# admin.site.register(Brand, BrandAdmin)
# admin.site.register(ProductVariant, ProductVariantAdmin)
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
    # search_fields = ('product__name', 'variant_name')
    # list_filter = ('product',)
    # ordering = ('-created_at',)
    pass
admin.site.register(Product, ProductAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Brand, BrandAdmin)
admin.site.register(ProductVariant, ProductVariantAdmin)