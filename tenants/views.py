from decimal import Decimal
import logging
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
import requests
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
    get_paypal_access_token,

)
from core.utils.email import send_activation_email, send_message_acount_activated
from core.utils.expiration_date import expiration_date
from optics_tenant.config_loader import config

paymant_logger = logging.getLogger('paypal')
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



# ==============================================================
# Create PayPal order
# ==============================================================
class CreatePaymentOrderView(APIView):
    def post(self, request):
        lang = request.headers.get("Accept-Language", "en")
        serializer = CreatePaymentOrderSerializer(data=request.data)
        if serializer.is_valid():
            client = serializer.validated_data["client"]
            plan = serializer.validated_data["plan"]
            amount = serializer.validated_data["amount"]
            direction = serializer.validated_data["direction"] # string
            method = serializer.validated_data["method"]
            try:
                if method == "paypal" or method == "":
                    approval_url, order_id = create_paypal_order(
                        client, plan.id, lang,direction, amount
                    )
                    return Response({
                        "approval_url": approval_url,
                        "order_id": order_id
                    })
                else:
                    return Response(
                        {"detail": _("Payment method not supported yet.")},
                        status=400
                    )

            except Exception as e:
                paymant_logger.error(f"Error creating payment order: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





# ==============================================================
# Complete payment after user returns from PayPal    
class PayPalExecuteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")  # بدلاً من payment_id
        plan_id = request.data.get("plan_id")
        client_uuid = request.data.get("client_id")
        direction = request.data.get("direction")

        # تحقق من المدخلات
        if not all([order_id, plan_id, client_uuid]):
            return Response({"error": _("Missing PayPal payment information")}, status=400)

        try:
            with transaction.atomic():
                print("statrt")
                try:
                    client = Client.objects.get(uuid=client_uuid)
                    plan = SubscriptionPlan.objects.get(id=plan_id)
                except (Client.DoesNotExist, SubscriptionPlan.DoesNotExist):
                    return Response({"error": _("Client or plan not found")}, status=400)

                # احصل على Access Token
                access_token = get_paypal_access_token()
                if not access_token:
                    paymant_logger.error("Failed to get PayPal access token")
                    return Response({"error": _("Payment verification failed")}, status=500)
                print("getToken")
                # Capture الدفع في PayPal
                capture_url = f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/capture"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {access_token}"
                }
                capture_res = requests.post(capture_url, headers=headers)
                capture_data = capture_res.json()
                print("PayPal Capture Response:", capture_data)

                # تحقق من أن العملية ناجحة
                if capture_data.get("status") != "COMPLETED":
                    paymant_logger.error("Payment not completed", extra={"order_id": order_id})
                    return Response({"error": _("Payment verification failed")}, status=400)

                # إنشاء سجل الدفع في قاعدة البيانات
                payment = Payment.objects.create(
                    client=client,
                    plan=plan,
                    amount=capture_data.get("purchase_units")[0].get("payments").get("captures")[0].get("amount").get("value"),
                    currency=capture_data.get("purchase_units")[0].get("payments").get("captures")[0].get("amount").get("currency_code"),
                    method="paypal",
                    transaction_id=order_id,
                    status="success",
                    direction=direction
                )

                # تطبيق الخطة على العميل
                payment.apply_to_client()
                print("payment applied")

                paymant_logger.info(f"PayPal payment executed successfully: {order_id}")
                return Response({
                    "detail": _("Payment executed successfully"),
                    "payment_id": payment.pk
                }, status=200)

        except Exception as e:
            paymant_logger.error(f"Error executing PayPal payment: {str(e)}")
            return Response({"error": _("Payment processing failed")}, status=500)


# ==============================================================
# Official PayPal Webhook  (Not used) will use it in the future 
# ==============================================================
class PayPalWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        event = request.data
        event_type = event.get("event_type")
        paymant_logger.info(f"Received PayPal webhook: {event_type}")

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

                paymant_logger.info(f"Payment processed successfully for client: {client.name}")
                return Response({"status": "success"})

            except Exception as e:
                paymant_logger.error(f"Error processing PayPal webhook: {str(e)}")
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
