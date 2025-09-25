from django.urls import path,re_path, include
from django.urls import path, include
from wagtail.api.v2.router import WagtailAPIRouter
from .views import page_detail,PublicPagesAPIViewSet
api_router = WagtailAPIRouter('wagtailapi')
api_router.register_endpoint('pages', PublicPagesAPIViewSet)

urlpatterns = [
    path('api/v2/', api_router.urls),
    path('admin/', include('wagtail.admin.urls')),
    path('documents/', include('wagtail.documents.urls')),
    path("page/<slug:slug>/", page_detail, name="page_detail"),
    path("", include("wagtail.urls")),

]
