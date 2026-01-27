from django.http import Http404
from django_tenants.middleware import TenantMiddleware
import logging

logger = logging.getLogger(__name__)

# optics_tenant/core/middleware/TenantMiddleware.py


class TenantMiddleware(TenantMiddleware):
    def get_tenant(self, model, hostname):
        try:
            sub = hostname.split('.')[0]
            # logger.debug(f"[TenantMiddleware] Hostname: {hostname}, Subdomain: {sub}")
            if sub in ['www', 'api', 'admin']:
                raise Http404("Admin domain, not a tenant")
            # Find the domain object whose domain matches the hostname
            domain = model.objects.select_related(
                'tenant').get(domain=hostname)
            return domain.tenant
        except model.DoesNotExist:
            logger.warning(
                f"[TenantMiddleware] Tenant not found for hostname: {hostname}")
            raise Http404("Tenant not found")
        except Exception as e:
            logger.error(f"[TenantMiddleware Error] {e}", exc_info=True)
            raise Http404("Invalid tenant")
