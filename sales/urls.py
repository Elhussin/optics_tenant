# urls.py - routing OrderViewSet

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from sales.views import OrderViewSet,InvoiceViewSet,PaymentViewSet,order_choices,invoice_choices

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
# router.register(r'choices_order', order_choices, basename='order_choices')
# router.register(r'choices_invoice', invoice_choices, basename='invoice_choices')

# from sales.views.choices import order_choices, invoice_choices

urlpatterns = [

]


urlpatterns = [
    path('api/', include(router.urls)),
    path('api/orders/choices/', order_choices, name='order-choices'),
    path('api/invoices/choices/', invoice_choices, name='invoice-choices'),
]

 