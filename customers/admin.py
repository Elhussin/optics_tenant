

# Register your models here.
from django.contrib import admin
from .models import Client, Domain
from django_tenants.utils import get_tenant_model, get_public_schema_name
from django.db import connection

if connection.schema_name == get_public_schema_name():
    admin.site.register(Client)
    admin.site.register(Domain)