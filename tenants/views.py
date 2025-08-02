from decimal import Decimal
import logging
from datetime import timedelta
from dateutil.relativedelta import relativedelta

from django.conf import settings
from django.http import HttpResponseForbidden
from django.utils import timezone
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

from rest_framework import status, viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
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
from optics_tenant.config_loader import config

logger = logging.getLogger('paypal')

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

class ActivateTenantView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get("token")
        try:
            pending = PendingTenantRequest.objects.get(token=token)
        except PendingTenantRequest.DoesNotExist:
            return Response({"detail": _("Invalid or expired activation link.")}, status=400)

        if pending.is_activated:
            return Response({"detail": _("Your account is already activated. Please login.")}, status=400)

        if pending.token_expires_at < timezone.now():
            pending.token_expires_at = expiration_date(1)
            pending.save()
            send_activation_email(pending.email, pending.token)
            return Response({"detail": _("Activation link expired. New activation email sent.")}, status=400)
        trial_plan = SubscriptionPlan.objects.get(name__iexact="trial")
       
        # Create Client with trial plan
        tenant = Client.objects.create(
                schema_name=pending.schema_name,
                name=pending.name,
                plan=trial_plan,
                max_users=trial_plan.max_users,
                max_products=trial_plan.max_products,
                max_branches=trial_plan.max_branches,
                paid_until=expiration_date(trial_plan.duration_days),
                on_trial=True,
            )

        # Create domain
        domain = f"{slugify(pending.schema_name)}.{settings.TENANT_BASE_DOMAIN}"
        Domain.objects.create(domain=domain, tenant=tenant, is_primary=True)

        # Create superuser inside tenant schema
        with schema_context(pending.schema_name):
            from django.contrib.auth import get_user_model
            User = get_user_model()
            User.objects.create_superuser(
                username=pending.name,
                email=pending.email,
                password=pending.password,
                role='owner',
                client=tenant
            )

        pending.is_activated = True
        pending.save()

        send_message_acount_activated(pending.email, pending.schema_name, pending.name)

        return Response({"detail": _("Account activated successfully. You can now log in.")})


# ==============================================================
# Create PayPal order
# ==============================================================

class CreatePaymentOrderView(APIView):
    def post(self, request):
        serializer = CreatePaymentOrderSerializer(data=request.data)
        if serializer.is_valid():
            client = serializer.validated_data["client"]
            plan = serializer.validated_data["plan"]
            period = serializer.validated_data["period"]
            method = serializer.validated_data["method"]
            amount = plan.price
            logger.info(f"Creating payment order: client={client.name}, plan={plan}, period={period}, method={method}")

            try:
                if method == "paypal":
                    approval_url = create_paypal_order(client, plan, period,amount)
                    return Response({"approval_url": approval_url})
                else:
                    # Here you can add any other payment method
                    # For now, only PayPal is supported
                    return Response({"detail": _("Payment method not supported yet.")}, status=400)

            except Exception as e:
                logger.error(f"Error creating payment order: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





# ==============================================================
# Complete payment after user returns from PayPal


class PayPalExecuteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payment_id = request.data.get("paymentId")
        payer_id = request.data.get("PayerID")
        plan_id = request.data.get("plan_id")
        client_uuid = request.data.get("client_id")

        if not all([payment_id, payer_id, plan_id, client_uuid]):
            return Response({"error": "Missing required fields"}, status=400)

        # Check client
        try:
            client = Client.objects.get(uuid=client_uuid)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=400)

        # Check plan
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id)
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=400)


        access_token = get_paypal_access_token()
        if not verify_paypal_transaction(payment_id, access_token):
            log_payment(client.id, plan, payment_id, "failed") # To log the payment
            return Response({"error": "Payment not completed"}, status=400)

        payment = Payment.objects.create(
            client=client,
            plan=plan,
            amount=Decimal(plan.price),
            currency=plan.currency,
            method="paypal",
            transaction_id=payment_id,
            status="success"
        )
        payment.apply_to_client()

        return Response({"detail": "Payment executed successfully"}, status=200)
    

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


# ==============================================================
# View Subscription Plan
# =============================================================
# class SubscriptionPlanView(APIView):
#     def get(self, request):
#         tenant = get_tenant(request)
#         if tenant.schema_name != 'public':
#             return HttpResponseForbidden("Not allowed on tenant domains.")
        
#         plans = SubscriptionPlan.objects.filter(is_active=True)
#         serializer = SubscriptionPlanSerializer(plans, many=True)
#         return Response(serializer.data)

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]  # أو الصلاحيات التي تريدها