# core/permissions/has_permission.py
from rest_framework.permissions import BasePermission
from core.permissions.roles import Role
from core.permissions.permissions import ROLE_PERMISSIONS


class HasPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        required_permission = getattr(view, 'required_permission', None)

        if not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        user_roles = list(user.roles.all())

        for r in user_roles:
            try:
                role_enum = Role[r.name]
                allowed_permissions = ROLE_PERMISSIONS.get(role_enum, [])
                if allowed_permissions == '__all__' or required_permission in allowed_permissions:
                    return True
            except (KeyError, AttributeError):
                continue

        return False
