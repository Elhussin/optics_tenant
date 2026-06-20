
from rest_framework_simplejwt.authentication import JWTAuthentication
import logging
# optics_tenant/core/middleware.py
# This class overrides the authenticate method to retrieve the JWT from cookies
class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get("access_token")

        if not raw_token:
            header = self.get_header(request)
            if header is None:
                return None
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            
            # Security check: Ensure token belongs to the current tenant
            from django.db import connection
            token_tenant = validated_token.get("tenant")
            if token_tenant and token_tenant != connection.schema_name:
                logger = logging.getLogger(__name__)
                logger.warning(f"Cross-tenant authentication attempt! Token for {token_tenant} used on {connection.schema_name}")
                return None
                
            return self.get_user(validated_token), validated_token
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Error authenticating user: {e}")
            return None


