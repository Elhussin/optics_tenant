from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
from .serializers import BranchSerializer, BranchUsersSerializer, ShiftSerializer
from .models import Branch, BranchUsers, Shift
from core.views import BaseViewSet


class BranchViewSet(BaseViewSet):
    # Only Admin/Owner can manage branches usually
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            super_roles=["admin", "owner"])
    ]
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer


class BranchUsersViewSet(BaseViewSet):
    # Admin, Owner, or maybe Manager can assign users
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=["manager"], super_roles=["admin", "owner"])
    ]
    queryset = BranchUsers.objects.all()
    serializer_class = BranchUsersSerializer
    search_fields = ["branch__name", "employee__user__username"]


class ShiftViewSet(BaseViewSet):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=["manager"], super_roles=["admin", "owner"])
    ]
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer

    def get_queryset(self):
        # Optionally filter shifts by query params, e.g., ?branch=X or ?employee=Y
        queryset = super().get_queryset()
        branch_id = self.request.query_params.get('branch')
        employee_id = self.request.query_params.get('employee')

        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)

        return queryset
