from django.contrib import admin

from django.contrib.auth import get_user_model
from .models import Permission, RolePermission ,Role
User = get_user_model()


class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'is_staff')

class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

class PermissionAdmin(admin.ModelAdmin):
    list_display = ('code', 'description')

class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'permission_code')

    def role_name(self, obj):
        return obj.role.name

    def permission_code(self, obj):
        return obj.permission.code

admin.site.register(User,UserAdmin)
admin.site.register(Role,RoleAdmin)
admin.site.register(Permission,PermissionAdmin)
admin.site.register(RolePermission,RolePermissionAdmin)
