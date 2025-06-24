
from django.urls import path
from .views import LoginView, RegisterView, LogoutView, RefreshTokenView,ProfileView,UserViewSet
from rest_framework.routers import DefaultRouter
from django.urls import include

router = DefaultRouter()
router.register(r'users', UserViewSet)
urlpatterns = [
    path("", include(router.urls)),
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("token/refresh/", RefreshTokenView.as_view()),
    path("profile/", ProfileView.as_view()),
]


# curl -X POST http://localhost:8000/api/users/login/ \
#   -H "Content-Type: application/json" \
#   -d '{"username": "admin", "password": "12345"}' \
#   -i
