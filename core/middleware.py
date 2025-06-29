from django.http import Http404
from django_tenants.middleware import TenantMiddleware
from rest_framework_simplejwt.authentication import JWTAuthentication
import logging
# optics_tenant/core/middleware.py
class TenantMiddleware(TenantMiddleware):
    def get_tenant(self, model, hostname):
        try:
            sub = hostname.split('.')[0]
            if sub in ['www', 'api', 'admin']:
                raise Http404("Admin domain, not a tenant")
            # Find the domain object whose domain matches the hostname
            domain = model.objects.select_related('tenant').get(domain=hostname)
            return domain.tenant
        except model.DoesNotExist:
            raise Http404("Tenant not found")
        except Exception as e:
            print(f"[TenantMiddleware Error] {e}")
            raise Http404("Invalid tenant")

# optics_tenant/core/middleware.py
# This class overrides the authenticate method to retrieve the JWT from cookies
class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get("access_token")

        # Fallback: استخدم الهيدر لو لم يكن هناك كوكي
        if not raw_token:
            header = self.get_header(request)
            if header is None:
                return None
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Error authenticating user: {e}")
            return None


