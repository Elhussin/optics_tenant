# api/urls.py
from django.urls import path, include

v1_patterns = [
    path('core/', include('core.urls')),
    path('users/', include('apps.users.urls')),
    path('sales/', include('apps.sales.urls')),
    path('accounting/', include('apps.accounting.urls')),
    path('products/', include('apps.products.urls')),
    path('branches/', include('apps.branches.urls')),
    path('hrm/', include('apps.hrm.urls')),
    path('crm/', include('apps.crm.urls')),
    path('prescriptions/', include('apps.prescriptions.urls')),
    path('tenants/', include('apps.tenants.urls')),
    path('cms/', include('apps.cms.urls')),

    # Mobile APIs
    path('', include('apps.api.urls')),
]

urlpatterns = [
    # Path-based API Versioning (v1)
    path('v1/', include(v1_patterns)),

    # Legacy Fallback (without version prefix) for backward compatibility
    path('', include(v1_patterns)),
]
