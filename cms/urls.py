from django.urls import path,re_path, include
# from . import api

# from wagtail.api.v2.router import WagtailAPIRouter
# from cms.api import PublicPagesAPIViewSet

# api_router = WagtailAPIRouter('wagtailapi')
# # api_router.register_endpoint('pages', PublicPagesAPIViewSet)
# # api_router.register_endpoint('public-pages', PublicPagesAPIViewSet)
# api_router = WagtailAPIRouter('public_api')
# api_router.register_endpoint('pages', PublicPagesAPIViewSet)
#     # Wagtail URLs (أي صفحة ديناميكية من الـ CMS)


# urlpatterns = [

#     path('cms-admin/', include('wagtail.admin.urls')),
#     path('public-api/', api_router.urls),
#     re_path(r'', include('wagtail.urls')),  # يجب أن تكون في الأخير
# ]


# from wagtail.api.v2.views import PagesAPIViewSet
# from wagtail.api.v2.router import WagtailAPIRouter

# api_router = WagtailAPIRouter('wagtailapi')
# api_router.register_endpoint('pages', PagesAPIViewSet)

# urlpatterns = [
#     path('cms-api/', api_router.urls),
# ]

from django.urls import path, include
from wagtail.api.v2.router import WagtailAPIRouter
from wagtail.api.v2.views import PagesAPIViewSet
from .views import page_detail,PublicPagesAPIViewSet
api_router = WagtailAPIRouter('wagtailapi')
# api_router.register_endpoint('pages', PagesAPIViewSet)
api_router.register_endpoint('pages', PublicPagesAPIViewSet)


urlpatterns = [
    path('cms-api/', api_router.urls),
    path('cms-admin/', include('wagtail.admin.urls')),
    path('documents/', include('wagtail.documents.urls')),
    path('', include('wagtail.urls')),

    path("cms/pages/<slug:slug>/", page_detail, name="page_detail"),
        re_path(r'', include('wagtail.urls')),  # يجب أن تكون في الآخر
]
