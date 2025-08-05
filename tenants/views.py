from decimal import Decimal
import logging
from django.conf import settings
from django.http import HttpResponseForbidden
from django.utils import timezone
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from django_tenants.utils import schema_context, get_tenant
from tenants.models import (
    PendingTenantRequest,
    Client,
    Domain,
    Payment,
    SubscriptionPlan
)
from tenants.serializers import (
    RegisterTenantSerializer,
    CreatePaymentOrderSerializer,
    ClientSerializer,
    DomainSerializer,
    SubscriptionPlanSerializer
)
from tenants.service import (
    create_paypal_order,
    update_subscription_after_payment,
    get_paypal_access_token,
    verify_paypal_transaction,
    log_payment
)
from core.utils.email import send_activation_email, send_message_acount_activated
from core.utils.expiration_date import expiration_date
from optics_tenant.config_loader import config

logger = logging.getLogger('paypal')
tenant_logger = logging.getLogger('tenant')

FRONTEND_URL = config("FRONTEND_URL")

# ==============================================================
# تسجيل العميل الجديد (trial فقط)
# ==============================================================

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
            return Response({"detail": _("Activation email sent.")}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# ==============================================================
# تفعيل العميل بعد الضغط على رابط التفعيل
# ==============================================================

# class ActivateTenantView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         token = request.query_params.get("token")
#         try:
#             pending = PendingTenantRequest.objects.get(token=token)
#         except PendingTenantRequest.DoesNotExist:
#             return Response({"detail": _("Invalid or expired activation link.")}, status=400)

#         if pending.is_activated:
#             return Response({"detail": _("Your account is already activated. Please login.")}, status=400)

#         if pending.token_expires_at < timezone.now():
#             pending.token_expires_at = expiration_date(1)
#             pending.save()
#             send_activation_email(pending.email, pending.token)
#             return Response({"detail": _("Activation link expired. New activation email sent.")}, status=400)
#         trial_plan = SubscriptionPlan.objects.get(name__iexact="trial")
       
#         # Create Client with trial plan
#         tenant = Client.objects.create(
#                 schema_name=pending.schema_name,
#                 name=pending.name,
#                 plan=trial_plan,
#                 max_users=trial_plan.max_users,
#                 max_products=trial_plan.max_products,
#                 max_branches=trial_plan.max_branches,
#                 paid_until=expiration_date(trial_plan.duration_months),
#                 on_trial=True,
#             )

#         # Create domain
#         domain = f"{slugify(pending.schema_name)}.{settings.TENANT_BASE_DOMAIN}"
#         Domain.objects.create(domain=domain, tenant=tenant, is_primary=True)

#         # Create superuser inside tenant schema
#         with schema_context(pending.schema_name):
#             from django.contrib.auth import get_user_model
#             User = get_user_model()
#             User.objects.create_superuser(
#                 username=pending.name,
#                 email=pending.email,
#                 password=pending.password,
#                 role=Role.objects.get(name="owner"),
#                 client=tenant
#             )

#         pending.is_activated = True
#         pending.save()

#         send_message_acount_activated(pending.email, pending.schema_name, pending.name)

#         return Response({"detail": _("Account activated successfully. You can now log in.")})



class ActivateTenantView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        token = request.query_params.get("token")
        
        # Validate token exists
        if not token:
            return Response({"detail": _("Token is required.")}, status=400)
        
        try:
            pending = PendingTenantRequest.objects.get(token=token)
        except PendingTenantRequest.DoesNotExist:
            return Response({"detail": _("Invalid or expired activation link.")}, status=400)
        
        # Check if already activated
        if pending.is_activated:
            return Response({"detail": _("Your account is already activated. Please login.")}, status=400)
        
        # Check token expiration
        if pending.token_expires_at < timezone.now():
            try:
                pending.token_expires_at = expiration_date(1)
                pending.save()
                send_activation_email(pending.email, pending.token)
                return Response({"detail": _("Activation link expired. New activation email sent.")}, status=400)
            except Exception as e:
                tenant_logger.error(f"Failed to resend activation email: {str(e)}")
                return Response({"detail": _("Failed to resend activation email.")}, status=500)
        
        # Use database transaction to ensure atomicity
        try:
            with transaction.atomic():
                # Get trial plan
                try:
                    trial_plan = SubscriptionPlan.objects.get(name__iexact="trial")
                except SubscriptionPlan.DoesNotExist:
                    tenant_logger.error("Trial plan not found")
                    return Response({"detail": _("System configuration error. Please contact support.")}, status=500)
                
                # Create Client with trial plan
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
                
                # Create domain
                domain = f"{slugify(pending.schema_name)}.{settings.TENANT_BASE_DOMAIN}"
                Domain.objects.create(domain=domain, tenant=tenant, is_primary=True)
                
                # Create superuser inside tenant schema
                # owner_role = Role.objects.get(name__iexact="owner")

                with schema_context(pending.schema_name):
                    from django.contrib.auth import get_user_model
                    from users.models import Role,Permission,RolePermission
                    

                    try:
                        owner_role=Role.objects.create(name="owner",description="Owner role")
                        all_permission=Permission.objects.create(code="__all__",description="All permissions")
                        RolePermission.objects.create(role=owner_role,permission=all_permission)
                        # owner_role = Role.objects.get(name__iexact="owner")
                    except Role.DoesNotExist as e:
                        tenant_logger.error("Owner role not found in tenant schema", e)
                        raise Exception("Owner role not found")


                    User = get_user_model()
                    User.objects.create_superuser(
                        username=pending.name,
                        email=pending.email,
                        password=pending.password,
                        role=owner_role,
                        client=tenant
                    )
                
                # Mark as activated
                pending.is_activated = True
                pending.save()
                
                # Send success notification (outside transaction if it fails, activation still succeeds)
                try:
                    send_message_acount_activated(pending.email, pending.schema_name, pending.name)
                except Exception as e:
                    tenant_logger.warning(f"Failed to send activation email: {str(e)}")
                    # Don't fail the whole process for email issues
                
                return Response({
                    "detail": _("Account activated successfully. You can now log in."),
                    "tenant_domain": domain
                })
                
        except Exception as e:
            tenant_logger.error(f"Tenant activation failed: {str(e)}")
            return Response({
                "detail": _("Account activation failed. Please try again or contact support.")
            }, status=500)


# Additional helper function for better error handling
# def safe_create_tenant_user(schema_name, pending_data, tenant):
#     """
#     Safely create user in tenant schema with proper error handling
#     """
#     try:
#         with schema_context(schema_name):
#             from django.contrib.auth import get_user_model
#             User = get_user_model()
            
#             # Check if user already exists
#             if User.objects.filter(email=pending_data.email).exists():
#                 raise Exception("User already exists in tenant")
            
#             # Get owner role
#             owner_role = Role.objects.get(name="owner")
            
#             # Create superuser
#             user = User.objects.create_superuser(
#                 username=pending_data.name,
#                 email=pending_data.email,
#                 password=pending_data.password,
#                 role=owner_role,
#                 client=tenant
#             )
#             return user
            
#     except Exception as e:
#         tenant_logger.error(f"Failed to create tenant user: {str(e)}")
#         raise

# ==============================================================
# Create PayPal order
# ==============================================================

class CreatePaymentOrderView(APIView):
    def post(self, request):
        serializer = CreatePaymentOrderSerializer(data=request.data)
        if serializer.is_valid():
            client=serializer.validated_data["client"]
            plan=serializer.validated_data["plan"]
            amount=serializer.validated_data["amount"]
            duration=serializer.validated_data["duration"]
            method=serializer.validated_data["method"]
            print(client,plan,amount,duration,method)
            print(plan.name)
            
            try:
                if method == "paypal" or method == "":
                    approval_url = create_paypal_order(client, plan.name, duration,amount)
                    return Response({"approval_url": approval_url})
                # add other payment methods
                else:
                    return Response({"detail": _("Payment method not supported yet.")}, status=400)

            except Exception as e:
                logger.error(f"Error creating payment order: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





# ==============================================================
# Complete payment after user returns from PayPal


# class PayPalExecuteView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         payment_id = request.data.get("paymentId")
#         payer_id = request.data.get("PayerID")
#         plan_id = request.data.get("plan_id")
#         client_uuid = request.data.get("client_id")

#         if not all([payment_id, payer_id, plan_id, client_uuid]):
#             return Response({"error": "Missing required fields"}, status=400)

#         # Check client
#         try:
#             client = Client.objects.get(uuid=client_uuid)
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=400)

#         # Check plan
#         try:
#             plan = SubscriptionPlan.objects.get(id=plan_id)
#         except SubscriptionPlan.DoesNotExist:
#             return Response({"error": "Plan not found"}, status=400)


#         access_token = get_paypal_access_token()
#         if not verify_paypal_transaction(payment_id, access_token):
#             log_payment(client.id, plan, payment_id, "failed") # To log the payment
#             return Response({"error": "Payment not completed"}, status=400)

#         payment = Payment.objects.create(
#             client=client,
#             plan=plan,
#             amount=Decimal(plan.price),
#             currency=plan.currency,
#             method="paypal",
#             transaction_id=payment_id,
#             status="success"
#         )
#         payment.apply_to_client()

#         return Response({"detail": "Payment executed successfully"}, status=200)
    
class PayPalExecuteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payment_id = request.data.get("paymentId")
        payer_id = request.data.get("PayerID")
        plan_id = request.data.get("plan_id")
        client_uuid = request.data.get("client_id")
        internal_payment_id = request.data.get("payment_id")  # Our internal payment ID

        # Validate required fields
        if not all([payment_id, payer_id]):
            return Response({"error": _("Missing PayPal payment information")}, status=400)

        try:
            with transaction.atomic():
                # Get internal payment record if provided
                payment = None
                if internal_payment_id:
                    try:
                        payment = Payment.objects.get(id=internal_payment_id, status='pending')
                        client = payment.client
                        plan = payment.plan
                    except Payment.DoesNotExist:
                        return Response({"error": _("Payment record not found")}, status=400)
                else:
                    # Fallback to old method if internal payment ID not provided
                    if not all([plan_id, client_uuid]):
                        return Response({"error": _("Missing required fields")}, status=400)
                    
                    try:
                        client = Client.objects.get(uuid=client_uuid)
                        plan = SubscriptionPlan.objects.get(id=plan_id)
                    except (Client.DoesNotExist, SubscriptionPlan.DoesNotExist) as e:
                        return Response({"error": _("Client or plan not found")}, status=400)

                # Verify PayPal transaction
                access_token = get_paypal_access_token()
                if not access_token:
                    logger.error("Failed to get PayPal access token")
                    return Response({"error": _("Payment verification failed")}, status=500)

                if not verify_paypal_transaction(payment_id, access_token):
                    if payment:
                        payment.status = "failed"
                        payment.save()
                    
                    log_payment(client.id, plan, payment_id, "failed")
                    return Response({"error": _("Payment verification failed")}, status=400)

                # Update existing payment or create new one
                if payment:
                    payment.transaction_id = payment_id
                    payment.status = "success"
                    payment.save()
                else:
                    payment = Payment.objects.create(
                        client=client,
                        plan=plan,
                        amount=plan.get_price(),  # Use default monthly price
                        currency=plan.currency,
                        method="paypal",
                        transaction_id=payment_id,
                        status="success"
                    )

                # Apply plan to client
                payment.apply_to_client()

                logger.info(f"PayPal payment executed successfully: {payment_id}")
                return Response({
                    "detail": _("Payment executed successfully"),
                    "payment_id": payment.id
                }, status=200)

        except Exception as e:
            logger.error(f"Error executing PayPal payment: {str(e)}")
            return Response({
                "error": _("Payment processing failed")
            }, status=500)

# ==============================================================
# Official PayPal Webhook  (Not used) will use it in the future 
# ==============================================================
class PayPalWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        event = request.data
        event_type = event.get("event_type")
        logger.info(f"Received PayPal webhook: {event_type}")

        if event_type == "PAYMENT.SALE.COMPLETED":
            try:
                plan_name = event["resource"]["transactions"][0]["item_list"]["items"][0]["sku"]
                client_id = event["resource"].get("custom")
                transaction_id = event["resource"]["id"]

                client = Client.objects.get(id=client_id)
                plan = SubscriptionPlan.objects.get(name__iexact=plan_name)

                payment = Payment.objects.create(
                    client=client,
                    plan=plan,
                    amount=Decimal(plan.price),
                    currency=plan.currency,
                    method="paypal",
                    transaction_id=transaction_id,
                    status="success"
                )
                payment.apply_to_client()

                logger.info(f"Payment processed successfully for client: {client.name}")
                return Response({"status": "success"})

            except Exception as e:
                logger.error(f"Error processing PayPal webhook: {str(e)}")
                return Response({"error": str(e)}, status=400)

        return Response({"status": "ignored"})

# ==============================================================
# Cancel Payment
# ==============================================================

class PayPalCancelView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.shortcuts import redirect
        return redirect(FRONTEND_URL + "/api/tenant/paypal/cancel")


# ==============================================================
# ClientViewSet
# ==============================================================

class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get the client associated with the user
        user_client = self.request.user.client
        if not user_client:
            return Client.objects.none()
        return Client.objects.filter(id=user_client.id)

    def retrieve(self, request, *args, **kwargs):
        # Check if the user has permission to view the client
        instance = self.get_object()
        if not request.user.client or instance.id != request.user.client.id:
            raise PermissionDenied("You do not have permission to view this client.")
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Check if the user has permission to create a client
        if not self.request.user.client:
            raise PermissionDenied("You do not have permission to create a client.")
        serializer.save(id=self.request.user.client.id)


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




class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] 
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
