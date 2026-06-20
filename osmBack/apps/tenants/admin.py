from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from .models import Domain, Client, SubscriptionPlan, PendingTenantRequest, Payment, TenantSettings

@admin.register(Client)
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('name', 'schema_name', 'paid_until', 'on_trial', 'is_active')
    search_fields = ('name', 'schema_name')
    list_filter = ('is_active', 'on_trial', 'created_at')

@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ('domain', 'tenant', 'is_primary')
    search_fields = ('domain', 'tenant__name')
    list_filter = ('is_primary',)

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'duration_months', 'duration_years', 'month_price', 'year_price')
    search_fields = ('name',)

@admin.register(PendingTenantRequest)
class PendingTenantRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'is_activated', 'created_at')
    search_fields = ('name', 'email')
    list_filter = ('is_activated',)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('client', 'plan', 'amount', 'status', 'transaction_id', 'created_at')
    search_fields = ('client__name', 'transaction_id')
    list_filter = ('status', 'method')

@admin.register(TenantSettings)
class TenantSettingsAdmin(admin.ModelAdmin):
    list_display = ['business_name','description']
