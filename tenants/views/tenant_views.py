from django.http import HttpResponseForbidden
from django.utils.translation import gettext_lazy as T
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from django_tenants.utils import  get_tenant
from tenants.models import (
    Client,
    SubscriptionPlan
)
from tenants.serializers import (
    RegisterTenantSerializer,
    ClientSerializer,
    DomainSerializer,
        SubscriptionPlanSerializer
)

from core.utils.email import send_activation_email, send_message_acount_activated
from core.utils.expiration_date import expiration_date
from optics_tenant.config_loader import config


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



# class ActivateTenantView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         token = request.query_params.get("token")
#         if not token:
#             return Response({"detail": T("Token is required.")}, status=400)

#         try:
#             pending = PendingTenantRequest.objects.get(token=token)
#         except PendingTenantRequest.DoesNotExist:
#             return Response({"detail": T("Invalid or expired activation link.")}, status=400)

#         if pending.is_activated:
#             return Response({"detail": T("Your account is already activated. Please login.")}, status=400)

#         if pending.token_expires_at < timezone.now():
#             pending.token_expires_at = expiration_date(1)
#             pending.save()
#             send_activation_email(pending.email, pending.token)
#             return Response({"detail": T("Activation link expired. New activation email sent.")}, status=400)

#         try:
#             with transaction.atomic():
#                 trial_plan = SubscriptionPlan.objects.get(name__iexact="trial")
#                 tenant = Client.objects.create(
#                     schema_name=pending.schema_name,
#                     name=pending.name,
#                     plan=trial_plan,
#                     max_users=trial_plan.max_users,
#                     max_products=trial_plan.max_products,
#                     max_branches=trial_plan.max_branches,
#                     paid_until=expiration_date(trial_plan.duration_months),
#                     on_trial=True,
#                 )

#                 domain = f"{slugify(pending.schema_name)}.{settings.TENANT_BASE_DOMAIN}"
#                 Domain.objects.create(domain=domain, tenant=tenant, is_primary=True)
                
#                 print("Creating tenant and migrating...",pending.schema_name,pending.name)
#                 call_command("create_tenant_and_migrate", schema=pending.schema_name,name=pending.name)

#             pending.is_activated = True
#             pending.save()



#         except Exception as e:
#             tenant_logger.error(f"Tenant activation failed: {str(e)}")
#             return Response({"detail": T("Failed to activate account.")}, status=500)

#         # خارج الترانزاكشن: استيراد البيانات + إرسال الإيميل
#         # call_command("import_csv_with_foreign", config="data/csv_config.json", schema=pending.schema_name)
#         # call_command("import_pages", config="data/csv/pages1.csv", schema=pending.schema_name)
        
#         try:
#             with schema_context(pending.schema_name):
#                 from django.contrib.auth import get_user_model
#                 from users.models import Role, Permission, RolePermission
                
#                 owner_role, _ = Role.objects.get_or_create(name="owner", defaults={"description": "Owner role"})
#                 all_permission, _ = Permission.objects.get_or_create(code="__all__", defaults={"description": "All permissions"})
#                 RolePermission.objects.get_or_create(role=owner_role, permission=all_permission)

#                 User = get_user_model()
#                 User.objects.create_superuser(
#                     username=pending.name,
#                     email=pending.email,
#                     password=pending.password,
#                     role=owner_role,
#                     client=tenant
#                 )

#         except Exception as e:
#             tenant_logger.warning(f"Post-activation step failed: {str(e)}")

#         send_message_acount_activated(pending.email, pending.schema_name, pending.name)
#         return Response({
#             "detail": ("Account activated successfully. Please wait while we create your store."),
#             "tenant_domain": domain
#         })



# ==============================================================
# View Domain
# =============================================================
class DomainView(APIView):
    def get(self, request):
        tenant = get_tenant(request)
        if tenant.schema_name != 'public':
            return HttpResponseForbidden("Not allowed on tenant domains.")
        
        serializer = DomainSerializer(tenant)
        return Response(serializer.data)

# ==============================================================
# ClientViewSet
# ==============================================================

class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get the client associated with the user
        if self.request.user.role.name.lower() == 'owner':
            return Client.objects.all()
            
        user_client = self.request.user.client
        if not user_client:
            return Client.objects.none()
        return Client.objects.filter(id=user_client.id)

    def retrieve(self, request, *args, **kwargs):
        # Check if the user has permission to view the client
        instance = self.get_object()
        if not request.user.client or instance.id != request.user.client.id:
            if self.request.user.role.name.lower() != 'owner':
                raise PermissionDenied("You do not have permission to view this client.")
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Check if the user has permission to create a client
        if not self.request.user.client:
            raise PermissionDenied("You do not have permission to create a client.")
        serializer.save(id=self.request.user.client.id)



class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] 
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer