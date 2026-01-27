"""
Middleware for handling unexpected errors
"""

import logging
from django.http import JsonResponse
from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware:
    """
    Middleware to handle errors occuring outside DRF
    e.g. routing errors, CSRF, etc.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """Handle unexpected exceptions"""

        # Handle 404
        if isinstance(exception, Http404):
            return JsonResponse({
                'detail': str(_('Page not found.')),
                'error_type': 'not_found',
                'status_code': 404
            }, status=404)

        # Handle PermissionDenied
        if isinstance(exception, PermissionDenied):
            return JsonResponse({
                'detail': str(_('Permission denied.')),
                'error_type': 'permission_denied',
                'status_code': 403
            }, status=403)

        # Log unexpected errors
        logger.error(f"Unhandled exception: {exception}", exc_info=True)

        # Return None to allow other exception handlers to process
        return None
