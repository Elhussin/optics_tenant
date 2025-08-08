
from django.urls import path
from .views import( LoginView, RegisterView, LogoutView, RefreshTokenView,
ProfileView,UserViewSet,RequestPasswordResetView,PasswordResetConfirmView,PageViewSet,
PageContentViewSet, ContactViewSet,
PermissionViewSet, RolePermissionViewSet, RoleViewSet)
from rest_framework.routers import DefaultRouter
from django.urls import include

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'permissions', PermissionViewSet)
router.register(r'role-permissions', RolePermissionViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'pages', PageViewSet, basename='pages')
router.register(r'page-contents', PageContentViewSet)
router.register(r'contact-us', ContactViewSet, basename='contact-us')
urlpatterns = [
    path("", include(router.urls)),
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("token/refresh/", RefreshTokenView.as_view()),
    path("profile/", ProfileView.as_view()),
    path('password-reset/', RequestPasswordResetView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    # path('pages/<slug:slug>/<str:lang>/', PageViewSet.as_view({'get': 'retrieve_by_slug_lang'}), name='page-detail-by-lang'),

]


# curl -X POST http://localhost:8000/api/users/login/ \
#   -H "Content-Type: application/json" \
#   -d '{"username": "admin", "password": "12345"}' \
#   -i
# urls.py
