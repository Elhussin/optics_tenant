# from django.contrib import admin
# from django.urls import path, include
# from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
# from .api.urls import urlpatterns 
# # سجل admin الخاص بـ public فقط
# import tenants.admin_public
# from wagtail.api.v2.views import PagesAPIViewSet
# from wagtail.api.v2.router import WagtailAPIRouter

# api_router = WagtailAPIRouter('wagtailapi')
# api_router.register_endpoint('pages', PagesAPIViewSet)


# urlpatterns = [
#     path('admins', admin.site.urls),   
#     path('api/tenants/', include('tenants.urls')),
#     path('api/users/', include('users.urls')),
#     path('', include('wagtail.urls')),  # عرض صفحات Wagtail في الجذر '/
#     path('admin/', include('wagtail.admin.urls')),  # لوحة تحكم Wagtail
#     path('cms-api/', api_router.urls),  # API الخاص بـ Wagtail
# ]
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .api.urls import urlpatterns 
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.api.v2.router import WagtailAPIRouter

api_router = WagtailAPIRouter('wagtailapi')
api_router.register_endpoint('pages', PagesAPIViewSet)

urlpatterns = [
    path('django-admin/', admin.site.urls),  # لوحة تحكم Django الافتراضية
    path('admin/', include('wagtail.admin.urls')),  # لوحة تحكم Wagtail
    path('api/', include(urlpatterns)),  # REST API الخاص بك
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path('cms-api/', api_router.urls),  # API الخاص بـ Wagtail
    path('', include('wagtail.urls')),  # عرض صفحات Wagtail في الجذر '/'
]
