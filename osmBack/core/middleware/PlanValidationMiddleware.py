from django.utils.timezone import now
from django.http import JsonResponse
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from apps.tenants.models import Client


class PlanValidationMiddleware:
    """
    Checks plan validity (active / expired) for each tenant
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        tenant = getattr(request, "tenant", None)

        if tenant and tenant.schema_name != "public":
            # Exclude some paths (like payment or login)
            # exempt_paths = [
            #     reverse("tenants:upgrade"),
            #     reverse("users:login"),
            #     reverse("users:logout"),
            # ]
            # if any(request.path.startswith(path) for path in exempt_paths):
            #     return self.get_response(request)

            # Read plan data from public schema
            try:
                client = Client.objects.get(schema_name=tenant.schema_name)
            except Client.DoesNotExist:
                return JsonResponse({"error": str(_("Tenant not found."))}, status=404)

            # Check activation status
            if not client.is_active:
                return JsonResponse({"error": str(_("Your account is inactive."))}, status=403)

            # Check plan expiration
            if client.is_plan_expired:
                return JsonResponse({"error": str(_("Your subscription plan has expired."))}, status=403)

        return self.get_response(request)
