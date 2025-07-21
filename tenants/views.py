from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterTenantSerializer
from tenants.models import PendingTenantRequest, Client, Domain, get_expiration_date
from django_tenants.utils import schema_context
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.conf import settings
from django.utils import timezone
from rest_framework.permissions import AllowAny
from django.utils.translation import gettext_lazy as _
from django.http import HttpResponseForbidden
from django_tenants.utils import get_tenant
from core.utils.email import send_activation_email, send_message_acount_activated,paid_until_date

class RegisterTenantView(APIView):
    permission_classes = [AllowAny]
    print("RegisterTenantView")
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
        try:
            pending = PendingTenantRequest.objects.get(token=token)
        except PendingTenantRequest.DoesNotExist:
            return Response({"detail": _("Invalid or expired activation link.")}, status=400)

        if pending.is_activated:
            return Response({"detail": _("Your account is already activated. Please login. You can find your login link in the activation email.")}, status=400)

        if pending.expires_at < timezone.now():
            pending.expires_at = get_expiration_date()
            pending.save()
            send_activation_email(pending.email, pending.token)
            return Response({"detail": _("Activation link has expired. A new activation email has been sent.")}, status=400)

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
                username=pending.name,
                email=pending.email,
                password=pending.password,
                role='owner'
            )

        pending.is_activated = True
        pending.save()

        send_message_acount_activated(pending.email, pending.schema_name,pending.name)

        return Response({"detail": _("Account activated successfully. You can now log in.")})
