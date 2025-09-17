

from django.http import HttpResponseForbidden
from functools import wraps
from users.models import Role,Permission

def role_required(allowed_roles):
    """
    Decorator to check if the user has one of the allowed roles.
    allowed_roles: list of role names (strings)
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user = request.user

            if not user.is_authenticated:
                return HttpResponseForbidden("Not authenticated")

            if user.is_superuser:
                return view_func(request, *args, **kwargs)

            # نفترض عندك user.role علاقة ForeignKey لـ Role
            if user.role and user.role.name in allowed_roles:
                return view_func(request, *args, **kwargs)

            return HttpResponseForbidden("You do not have permission.")
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
                return HttpResponseForbidden("Not authenticated")

            if user.is_superuser:
                return view_func(request, *args, **kwargs)

            # هنا بنفترض إن user.role موجود وعلاقته بـ permissions
            if user.role and user.role.permissions.filter(code=required_permission_code).exists():
                return view_func(request, *args, **kwargs)

            return HttpResponseForbidden("Permission denied.")
        return _wrapped_view
    return decorator

#     # core/permissions/decorators.py
# from django.http import HttpResponseForbidden
# from functools import wraps

# from core.permissions.roles import Role
# from core.permissions.permissions import ROLE_PERMISSIONS

# def role_required(allowed_roles):
#     def decorator(view_func):
#         @wraps(view_func)
#         def _wrapped_view(request, *args, **kwargs):
#             user = request.user
#             if not user.is_authenticated:
#                 return HttpResponseForbidden("Not authenticated")

#             if user.is_superuser or user.role in allowed_roles:
#                 return view_func(request, *args, **kwargs)

#             return HttpResponseForbidden("You do not have permission.")
#         return _wrapped_view
#     return decorator




# def permission_required(required_permission):
#     def decorator(view_func):
#         @wraps(view_func)
#         def _wrapped_view(request, *args, **kwargs):
#             user = request.user

#             if not user.is_authenticated:
#                 return HttpResponseForbidden("Not authenticated")

#             try:
#                 role = Role[user.role]
#                 permissions = ROLE_PERMISSIONS.get(role, [])
#                 if permissions == '__all__' or required_permission in permissions:
#                     return view_func(request, *args, **kwargs)
#             except Exception:
#                 pass

#             return HttpResponseForbidden("Permission denied.")
#         return _wrapped_view
#     return decorator




# @role_required(['ADMIN', 'TECHNICIAN'])
# def create_prescription(request):
#     return render(request, 'prescription_form.html')

# @permission_required('create_prescription')
# def create_prescription_view(request):
#     ...


# from django.utils.decorators import method_decorator
# from core.permissions.decorators import role_required

# @method_decorator(role_required(['ADMIN']), name='dispatch')
# class DashboardView(View):
#     def get(self, request, *args, **kwargs):
#         ...
