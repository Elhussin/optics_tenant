from django.http import HttpResponseForbidden
from django.utils.translation import gettext_lazy as T
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from django_tenants.utils import get_tenant
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
from apps.tenants.models import (
    Client,
    SubscriptionPlan,
    PendingTenantRequest,
    Domain
)
from apps.tenants.serializers import (
    RegisterTenantSerializer,
    ClientSerializer,
    DomainSerializer,
    SubscriptionPlanSerializer
)
from core.utils.email import send_activation_email


class IsPublicTenant(permissions.BasePermission):
    """
    Allows access only on the public tenant schema.
    """

    def has_permission(self, request, view):
        return get_tenant(request).schema_name == 'public'


class RegisterTenantView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tenant = get_tenant(request)
        if tenant.schema_name != 'public':
            return HttpResponseForbidden("Not allowed on tenant domains.")

        serializer = RegisterTenantSerializer(data=request.data)
        if serializer.is_valid():
            pending = serializer.save()
            send_activation_email(pending.email, pending.token)
            return Response({"detail": T("Activation email sent.")}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==============================================================
# View Domain
# =============================================================
class DomainViewSet(BaseViewSet):
    """
    ViewSet to manage domains.
    Only accessible on the public tenant.
    Allows listing, creating, and managing domains and subdomains.
    """
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            super_roles=["admin", "owner"]),
        IsPublicTenant
    ]
    filterset_fields = ['tenant', 'is_primary']
    search_fields = ['domain', 'tenant__name']

# ==============================================================
# ClientViewSet
# ==============================================================


class ClientViewSet(BaseViewSet):
    serializer_class = ClientSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            super_roles=["admin", "owner"]),
        # IsPublicTenant  # 👈 Restrict to Public Djomain Only
    ]

    def get_queryset(self):
        user = self.request.user
        # Admin/Owner can see all clients (or based on platform logic)
        # Assuming 'owner' is platform owner here, or if superuser
        if user.is_superuser or (getattr(user, 'role', None) and user.role.name.lower() in ['admin', 'owner']):
            return Client.objects.all()

        # Regular users see their own client
        user_client = getattr(user, 'client', None)
        if not user_client:
            return Client.objects.none()
        return Client.objects.filter(id=user_client.id)

    # perform_create removed because Clients are created via RegisterTenantView (public flow)
    # or by Platform Admin via specific logic, not generic create here usually.
    # If generic create is needed, it works via BaseViewSet for Admins only now.


class SubscriptionPlanViewSet(BaseViewSet):
    # Public Read, Admin Write
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [
                IsAuthenticated,
                RoleOrPermissionRequired.with_requirements(
                    super_roles=["admin", "owner"]),
                IsPublicTenant  # 👈 Restrict to Public Domain Only
            ]
        return [permission() for permission in permission_classes]


class RegisterTenantViewSet(BaseViewSet):
    # Only Admin/Owner can view pending requests
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            super_roles=["admin", "owner"]),
        IsPublicTenant  # 👈 Restrict to Public Domain Only
    ]
    queryset = PendingTenantRequest.objects.all()
    serializer_class = RegisterTenantSerializer
