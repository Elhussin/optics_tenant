# api/urls.py
from django.urls import path
from .views import RegisterTenantView, ActivateTenantView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterTenantView.as_view()),
    path('activate/', ActivateTenantView.as_view()),
    # JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]