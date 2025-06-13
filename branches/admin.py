from django.contrib import admin
from .models import Branch,BranchUsers
# Register your models here.
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch_code', 'branch_type', 'country', 'city', 'address', 'phone', 'email', 'operating_hours')
    search_fields = ('name', 'branch_code', 'branch_type', 'country', 'city', 'address', 'phone', 'email', 'operating_hours')
    list_filter = ('branch_type', 'country', 'city')
    ordering = ('-created_at',)


class BranchUsersAdmin(admin.ModelAdmin):
    list_display = ('employee', 'branch')
    search_fields = ('employee__name', 'branch__name')
    list_filter = ('branch',)
    ordering = ('-created_at',)

admin.site.register(Branch,BranchAdmin)
admin.site.register(BranchUsers,BranchUsersAdmin)
