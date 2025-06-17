from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterTenantSerializer
from .utils import send_activation_email, send_message_acount_activated,paid_until_date
from tenants.models import PendingTenantRequest, Client, Domain
from django_tenants.utils import schema_context
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.conf import settings
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi    
from rest_framework.permissions import AllowAny
from django.utils.translation import gettext_lazy as _ # for translation

class RegisterTenantView(APIView):
    permission_classes = [AllowAny]

    # @swagger_auto_schema(
    #     operation_description="Register a new tenant and send activation email.",
    #  responses={
    #         201: openapi.Response(
    #             description="Activation email sent",
    #             examples={"application/json": {"detail": "Activation email sent."}}
    #         ),
    #         400: "Validation error"
    #     },
    # )        request_body=RegisterTenantSerializer,  # 👈 هذا هو المفتاح لظهور الحقول
   

    def post(self, request):
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
        try:
            pending = PendingTenantRequest.objects.get(token=token)
        except PendingTenantRequest.DoesNotExist:
            return Response({"detail": _("Invalid or expired activation link.")}, status=400)

        if pending.is_activated:
            return Response({"detail": _("Your account is already activated.")}, status=400)

        if pending.expires_at < timezone.now():
            return Response({"detail": _("Activation link has expired. Please register again.")}, status=400)

        tenant = Client.objects.create(
            schema_name=pending.schema_name,
            name=pending.name,
            paid_until=paid_until_date(),
            on_trial=True,
        )

        domain = f"{slugify(pending.schema_name)}.{settings.TENANT_BASE_DOMAIN}"
        Domain.objects.create(domain=domain, tenant=tenant, is_primary=True)

        with schema_context(pending.schema_name):
            User = get_user_model()
            User.objects.create_superuser(
                username=pending.email,
                email=pending.email,
                password=pending.password
            )

        pending.is_activated = True
        pending.save()

        send_message_acount_activated(pending.email, pending.schema_name, pending.name)

        return Response({"detail": _("Account activated successfully. You can now log in.")})
