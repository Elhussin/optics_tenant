# api/urls.py
from django.urls import path, include
from django.contrib import admin
urlpatterns = [
    path('core/', include('core.urls')),
    path('sales/', include('sales.urls')),
    path('accounting/', include('accounting.urls')),
    path('products/', include('products.urls')),
    path('branches/', include('branches.urls')),
    path('hrm/', include('HRM.urls')),
    path('crm/', include('CRM.urls')),
    path('prescriptions/', include('prescriptions.urls')),
    path('admin/', admin.site.urls),
]
