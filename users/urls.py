from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, login_view, refresh_token_view, logout_view, register_view, update_profile_view
router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),
    path('/refresh-token/', refresh_token_view, name='refresh-token'),
    path('logout/', logout_view, name='logout'),
    path('register/', register_view, name='register'),
    path('update-profile/', update_profile_view, name='update-profile'),
]
