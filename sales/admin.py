from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Order, OrderItem,Invoice,InvoiceItem,Payment
# Register your models here.


# class OrderAdmin(admin.ModelAdmin):
#     list_display = ('order_number', 'customer', 'created_at', 'status')
#     search_fields = ('order_number', 'customer__full_name')
#     list_filter = ('status', 'created_at')


# class OrderItemAdmin(admin.ModelAdmin):
#     list_display = ('order', 'product', 'quantity', 'price')
#     search_fields = ('order__order_number', 'product__name')
#     list_filter = ('order__status', 'created_at')


# class InvoiceAdmin(admin.ModelAdmin):
#     list_display = ('invoice_number', 'customer', 'created_at', 'status')
#     search_fields = ('invoice_number', 'customer__full_name')
#     list_filter = ('status', 'created_at')


# class InvoiceItemAdmin(admin.ModelAdmin):
#     list_display = ('invoice', 'product', 'quantity', 'price')
#     search_fields = ('invoice__invoice_number', 'product__name')
#     list_filter = ('invoice__status', 'created_at')


# class PaymentAdmin(admin.ModelAdmin):
#     list_display = ('payment_number', 'order', 'amount', 'payment_type', 'created_at')
#     search_fields = ('payment_number', 'order__order_number')
#     list_filter = ('payment_type', 'created_at')
#     @admin.display(description='Total Amount')
#     def total_amount(self, obj):
#         return obj.amount
    
#     @admin.display(description='Payment Type')
#     def payment_method(self, obj):
#         return obj.payment_type
    

# admin.site.register(Order,OrderAdmin)
# admin.site.register(OrderItem,OrderItemAdmin)
# admin.site.register(Invoice,InvoiceAdmin)
# admin.site.register(InvoiceItem,InvoiceItemAdmin)
# admin.site.register(Payment,PaymentAdmin)

