from django.shortcuts import render

# Create your views here.
# # api/views.py

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from customers.models import PendingTenantRequest, Client, Domain
# from django_tenants.utils import schema_context
# from django.contrib.auth import get_user_model
# from django.utils.text import slugify
# from django.conf import settings

# class ActivateTenantView(APIView):
#     def get(self, request):
#         token = request.query_params.get("token")

#         try:
#             pending = PendingTenantRequest.objects.get(token=token, is_activated=False)
#         except PendingTenantRequest.DoesNotExist:
#             return Response({"detail": "Invalid or expired activation link."}, status=400)

#         # إنشاء tenant
#         tenant = Client.objects.create(
#             schema_name=pending.schema_name,
#             name=pending.name,
#             paid_until='2030-01-01',
#             on_trial=True,
#         )

#         # إنشاء domain
#         full_domain = f"{slugify(pending.name)}.{settings.TENANT_BASE_DOMAIN}"
#         Domain.objects.create(
#             domain=full_domain,
#             tenant=tenant,
#             is_primary=True
#         )

#         # إنشاء superuser داخل tenant schema
#         with schema_context(pending.schema_name):
#             User = get_user_model()
#             User.objects.create_superuser(
#                 email=pending.email,
#                 username=pending.email,
#                 password=pending.password
#             )

#         pending.is_activated = True
#         pending.save()

#         return Response({"detail": "Account activated successfully."})


# api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterTenantSerializer
from .utils import send_activation_email
# api/views.py (تكملة)
from customers.models import PendingTenantRequest, Client, Domain
from django_tenants.utils import schema_context
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.conf import settings

class RegisterTenantView(APIView):
    def post(self, request):
        serializer = RegisterTenantSerializer(data=request.data)
        if serializer.is_valid():
            pending = serializer.save()
            send_activation_email(pending.email, pending.token)
            return Response({"detail": "Activation email sent."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActivateTenantView(APIView):
    def get(self, request):
        token = request.query_params.get("token")
        try:
            pending = PendingTenantRequest.objects.get(token=token, is_activated=False)
        except PendingTenantRequest.DoesNotExist:
            return Response({"detail": "Invalid or expired activation link."}, status=400)

        tenant = Client.objects.create(
            schema_name=pending.schema_name,
            name=pending.name,
            paid_until='2030-01-01',
            on_trial=True,
        )

        domain = f"{slugify(pending.name)}.{settings.TENANT_BASE_DOMAIN}"
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
        return Response({"detail": "Account activated successfully. You can now log in."})
