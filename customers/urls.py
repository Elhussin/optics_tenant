# api/urls.py
from django.urls import path
from .views import RegisterTenantView, ActivateTenantView

urlpatterns = [
    path('register/', RegisterTenantView.as_view()),
    path('activate/', ActivateTenantView.as_view()),
]
