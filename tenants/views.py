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
from tenants.serializers import RegisterTenantSerializer, CreatePayPalOrderSerializer
from tenants.paypal_service import create_paypal_order
from django_tenants.utils import schema_context, get_tenant

from core.utils.email import send_activation_email, send_message_acount_activated
from datetime import timedelta, date
from dateutil.relativedelta import relativedelta
import paypalrestsdk

# ==============================================================
# دالة واحدة لتحديث الاشتراك بعد الدفع
# ==============================================================

def update_subscription_after_payment(client, plan):
    today = timezone.now().date()

    # لو الاشتراك لسه شغال، نمد من تاريخ الانتهاء
    start_date = client.paid_until if client.paid_until and client.paid_until > today else today

    # تحديد مدة الخطة
    duration_days = PLAN_LIMITS[plan]['time']
    end_date = start_date + timedelta(days=duration_days)

    # تحديث بيانات العميل
    client.plan = plan
    client.paid_until = end_date
    client.max_users = PLAN_LIMITS[plan]['max_users']
    client.max_products = PLAN_LIMITS[plan]['max_products']
    client.max_branches = PLAN_LIMITS[plan]['max_branches']
    client.is_active = True
    client.on_trial = (plan == 'trial')
    client.save()

    return client


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
            paid_until=timezone.now().date() + timedelta(days=PLAN_LIMITS['trial']['time']),
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
                role='owner'
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

            try:
                approval_url = create_paypal_order(client, plan, period)
                return Response({"approval_url": approval_url})
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==============================================================
# إكمال الدفع بعد عودة المستخدم من PayPal
# ==============================================================

class PayPalExecuteView(APIView):
    def get(self, request):
        payment_id = request.query_params.get("paymentId")
        payer_id = request.query_params.get("PayerID")

        payment = paypalrestsdk.Payment.find(payment_id)

        if payment.execute({"payer_id": payer_id}):
            # تحديد الخطة من بيانات الدفع
            plan = payment.transactions[0].item_list.items[0].sku
            client_id = payment.transactions[0].custom  # لازم نرسل client_id أثناء إنشاء الطلب

            try:
                client = Client.objects.get(id=client_id)
            except Client.DoesNotExist:
                return Response({"error": "Client not found"}, status=404)

            update_subscription_after_payment(client, plan)

            return Response({"detail": "Payment completed successfully."})

        return Response({"error": "Payment execution failed."}, status=400)


# ==============================================================
# Webhook رسمي من PayPal
# ==============================================================

class PayPalWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        event = request.data
        if event.get("event_type") == "PAYMENT.SALE.COMPLETED":
            plan = event["resource"]["transactions"][0]["item_list"]["items"][0]["sku"]
            client_id = event["resource"].get("custom")

            try:
                client = Client.objects.get(id=client_id)
            except Client.DoesNotExist:
                return Response({"error": "Client not found"}, status=404)

            update_subscription_after_payment(client, plan)

        return Response({"status": "ok"})


# ==============================================================
# إلغاء الدفع
# ==============================================================

class PayPalCancelView(APIView):
    def get(self, request):
        return Response({"detail": "Payment cancelled."})
