from rest_framework import viewsets
from .serializers import BranchSerializer, BranchUsersSerializer, ShiftSerializer
from .models import Branch, BranchUsers, Shift
from core.views import BaseViewSet


class BranchViewSet(BaseViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer


class BranchUsersViewSet(BaseViewSet):
    queryset = BranchUsers.objects.all()
    serializer_class = BranchUsersSerializer


class ShiftViewSet(BaseViewSet):
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
