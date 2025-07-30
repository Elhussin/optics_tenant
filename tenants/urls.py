# api/urls.py
from struct import pack
from django.urls import path
from .views import RegisterTenantView, ActivateTenantView, CreatePayPalOrderView, PayPalExecuteView, PayPalCancelView ,ClientViewSet,DomainView,SubscriptionPlanView
from rest_framework.routers import DefaultRouter
from django.urls import include

router = DefaultRouter()
router.register(r'clients', ClientViewSet,basename='clients')

urlpatterns = [
    path("", include(router.urls)),
    path('register/', RegisterTenantView.as_view()),
    path('activate/', ActivateTenantView.as_view()),
    path('create-paypal-order/', CreatePayPalOrderView.as_view()),
    path('execute-paypal-order/', PayPalExecuteView.as_view(), name="execute-paypal-order"),
    path("paypal/cancel/", PayPalCancelView.as_view(), name="paypal-cancel"),

    path("domain/", DomainView.as_view(), name="domain"),
    path("subscription-plan/", SubscriptionPlanView.as_view(), name="subscription-plan"),
]