"""
Decorators for Error Handling in Views
"""

from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from django.utils.translation import gettext_lazy as _
from core.exceptions import ErrorMessages
import logging

logger = logging.getLogger(__name__)


def handle_exceptions(error_key='GENERAL_ERROR'):
    """
    Decorator to handle exceptions in view functions

    Usage:
    @handle_exceptions('INSUFFICIENT_STOCK')
    @action(detail=True, methods=['post'])
    def my_action(self, request, pk=None):
        # ... code
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            try:
                return func(self, request, *args, **kwargs)
            except Exception as e:
                # Log the error
                logger.error(f"Error in {func.__name__}: {e}", exc_info=True)

                # Get translated message
                # Fallback to GENERAL_ERROR if key not found
                message = getattr(ErrorMessages, error_key,
                                  ErrorMessages.GENERAL_ERROR)

                return Response(
                    {
                        'detail': str(message),
                        'error': str(e) if request.user.is_staff else None,
                        'error_type': error_key.lower()
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        return wrapper
    return decorator


def validate_request_data(*required_fields):
    """
    Decorator to validate required fields in request.data

    Usage:
    @validate_request_data('product_id', 'quantity')
    @action(detail=False, methods=['post'])
    def my_action(self, request):
        # ... code
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            missing_fields = [
                field for field in required_fields
                if field not in request.data or not request.data[field]
            ]

            if missing_fields:
                message = str(_("The following fields are required: {fields}").format(
                    fields=', '.join(missing_fields)))

                return Response(
                    {'detail': message},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator
