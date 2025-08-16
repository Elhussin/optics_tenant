# ALGORITHM ANALYSIS: Tenant Activation Flow
# ==========================================

"""
CURRENT ALGORITHM FLOW:
1. Extract token from request parameters
2. Validate token exists in database
3. Check if already activated
4. Handle token expiration (renew if expired)
5. Create tenant with atomic transaction
6. Create domain for tenant
7. Run database migrations
8. Mark as activated
9. Create user roles and permissions
10. Send confirmation email

COMPLEXITY ANALYSIS:
- Time Complexity: O(1) for most operations, O(n) for migrations
- Space Complexity: O(1) for data operations
- Critical Path: Database migration is the bottleneck
"""

# IMPROVED VERSION WITH BETTER ALGORITHM STRUCTURE
# ===============================================


from django.db import transaction
from django.core.management import call_command
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import logging
from enum import Enum
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as T
from django_tenants.utils import schema_context
import subprocess
import sys
from django.conf import settings
from tenants.models import (
    PendingTenantRequest,
    Client,
    Domain,
    SubscriptionPlan
)
# from tenants.serializers import (
#     RegisterTenantSerializer,
#     ClientSerializer,
#     DomainSerializer,
#         SubscriptionPlanSerializer
# )

from core.utils.email import send_activation_email, send_message_acount_activated
from core.utils.expiration_date import expiration_date

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
        Algorithm: Atomic tenant creation with rollback capability
        Time Complexity: O(1) for creation, O(n) for migrations
        """
        try:
            with transaction.atomic():
                # Step 1: Create tenant record
                trial_plan = SubscriptionPlan.objects.get(name__iexact="trial")
                tenant = Client.objects.create(
                    schema_name=pending.schema_name,
                    name=pending.name,
                    plan=trial_plan,
                    max_users=trial_plan.max_users,
                    max_products=trial_plan.max_products,
                    max_branches=trial_plan.max_branches,
                    paid_until=expiration_date(trial_plan.duration_months),
                    on_trial=True,
                )
                
                # Step 2: Create domain
                domain = f"{slugify(pending.schema_name)}.{settings.TENANT_BASE_DOMAIN}"
                Domain.objects.create(domain=domain, tenant=tenant, is_primary=True)

                pending.is_activated = True
                pending.is_deleted= True
                pending.save()
                
                return tenant, domain, ActivationStatus.SUCCESS
                
        except Exception as e:
            self.logger.error(f"Tenant creation failed: {str(e)}")
            return None, None, ActivationStatus.CREATION_FAILED
    
    def setup_user_permissions(self, pending, tenant):
        """
        Algorithm: User and permission setup outside main transaction
        Time Complexity: O(1)
        """
        try:
            with schema_context(pending.schema_name):
                from django.contrib.auth import get_user_model
                from users.models import Role, Permission, RolePermission
                
                # Create owner role and permissions
                owner_role, _ = Role.objects.get_or_create(
                    name="owner", 
                    defaults={"description": "Owner role"}
                )
                all_permission, _ = Permission.objects.get_or_create(
                    code="__all__", 
                    defaults={"description": "All permissions"}
                )
                RolePermission.objects.get_or_create(
                    role=owner_role, 
                    permission=all_permission
                )
                
                # Create superuser
                User = get_user_model()
                User.objects.create_superuser(
                    username=pending.name,
                    email=pending.email,
                    password=pending.password,
                    role=owner_role,
                    client=tenant
                )
                call_command('import_csv_with_foreign', schema=pending.schema_name, config="data/csv_config.json")
                # call_command()
            return ActivationStatus.SUCCESS
            
        except Exception as e:
            self.logger.warning(f"Post-activation setup failed: {str(e)}")
            return ActivationStatus.POST_SETUP_FAILED

# OPTIMIZED VIEW IMPLEMENTATION
# =============================

class ActivateTenantView(APIView):
    permission_classes = [AllowAny]
    
    def __init__(self):
        super().__init__()
        self.algorithm = TenantActivation()
    
    def get(self, request):
        """
        Main algorithm execution with improved flow control
        """
        token = request.query_params.get("token")
        
        # Step 1: Validate token
        pending, status = self.algorithm.validate_token(token)
        if status != ActivationStatus.SUCCESS:
            return self._handle_validation_error(status, pending)
        
        # Step 2: Check token expiration
        expiration_status = self.algorithm.handle_token_expiration(pending)
        if expiration_status == ActivationStatus.TOKEN_EXPIRED:
            return Response({
                "detail": T("Activation link expired. New activation email sent.")
            }, status=400)
        
        # Step 3: Create tenant atomically
        tenant, domain, creation_status = self.algorithm.create_tenant_atomic(pending)
        if creation_status != ActivationStatus.SUCCESS:
            return Response({
                "detail": T("Failed to activate account.")
            }, status=500)
        
        # Step 4: Setup user permissions (non-blocking)
        self.algorithm.setup_user_permissions(pending, tenant)
        
        # Step 5: Send confirmation
        send_message_acount_activated(pending.email, pending.schema_name, pending.name)
        
        return Response({
            "detail": T("Account activated successfully. Please wait while we create your store."),
            "tenant_domain": domain
        })
    
    def _handle_validation_error(self, status, pending):
        """Helper method for handling validation errors"""
        error_messages = {
            ActivationStatus.TOKEN_MISSING: T("Token is required."),
            ActivationStatus.INVALID_TOKEN: T("Invalid or expired activation link."),
            ActivationStatus.ALREADY_ACTIVATED: T("Your account is already activated. Please login."),
        }
        return Response({"detail": error_messages[status]}, status=400)

# PERFORMANCE OPTIMIZATIONS TO CONSIDER:
# =====================================

"""
1. ASYNC PROCESSING:
   - Move database migrations to background task (Celery)
   - Make user permission setup asynchronous
   - Send emails asynchronously

2. CACHING:
   - Cache trial plan lookup
   - Cache domain generation logic

3. DATABASE OPTIMIZATIONS:
   - Use select_for_update() for pending request to prevent race conditions
   - Add database indexes on token field
   - Consider connection pooling for migrations

4. MONITORING:
   - Add metrics for activation success/failure rates
   - Monitor migration execution time
   - Track token expiration patterns

5. SCALING CONSIDERATIONS:
   - Use distributed locks for concurrent activations
   - Consider database sharding for high volume
   - Implement circuit breaker for migration failures
"""

# ALGORITHM COMPLEXITY SUMMARY:
# ============================
"""
Current Implementation:
- Best Case: O(1) - token valid, tenant creation succeeds
- Worst Case: O(n) - where n is migration complexity
- Average Case: O(1) + O(migration_time)

Space Complexity: O(1) - constant space usage

Critical Performance Points:
1. Database migration: O(n) - most expensive operation
2. Token lookup: O(1) with proper indexing
3. Tenant creation: O(1)
4. User setup: O(1)

Recommended Improvements:
1. Move migrations to background processing
2. Add proper error recovery mechanisms  
3. Implement retry logic for failed operations
4. Add comprehensive logging and monitoring
"""