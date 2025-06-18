from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .api.urls import urlpatterns 
# سجل admin الخاص بـ public فقط
import tenants.admin_public

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(urlpatterns)),  # الآن كل شيء تحت /api/
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path('api/tenants/', include('tenants.urls')),
]
