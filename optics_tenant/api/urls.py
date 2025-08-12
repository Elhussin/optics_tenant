# api/urls.py
from django.urls import path, include
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.api.v2.router import WagtailAPIRouter

api_router = WagtailAPIRouter('wagtailapi')
api_router.register_endpoint('pages', PagesAPIViewSet)

urlpatterns = [

    path('core/', include('core.urls')),
    path('users/', include('users.urls')),
    path('sales/', include('sales.urls')),
    path('accounting/', include('accounting.urls')),
    path('products/', include('products.urls')),
    path('branches/', include('branches.urls')),
    path('hrm/', include('HRM.urls')),
    path('crm/', include('CRM.urls')),
    path('prescriptions/', include('prescriptions.urls')),
    path('tenants/', include('tenants.urls')),
    path('cms-api/', api_router.urls),  # API الخاص بـ Wagtail
    path('', include('wagtail.urls')),  # عرض صفحات Wagtail في الجذر '/'

]
