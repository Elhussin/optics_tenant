from .models import *

from django.contrib import admin

# Register your models here.
admin.site.register(Client)
admin.site.register(SubscriptionPlan)
admin.site.register(PendingTenantRequest)
admin.site.register(Domain)
admin.site.register(Payment)
