from django.contrib import admin
from django.db import connection
from django_tenants.utils import get_public_schema_name

# التأكد من أننا في schema الرئيسي فقط
print("Loaded schema:", connection.schema_name)  # 🟡 اختبار

if connection.schema_name == get_public_schema_name():
    from .models import Client, Domain, PendingTenantRequest

    admin.site.register(Client)
    admin.site.register(Domain)
    admin.site.register(PendingTenantRequest)
