from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


urlpatterns = [
    path('django-admin/', admin.site.urls),  # لوحة تحكم Django الافتراضية
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    
    # مسارات النطاق العام (Public Schema) للتسجيل والاشتراكات
    path('api/tenants/', include('apps.tenants.urls')),
    path('api/users/login/', include('apps.users.urls')), # فقط للسماح بتسجيل الدخول إذا لزم الأمر في الـ Public
]
