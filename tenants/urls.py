# api/urls.py
from struct import pack
from django.urls import path
from .views import RegisterTenantView, ActivateTenantView, CreatePayPalOrderView, PayPalExecuteView, PayPalCancelView

urlpatterns = [
    path('register/', RegisterTenantView.as_view()),
    path('activate/', ActivateTenantView.as_view()),
    path('create-paypal-order/', CreatePayPalOrderView.as_view()),
    path('execute-paypal-order/', PayPalExecuteView.as_view(), name="execute-paypal-order"),
    path("paypal/cancel/", PayPalCancelView.as_view(), name="paypal-cancel"),
]