from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Order, OrderItem,Invoice,InvoiceItem,Payment
# Register your models here.

admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Invoice)
admin.site.register(InvoiceItem)
admin.site.register(Payment)

