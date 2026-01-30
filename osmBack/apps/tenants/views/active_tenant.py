from django.core.exceptions import ValidationError
import traceback
from django.db import transaction
from django.core.management import call_command
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import logging
from enum import Enum
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django_tenants.utils import schema_context
from django.conf import settings
from apps.tenants.models import (
    PendingTenantRequest,
    Client,
    Domain,
    SubscriptionPlan
)
from core.utils.email import send_activation_email, send_message_acount_activated, send_failed_activation_email
from core.utils.expiration_date import expiration_date
import threading
from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer
from rest_framework import serializers

paymant_logger = logging.getLogger('paypal')
tenant_logger = logging.getLogger('tenant')


class ActivationStatus(Enum):
    SUCCESS = "success"
    TOKEN_MISSING = "token_missing"
    INVALID_TOKEN = "invalid_token"
    ALREADY_ACTIVATED = "already_activated"
    TOKEN_EXPIRED = "token_expired"
    CREATION_FAILED = "creation_failed"
    POST_SETUP_FAILED = "post_setup_failed"


class TenantActivation:
    """
    Improved algorithm with better error handling and separation of concerns
    """

    def __init__(self, logger=None):
        self.logger = logger or logging.getLogger('tenant')

    def validate_token(self, token):
        """
        Algorithm: Token validation with early returns
        Time Complexity: O(1)
        """
        if not token:
            return None, ActivationStatus.TOKEN_MISSING

        try:
            pending = PendingTenantRequest.objects.get(token=token)
        except PendingTenantRequest.DoesNotExist:
            return None, ActivationStatus.INVALID_TOKEN

        if pending.is_activated:
            return pending, ActivationStatus.ALREADY_ACTIVATED

        return pending, ActivationStatus.SUCCESS

    def handle_token_expiration(self, pending):
        """
        Algorithm: Token expiration handling with automatic renewal
        Time Complexity: O(1)
        """
        if pending.token_expires_at < timezone.now():
            pending.token_expires_at = expiration_date(1)
            pending.save()
            send_activation_email(pending.email, pending.token)
            return ActivationStatus.TOKEN_EXPIRED
        return ActivationStatus.SUCCESS

    def create_tenant_atomic(self, pending):
        """
        Safer tenant creation with pre-checks and better error reporting
        """

        try:
            # ✅ Pre-checks before transaction
            # -------------------------------

            # Check schema name validity
            schema_name = slugify(pending.schema_name)
            if not schema_name:
                raise ValidationError(_("Invalid schema name"))

            if Client.objects.filter(schema_name=schema_name).exists():
                raise ValidationError(
                    _("Schema '{name}' already exists").format(name=schema_name))

            # Check subscription plan
            try:
                trial_plan = SubscriptionPlan.objects.get(name__iexact="trial")
            except SubscriptionPlan.DoesNotExist:
                raise ValidationError(_("Trial subscription plan not found"))

            # Prepare domain
            domain = f"{schema_name}.{settings.TENANT_BASE_DOMAIN}"
            if Domain.objects.filter(domain=domain).exists():
                raise ValidationError(
                    _("Domain '{domain}' already exists").format(domain=domain))

            # ✅ Transaction block
            # --------------------
            with transaction.atomic():
                tenant = Client.objects.create(
                    schema_name=schema_name,
                    name=pending.name,
                    plan=trial_plan,
                    max_users=trial_plan.max_users,
                    max_products=trial_plan.max_products,
                    max_branches=trial_plan.max_branches,
                    paid_until=expiration_date(trial_plan.duration_months),
                    on_trial=True,
                )
           

                Domain.objects.create(
                    domain=domain,
                    tenant=tenant,
                    is_primary=True
                )

                # Mark pending request as activated
                pending.is_deleted = True
                pending.save()

                return tenant, domain, ActivationStatus.SUCCESS

        except Exception as e:
            error_msg = f"Tenant creation failed: {str(e)}"
            # traceback.print_exc()
            self.logger.error(error_msg)
            return None, None, ActivationStatus.CREATION_FAILED

    def setup_user_permissions(self, pending, tenant):
        """
        Algorithm: User and permission setup outside main transaction
        """
        try:
            with schema_context(pending.schema_name):
                from django.contrib.auth import get_user_model
                from apps.users.models import Role, Permission, RolePermission

                # 1. Run CSV import FIRST to populate all predefined roles and permissions
                call_command('import_csv_with_foreign',
                             schema=pending.schema_name, config="data/csv_configotenant.json")

                # 2. Ensure TenantOwner is created/linked correctly (Safety Check)
                owner_role, _ = Role.objects.get_or_create(
                    name="TenantOwner",
                    defaults={"description": "System Owner with full access"}
                )

                # Update core wildcard permission
                all_permission, _ = Permission.objects.get_or_create(
                    code="*",
                    defaults={"description": "All permissions wildcard"}
                )
                RolePermission.objects.get_or_create(
                    role=owner_role, permission=all_permission)

                # 3. Create the Owner User
                User = get_user_model()
                username = pending.email  # Use full email for maximum safety and uniqueness

                if User.objects.filter(email=pending.email).exists():
                    self.logger.warning(
                        f"User with email {pending.email} already exists in schema {pending.schema_name}")
                    return ActivationStatus.POST_SETUP_FAILED

                user = User(
                    username=username,
                    email=pending.email,
                    first_name=pending.name[:30],
                    is_staff=True,
                    is_superuser=True,
                    is_active=True,
                    client=tenant
                )
                # Assign the already hashed password
                user.password = pending.password
                user.save()

                # ✅ NEW: Assign to the multi-role field for the new RBAC system
                user.roles.add(owner_role)

            return ActivationStatus.SUCCESS

            return ActivationStatus.SUCCESS

        except Exception as e:
            import traceback
            # traceback.print_exc()  # Print full trace to console for debugging
            self.logger.error(
                f"Post-activation setup failed for {pending.schema_name}: {str(e)}")
            return ActivationStatus.POST_SETUP_FAILED


# OPTIMIZED VIEW IMPLEMENTATION
# =============================

class ActivateTenantView(APIView):
    permission_classes = [AllowAny]

    def __init__(self):
        super().__init__()
        self.tenantActivation = TenantActivation()

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='token',
                description='Activation token received via email',
                required=True,
                type=str
            )
        ],
        responses={
            200: inline_serializer(
                name='ActivationSuccessResponse',
                fields={
                    'detail': serializers.CharField(),
                }
            ),
            400: inline_serializer(
                name='ActivationErrorResponse',
                fields={
                    'detail': serializers.CharField(),
                }
            )
        }
    )
    def get(self, request):
        """
        Main algorithm execution with improved flow control
        """
        token = request.query_params.get("token")

        # Step 1: Validate token
        pending, status = self.tenantActivation.validate_token(token)
        if status != ActivationStatus.SUCCESS:
            return self._handle_validation_error(status, pending)

        # Step 2: Check token expiration
        expiration_status = self.tenantActivation.handle_token_expiration(
            pending)
        if expiration_status == ActivationStatus.TOKEN_EXPIRED:
            return Response({
                "detail": _("Activation link expired. New activation email sent.")
            }, status=400)

        ResponseData = {
            "detail": _("Start creating your store. Please wait You will receive a confirmation email. "),
            # "tenant_domain": domain,
        }

        threading.Thread(target=self._background_activation,
                         args=(pending,)).start()

        return Response(ResponseData, status=200)

    def _background_activation(self, pending):

        tenant, domain, creation_status = self.tenantActivation.create_tenant_atomic(
            pending)

        if creation_status != ActivationStatus.SUCCESS:
            send_failed_activation_email(pending.email)
            return

        # ✅ Step 2: Manually create schema and run migrations (Outside Transaction)
        try:
            tenant.create_schema(check_if_exists=True, verbosity=1)
        except Exception as e:
            self.tenantActivation.logger.error(
                f"Schema creation failed: {str(e)}")
            send_failed_activation_email(pending.email)
            return

        # Step 3: Setup user and permissions
        self.tenantActivation.setup_user_permissions(pending, tenant)

        send_message_acount_activated(
            pending.email, pending.schema_name, pending.name)

    def _handle_validation_error(self, status, pending):
        """Helper method for handling validation errors"""
        error_messages = {
            ActivationStatus.TOKEN_MISSING: _("Token is required."),
            ActivationStatus.INVALID_TOKEN: _("Invalid or expired activation link."),
            ActivationStatus.ALREADY_ACTIVATED: _("Your account is already activated. Please login."),
        }
        return Response({"detail": error_messages[status]}, status=400)
