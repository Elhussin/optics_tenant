from decimal import Decimal
import logging
from django.utils.translation import gettext_lazy as T
from django.db import transaction
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework import status
from apps.tenants.models import (
    Client,
    Payment,
    SubscriptionPlan
)
from apps.tenants.serializers import (
    CreatePaymentOrderSerializer,
    # PaymentSerializer # Assuming we might want this later, but for now we'll handle without or add if needed
)
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
# CHANGED: Import from unified paypal_service
from apps.tenants.paypal_service import (
    create_paypal_order,
    capture_paypal_order,
    get_paypal_access_token
)

paymant_logger = logging.getLogger('paypal')


# ==============================================================
class CreatePaymentOrderView(APIView):
    def post(self, request):
        lang_header = request.headers.get('accept-language', 'en')
        lang = lang_header.split(',')[0].split('-')[0] # 'en'
        serializer = CreatePaymentOrderSerializer(data=request.data)
        if serializer.is_valid():
            client = serializer.validated_data["client"]
            plan = serializer.validated_data["plan"]
            amount = serializer.validated_data["amount"]
            direction = serializer.validated_data["direction"]  # string
            method = serializer.validated_data["method"]
            try:
                if method == "paypal" or method == "":
                    # Logic delegated to service
                    approval_url, order_id = create_paypal_order(
                        client, plan, lang, direction, amount
                    )
                    return Response({
                        "approval_url": approval_url,
                        "order_id": order_id
                    })
                else:
                    return Response(
                        {"detail": T("Payment method not supported yet.")},
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
        order_id = request.data.get("order_id")
        plan_id = request.data.get("plan_id")
        client_uuid = request.data.get("client_id")
        direction = request.data.get("direction")

        # Basic Validation
        if not all([order_id, plan_id, client_uuid]):
            return Response({"error": T("Missing PayPal payment information")}, status=400)

        if not all([order_id, plan_id, client_uuid]):
            return Response({"error": T("Missing PayPal payment information")}, status=400)

        try:
            # 1. Capture via Service (OUTSIDE Transaction)
            # --------------------------------------------
            try:
                capture_data = capture_paypal_order(order_id)
            except Exception as e:
                paymant_logger.error(f"PayPal capture failed: {str(e)}")
                return Response({"error": T("Payment verification failed at provider")}, status=400)

            # Check Status
            if capture_data.get("status") != "COMPLETED":
                paymant_logger.error("Payment not completed", extra={
                                     "order_id": order_id})
                return Response({"error": T("Payment verification failed")}, status=400)

            # Extract Details safely
            try:
                purchase_unit = capture_data.get("purchase_units")[0]
                captures = purchase_unit.get("payments").get("captures")[0]
                paid_amount = Decimal(captures.get("amount").get("value"))
                currency_code = captures.get("amount").get("currency_code")
            except (IndexError, AttributeError, ValueError) as e:
                paymant_logger.error(
                    f"Error parsing PayPal response: {str(e)}")
                return Response({"error": T("Invalid payment data received")}, status=400)

            # 2. Database Operations (INSIDE Transaction)
            # -------------------------------------------
            with transaction.atomic():
                try:
                    client = Client.objects.get(uuid=client_uuid)
                    plan = SubscriptionPlan.objects.get(id=plan_id)
                except (Client.DoesNotExist, SubscriptionPlan.DoesNotExist):
                    return Response({"error": T("Client or plan not found")}, status=400)

                # Validate Amount (Fraud Protection)
                expected_amount = plan.year_price if direction == 'year' else plan.month_price
                # Allow small floating point difference? usually Exact match for currency.
                if paid_amount < expected_amount:
                    paymant_logger.critical(
                        f"Fraud Attempt? Paid {paid_amount} but expected {expected_amount} for plan {plan.name}")
                    # We might still record the payment as 'partial' or 'fraud' but currently we reject
                    return Response({"error": T("Paid amount mismatch")}, status=400)

                # Create Payment Record
                payment = Payment.objects.create(
                    client=client,
                    plan=plan,
                    amount=paid_amount,
                    currency=currency_code,
                    method="paypal",
                    transaction_id=order_id,
                    status="success",
                    direction=direction
                )

                # Apply Plan
                payment.apply_to_client()

                paymant_logger.info(
                    f"PayPal payment executed successfully: {order_id}")
                return Response({
                    "detail": T("Payment executed successfully"),
                    "payment_id": payment.pk
                }, status=200)

        except Exception as e:
            # Catching generic DB or other errors
            import traceback
            traceback.print_exc()
            paymant_logger.error(f"Error executing PayPal payment: {str(e)}")
            return Response({"error": T("Payment processing failed")}, status=500)


# ==============================================================
# Official PayPal Webhook (Not used) will use it in the future
# ==============================================================
class PayPalWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Placeholder for future implementation using service verification
        event = request.data
        return Response({"status": "ignored"})


# ==============================================================
# Cancel Payment
# ==============================================================
class PayPalCancelView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.shortcuts import redirect
        # Logic to redirect to frontend cancel page
        # This should ideally be dynamic based on config
        return redirect("/payment-cancelled")


class PaymentListView(APIView):
    # Secure: Only Authenticated Admins/Owners
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            super_roles=["admin", "owner"])
    ]

    def get(self, request):
        # Admin can filter by client
        client_uuid = request.query_params.get("client_id")
        user = request.user

        # Superuser/Owner sees all or filtered
        if user.is_superuser or (user.role and user.role.name in ["owner"]):
            if client_uuid:
                payments = Payment.objects.filter(client__uuid=client_uuid)
            else:
                payments = Payment.objects.all()
        else:
            # Regular user sees only their client's payments (if they have one)
            if user.client:
                payments = Payment.objects.filter(client=user.client)
            else:
                payments = Payment.objects.none()

        # Serialization (Manual construction if serializer missing, or add Generic)
        data = [{
            "id": p.id,
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
            "created_at": p.created_at,
            "plan_name": p.plan.name if p.plan else "N/A"
        } for p in payments]

        return Response({"results": data, "count": payments.count()})
