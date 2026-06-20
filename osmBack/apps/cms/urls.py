from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PageViewSet, PublicPageViewSet, ContactUsViewSet

router = DefaultRouter()
router.register(r'pages', PageViewSet, basename='pages')  
router.register(r'public/pages', PublicPageViewSet, basename='public-pages')                                                                                                                                                                                                                  
router.register(r'contact-us', ContactUsViewSet, basename='contact-us')

urlpatterns = [
    path("", include(router.urls)),
]
