# api/urls.py
from django.urls import path, include

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

    # path('cms/', include('cms.urls')),  # Include CMS URLs

]
