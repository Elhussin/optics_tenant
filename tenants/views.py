from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.conf import settings
from django.utils import timezone
from django.http import HttpResponseForbidden
from tenants.models import PendingTenantRequest, Client, Domain, PLAN_LIMITS
from tenants.serializers import RegisterTenantSerializer, CreatePayPalOrderSerializer ,ClientSerializer ,DomainSerializer,SubscriptionPlanSerializer
from tenants.paypal_service import create_paypal_order,update_subscription_after_payment,get_paypal_access_token,verify_paypal_transaction
from django_tenants.utils import schema_context, get_tenant
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from core.utils.email import send_activation_email, send_message_acount_activated
from datetime import timedelta, date
from dateutil.relativedelta import relativedelta
import paypalrestsdk
from rest_framework import viewsets, permissions
from .models import Client
from optics_tenant.config_loader import config
import logging

# logger = logging.loggers('paypal')
logger = logging.getLogger('paypal')

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

        if pending.expires_at < timezone.now():
            pending.expires_at = timezone.now() + timedelta(days=PLAN_LIMITS['trial']['time'])
            pending.save()
            send_activation_email(pending.email, pending.token)
            return Response({"detail": _("Activation link expired. New activation email sent.")}, status=400)

        # إنشاء Client بالخطة trial فقط
        tenant = Client.objects.create(
            schema_name=pending.schema_name,
            name=pending.name,
            plan='trial',
            max_users=PLAN_LIMITS['trial']['max_users'],
            max_products=PLAN_LIMITS['trial']['max_products'],
            max_branches=PLAN_LIMITS['trial']['max_branches'],
            paid_until=timezone.now().date() + timedelta(days=PLAN_LIMITS['trial']['duration_days']),
            on_trial=True,
        )

        # إنشاء الدومين
        domain = f"{slugify(pending.schema_name)}.{settings.TENANT_BASE_DOMAIN}"
        Domain.objects.create(domain=domain, tenant=tenant, is_primary=True)

        # إنشاء superuser داخل tenant schema
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
# إنشاء دفع PayPal
# ==============================================================

class CreatePayPalOrderView(APIView):
    def post(self, request):
        serializer = CreatePayPalOrderSerializer(data=request.data)
        if serializer.is_valid():
            client = serializer.validated_data["client"]
            plan = serializer.validated_data["plan"]
            period = serializer.validated_data["period"]
            logger.info(f"Creating PayPal order for client: {client.name}, plan: {plan}, period: {period}")
            try:
                approval_url = create_paypal_order(client, plan, period)
                return Response({"approval_url": approval_url})
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# ==============================================================
# إكمال الدفع بعد عودة المستخدم من PayPal
# ==============================================================
FRONTEND_URL=config("FRONTEND_URL")

# class PayPalExecuteView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         payment_id = request.data.get("paymentId")
#         payer_id = request.data.get("PayerID")
#         plan = request.data.get("plan")
#         period = request.data.get("period")
#         amount = request.data.get("amount")
#         client_id = request.data.get("client_id")
#         print("request.data",request.data)
#         if not all([payment_id, payer_id, plan, period, client_id]):
#             logger.error(f"Missing required fields: payment_id={payment_id}, payer_id={payer_id}, plan={plan}, period={period}, client_id={client_id}, amount={amount}")
#             return Response({"error": "Missing required fields"}, status=400)
        

#         access_token = get_paypal_access_token()
#         print("access_token",access_token)
        
#         if not verify_paypal_transaction(payment_id, access_token):
#             Payment.objects.create(
#                 client_id=client_id,
#                 amount=0,
#                 currency="USD",
#                 method="paypal",
#                 transaction_id=payment_id,
#                 plan=plan,
#                 start_date=now().date(),
#                 end_date=now().date(),
#                 status="failed"
#                 )
#             return Response({"error": "Payment not completed"}, status=400)

#         try:    
#             payment = paypalrestsdk.Payment.find(payment_id)
#         except Exception as e:
#             Payment.objects.create(
#                 client_id=client_id,
#                 amount=0,
#                 currency="USD",
#                 method="paypal",
#                 transaction_id=payment_id,
#                 plan=plan,
#                 start_date=now().date(),
#                 end_date=now().date(),
#                 status="failed"
#             )
#             logger.error(f"PayPal error while finding payment {payment_id}: {str(e)}")
#             return Response({"error": f"PayPal error: {str(e)}"}, status=400)


#         if payment.execute({"payer_id": payer_id}):
#             logger.info(f"Payment executed successfully for payment {payment_id}")
#             client = Client.objects.get(id=client_id)
#             update_subscription_after_payment(client, plan, period,payment.amount,payment_id)
#             return Response({
#                 "detail": "Payment executed successfully. Subscription will be updated via webhook."
#             }, status=200)
#         else:
#             logger.error(f"Payment execution failed: {payment.error}")
#             Payment.objects.create(
#                 client_id=client_id,
#                 amount=0,
#                 currency="USD",
#                 method="paypal",
#                 transaction_id=payment_id,
#                 plan=plan,
#                 start_date=now().date(),
#                 end_date=now().date(),
#                 status="failed"
#             )
#             return Response({"error": "Payment execution failed"}, status=400)

class PayPalExecuteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payment_id = request.data.get("paymentId")
        payer_id = request.data.get("PayerID")
        plan = request.data.get("plan")
        period = request.data.get("period")
        client_id = request.data.get("client_id")

        if not all([payment_id, payer_id, plan, period, client_id]):
            logger.error("Missing required fields")
            return Response({"error": "Missing required fields"}, status=400)

        access_token = get_paypal_access_token()
        if not verify_paypal_transaction(payment_id, access_token):
            log_payment(client_id, plan, payment_id, "failed")
            return Response({"error": "Payment not completed"}, status=400)

        try:
            payment = paypalrestsdk.Payment.find(payment_id)
            amount = Decimal(payment.transactions[0].amount.total)
        except Exception as e:
            log_payment(client_id, plan, payment_id, "failed")
            logger.error(f"PayPal find error: {str(e)}")
            return Response({"error": "PayPal error"}, status=400)

        if payment.execute({"payer_id": payer_id}):
            logger.info(f"Payment executed successfully for {payment_id}")
            client = Client.objects.get(id=client_id)
            update_subscription_after_payment(client, plan, period)
            log_payment(client_id, plan, payment_id, "success", amount)
            return Response({"detail": "Payment executed successfully"}, status=200)

        logger.error(f"Payment execution failed for {payment_id}")
        log_payment(client_id, plan, payment_id, "failed")
        return Response({"error": "Payment execution failed"}, status=400)


# ==============================================================
# Webhook رسمي من PayPal
# ==============================================================

class PayPalWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        event = request.data
        event_type = event.get("event_type")
        logger.info(f"Received PayPal webhook: {event.get('event_type')}")

        if event_type == "PAYMENT.SALE.COMPLETED":
            try:
                plan = event["resource"]["transactions"][0]["item_list"]["items"][0]["sku"]
                client_id = event["resource"].get("custom")
                amount = event["resource"]["amount"]["total"]
                currency = event["resource"]["amount"]["currency"]
                transaction_id = event["resource"]["id"]

                logger.info(f"Processing PayPal webhook: plan={plan}, client_id={client_id}, amount={amount}, currency={currency}, transaction_id={transaction_id}")

                from tenants.models import Client
                client = Client.objects.get(id=client_id)
                logger.info(f"Found client: {client.name}")
            except Exception as e:
                logger.error(f"Error processing PayPal webhook: {str(e)}")
                return Response({"error": str(e)}, status=400)

            from django.utils.timezone import now
            from dateutil.relativedelta import relativedelta
            today = now().date()

            # تحديد مدة الاشتراك
            if plan == 'trial':
                end_date = today + relativedelta(days=7)
            elif plan == 'basic':
                end_date = today + relativedelta(months=1)
            elif plan == 'premium':
                end_date = today + relativedelta(months=6)
            elif plan == 'enterprise':
                end_date = today + relativedelta(years=1)

            # إنشاء الدفع وتحديث العميل
            payment = Payment.objects.create(
                client=client,
                amount=amount,
                currency=currency,
                method="paypal",
                transaction_id=transaction_id,
                plan=plan,
                start_date=today,
                end_date=end_date,
                status="success"
            )
            payment.apply_to_client()
            logger.info(f"Payment processed successfully for client: {client.name}")
            return Response({"status": "success"})

        return Response({"status": "ignored"})

# ==============================================================
# إلغاء الدفع
# ==============================================================

class PayPalCancelView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return redirect(FRONTEND_URL + "/paypal/cancel")




class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    print("queryset",queryset)
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]  # ⬅️ يمنع الوصول إلا مع جلسة مستخدم نشطة

    def get_queryset(self):
        """
        إرجاع الـ Client الخاص بالمستخدم الحالي فقط
        """
        user_client = self.request.user.client  # الـ client المرتبط بالمستخدم
        print("user_client",user_client)        
        if user_client is None:
            # لو المستخدم ما عندوش client → ما يرجع حاجة
            return Client.objects.none()

        # عرض الـ client الخاص به فقط
        return Client.objects.filter(id=user_client.id)

    def retrieve(self, request, *args, **kwargs):
        """
        منع الوصول إذا حاول يجيب Client لا يخصه
        """
        instance = self.get_object()
        if request.user.client is None or instance.id != request.user.client.id:
            raise PermissionDenied("You do not have permission to view this client.")
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """
        منع إنشاء Client جديد إلا إذا كان نفس client المستخدم
        """
        if self.request.user.client is None:
            raise PermissionDenied("You do not have permission to create a client.")
        serializer.save(id=self.request.user.client.id)



class DomainView(APIView):
    def get(self, request):
        tenant = get_tenant(request)
        if tenant.schema_name != 'public':
            return HttpResponseForbidden("Not allowed on tenant domains.")
        
        serializer = DomainSerializer(tenant)
        return Response(serializer.data)


class SubscriptionPlanView(APIView):
    def get(self, request):
        tenant = get_tenant(request)
        if tenant.schema_name != 'public':
            return HttpResponseForbidden("Not allowed on tenant domains.")
        
        serializer = SubscriptionPlanSerializer(tenant)
        return Response(serializer.data)



