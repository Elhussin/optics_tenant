from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied, NotAuthenticated
from django.utils.translation import gettext_lazy as _


class RoleOrPermissionRequired(BasePermission):
    """
    DRF permission class that supports:
    - allowed_roles
    - required_permissions
    - require_all
    - super_roles
    Can be used directly in permission_classes with arguments.
    """

    def __init__(self, allowed_roles=None, required_permissions=None, require_all=False, super_roles=None):
        self.allowed_roles = allowed_roles or []
        self.required_permissions = required_permissions or []
        self.require_all = require_all
        # Updated to match new roles: TenantOwner and TenantAdmin
        self.super_roles = super_roles if super_roles is not None else [
            "TenantOwner", "TenantAdmin"]

    def __call__(self):
        return self

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            raise NotAuthenticated(
                detail=_("Not authenticated. Please login first"))
        if not user.is_active:
            raise PermissionDenied(
                detail=_("Account disabled. Please contact admin."))

        # Django superuser
        if user.is_superuser:
            return True

        # Collect all roles and permissions
        user_roles = list(user.roles.all())

        role_names = {r.name for r in user_roles}
        user_permissions = set()
        for r in user_roles:
            user_permissions.update(
                r.permissions.values_list("code", flat=True))

        # Check super roles
        if role_names.intersection(set(self.super_roles)):
            return True

        # Check allowed roles
        if self.allowed_roles and role_names.intersection(set(self.allowed_roles)):
            return True

        # Check required permissions
        if self.required_permissions:
            if not user_roles:
                # Permissions required but user has no roles
                pass
            else:
                # SUPPORT WILDCARD
                if "*" in user_permissions:
                    return True

                required_perms = set(self.required_permissions)

                if self.require_all:
                    if required_perms.issubset(user_permissions):
                        return True
                    else:
                        missing = required_perms - user_permissions
                        raise PermissionDenied(
                            detail=_("You are missing the following permissions: {}.").format(
                                ', '.join(missing))
                        )
                else:
                    if user_permissions.intersection(required_perms):
                        return True
                    else:
                        raise PermissionDenied(
                            detail=_("You are missing the following permissions: {}.").format(
                                ', '.join(required_perms))
                        )

        # Failure: No role matched (if allowed_roles set) AND (no permissions matched OR permissions check skipped)
        if self.required_permissions and not user_roles:
            msg = _("You are missing the required permissions (No roles assigned).")
        elif self.allowed_roles:
            msg = _("Access denied. Allowed roles: {}").format(
                ', '.join(self.allowed_roles))
        else:
            msg = _("Permission denied.")

        raise PermissionDenied(detail=msg)

    @classmethod
    def with_requirements(cls, allowed_roles=None, required_permissions=None, require_all=False, super_roles=None):
        """Helper for easy inline usage in DRF views"""
        return type(f"{cls.__name__}_Custom", (cls,), {})(allowed_roles, required_permissions, require_all, super_roles)

    # permission_classes = [
    #     RoleOrPermissionRequired.with_requirements(
    #         allowed_roles=["doctor", "pharmacist"],
    #         required_permissions=["create_prescription", "approve_prescription"],
    #         require_all=False,
    #         super_roles=["admin", "owner"]  # 👈 لهم سماح كامل
    #     )
    # ]

        # permission_classes = [
        # RoleOrPermissionRequired(
        #     allowed_roles=["staff"],
        #     required_permissions=["view_users"]
        # )
    # ]

    #     permission_classes = [
    #     RoleOrPermissionRequired.with_requirements(super_roles=["admin", "owner"])
    # ]
