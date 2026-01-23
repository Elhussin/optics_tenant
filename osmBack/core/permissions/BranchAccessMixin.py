"""
Branch-Based Data Access Mixin

This mixin provides automatic filtering of querysets based on the user's assigned branches.
It enforces branch-level data isolation for multi-branch organizations.
"""

from rest_framework.exceptions import PermissionDenied
from django.utils.translation import gettext_lazy as _


class BranchAccessMixin:
    """
    Mixin to restrict data access based on user's assigned branches.

    Usage:
        class MyViewSet(BranchAccessMixin, BaseViewSet):
            branch_field = 'branch'  # The field linking to Branch model
            allow_all_branches_for_roles = ['admin', 'owner', 'manager']
    """

    # Override these in subclasses if needed
    branch_field = 'branch'  # Field name linking to Branch
    # Roles that can see all branches
    allow_all_branches_for_roles = ['admin', 'owner']
    # If True, users without branch assignment get empty queryset
    require_branch_assignment = True

    def get_user_branches(self, user=None):
        """
        Get list of branch IDs the user has access to.
        Returns None if user can access all branches (admin/owner).
        """
        user = user or self.request.user

        if not user or not user.is_authenticated:
            return []

        # Django superuser sees everything
        if user.is_superuser:
            return None

        # Collect all role names
        user_roles = {r.name for r in user.roles.all()}
        if getattr(user, 'role', None):
            user_roles.add(user.role.name)

        # Super roles see everything
        if user_roles.intersection(set(self.allow_all_branches_for_roles)):
            return None

        # Get user's assigned branches via Employee -> BranchUsers
        try:
            employee = getattr(user, 'employee', None)
            if not employee:
                return []

            # Get active branch assignments
            from apps.branches.models import BranchUsers
            branch_ids = list(
                BranchUsers.objects.filter(
                    employee=employee,
                    is_active=True
                ).values_list('branch_id', flat=True)
            )
            return branch_ids

        except Exception:
            return []

    def filter_queryset_by_branch(self, queryset):
        """
        Filter queryset to only include records from user's branches.
        """
        branch_ids = self.get_user_branches()

        # None means user can see all
        if branch_ids is None:
            return queryset

        # Empty list means no access
        if not branch_ids and self.require_branch_assignment:
            return queryset.none()

        # Filter by branch field
        filter_kwargs = {f'{self.branch_field}__in': branch_ids}
        return queryset.filter(**filter_kwargs)

    def get_queryset(self):
        """Override to apply branch filtering."""
        queryset = super().get_queryset()
        return self.filter_queryset_by_branch(queryset)

    def validate_branch_access(self, branch, action='access'):
        """
        Validate that user has access to a specific branch.
        Use in create/update operations.
        """
        branch_ids = self.get_user_branches()

        # None means all access
        if branch_ids is None:
            return True

        # Check if branch is in user's list
        branch_id = branch.id if hasattr(branch, 'id') else branch
        if branch_id not in branch_ids:
            raise PermissionDenied(
                detail=_("ليس لديك صلاحية الوصول لهذا الفرع.")
            )

        return True


class TransferBranchAccessMixin(BranchAccessMixin):
    """
    Extended mixin for transfers that have from_branch and to_branch.
    User must have access to the source branch to create/manage transfers.
    """

    branch_field = 'from_branch'  # Source branch for filtering

    def filter_queryset_by_branch(self, queryset):
        """
        For transfers, show if user has access to from_branch OR to_branch.
        """
        branch_ids = self.get_user_branches()

        if branch_ids is None:
            return queryset

        if not branch_ids and self.require_branch_assignment:
            return queryset.none()

        from django.db.models import Q
        return queryset.filter(
            Q(from_branch__in=branch_ids) | Q(to_branch__in=branch_ids)
        )

    def validate_transfer_branch_access(self, from_branch, to_branch):
        """
        Validate user has access to source branch for creating transfers.
        """
        branch_ids = self.get_user_branches()

        if branch_ids is None:
            return True

        from_id = from_branch.id if hasattr(from_branch, 'id') else from_branch

        if from_id not in branch_ids:
            raise PermissionDenied(
                detail=_("ليس لديك صلاحية إنشاء تحويلات من هذا الفرع.")
            )

        return True
