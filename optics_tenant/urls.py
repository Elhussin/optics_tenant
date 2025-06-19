from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .api.urls import urlpatterns 
from django.contrib import admin
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(urlpatterns)),  # الآن كل شيء تحت /api/
]
