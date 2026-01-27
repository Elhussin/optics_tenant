

from django.http import HttpResponseForbidden
from functools import wraps
from django.utils.translation import gettext_lazy as _
# Check if apps.users is available, but assuming it is based on context
from apps.users.models import Role, Permission


def role_required(allowed_roles):
    """
    Decorator to check if the user has one of the allowed roles.
    allowed_roles: list of role names (strings)
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user = request.user
            if not user.is_active:
                return HttpResponseForbidden(str(_("User account is disabled.")))

            if not user.is_authenticated:
                return HttpResponseForbidden(str(_("Not authenticated")))

            if user.is_superuser:
                return view_func(request, *args, **kwargs)

            # Check across all roles
            user_role_names = set(user.roles.values_list('name', flat=True))
            if getattr(user, 'role', None):
                user_role_names.add(user.role.name)

            if user_role_names.intersection(set(allowed_roles)):
                return view_func(request, *args, **kwargs)

            return HttpResponseForbidden(str(_("You do not have permission.")))
        return _wrapped_view
    return decorator


def permission_required(required_permission_code):
    """
    Decorator to check if the user has a specific permission.
    required_permission_code: string (ex: 'create_prescription')
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user = request.user

            if not user.is_authenticated:
                return HttpResponseForbidden(str(_("Not authenticated")))

            if user.is_superuser:
                return view_func(request, *args, **kwargs)

            # Check permissions across all roles (ManyToManyField and legacy ForeignKey)
            user_roles = list(user.roles.all())
            if getattr(user, 'role', None):
                user_roles.append(user.role)

            for role in user_roles:
                if role.permissions.filter(code=required_permission_code).exists():
                    return view_func(request, *args, **kwargs)

            return HttpResponseForbidden(str(_("Permission denied.")))
        return _wrapped_view
    return decorator
