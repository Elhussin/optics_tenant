"""
Decorators لمعالجة الأخطاء في Views
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
    Decorator لمعالجة الأخطاء في view functions

    الاستخدام:
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
                # الحصول على اللغة
                lang = request.headers.get('Accept-Language', 'ar')
                lang = 'en' if lang.startswith('en') else 'ar'

                # تسجيل الخطأ
                logger.error(f"Error in {func.__name__}: {e}", exc_info=True)

                # إرجاع رسالة الخطأ
                message = ErrorMessages.get(error_key, lang)

                return Response(
                    {
                        'detail': message,
                        'error': str(e) if request.user.is_staff else None,
                        'error_type': error_key.lower()
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        return wrapper
    return decorator


def validate_request_data(*required_fields):
    """
    Decorator للتحقق من وجود الحقول المطلوبة في request.data

    الاستخدام:
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
