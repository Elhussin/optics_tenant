from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet,RegisterView,UpdateProfileView,LogoutView,RefreshTokenView,LoginView
router = DefaultRouter()
router.register(r'users', UserViewSet)
# router.register(r'register', RegisterView, basename='register-user')
# router.register(r'update-profile', UpdateProfileView, basename='update-profile')
router.register(r'logout', LogoutView, basename='logout')
router.register(r'refresh-token', RefreshTokenView, basename='refresh-token')
router.register(r'login', LoginView, basename='login')




urlpatterns = [
    path('', include(router.urls)),
]


# path('login/', login_view, name='login'),
# path('/refresh-token/', refresh_token_view, name='refresh-token'),
# path('logout/', logout_view, name='logout'),
# path('register/', register_view, name='register'),
# path('update-profile/', update_profile_view, name='update-profile'),