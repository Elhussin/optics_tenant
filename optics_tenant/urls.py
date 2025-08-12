from django.contrib import admin
from django.urls import path, include, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .api.urls import urlpatterns 
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.api.v2.router import WagtailAPIRouter
from cms import api

# ]
api_router = WagtailAPIRouter('wagtailapi')
api_router.register_endpoint('pages', PagesAPIViewSet)

urlpatterns = [
    # Django admin

    path('admin/', admin.site.urls),

    # # Wagtail admin
    # path('cms-admin/', include('wagtail.admin.urls')),

    # API Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),

    path('api/', include(urlpatterns)),  # REST API الخاص بك
    path('', include('cms.urls')),  # Include CMS URLs
    # path('cms/', include('cms.urls')),  # Include CMS URLs
    # # API لـ Wagtail CMS
    # path('cms-api/', api_router.urls),

    # # api/pages detail endpoint
    # path("api/pages/<slug:slug>/", api.page_detail, name="page_detail"),

    # # Wagtail URLs (أي صفحة ديناميكية من الـ CMS)
    # re_path(r'', include('wagtail.urls')),  # يجب أن تكون في الأخير
]



# urlpatterns = [
#     path('django-admin/', admin.site.urls),  # لوحة تحكم Django الافتراضية

#     path('api/', include(urlpatterns)),  # REST API الخاص بك
#     path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
#     path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
