from django.urls import path,re_path, include
from . import api

from wagtail.api.v2.router import WagtailAPIRouter
from cms.api import PublicPagesAPIViewSet

api_router = WagtailAPIRouter('wagtailapi')
api_router.register_endpoint('pages', PublicPagesAPIViewSet)


    # Wagtail URLs (أي صفحة ديناميكية من الـ CMS)


urlpatterns = [
        # Wagtail admin
    path('cms-admin/', include('wagtail.admin.urls')),

    path("pages/<slug:slug>/", api.page_detail, name="page_detail"),
    path('cms-api/', api_router.urls),
    re_path(r'', include('wagtail.urls')),  # يجب أن تكون في الأخير
]


