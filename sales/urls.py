# urls.py - routing OrderViewSet

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from sales.views import OrderViewSet,InvoiceViewSet,PaymentViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('api/', include(router.urls)),
]

 