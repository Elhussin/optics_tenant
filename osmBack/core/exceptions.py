"""
نظام موحد لمعالجة الأخطاء في Django REST Framework مع دعم الترجمة
يوفر:
1. Custom Exception Handler
2. رسائل خطأ موحدة مع Django i18n
3. معالجة جميع أنواع الأخطاء
4. Logging تلقائي
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import translation
import logging

logger = logging.getLogger(__name__)


class ErrorMessages:
    """رسائل الخطأ الموحدة مع دعم Django i18n"""

    # أخطاء عامة
    GENERAL_ERROR = _("An error occurred. Please try again later.")

    # أخطاء الحقول
    FIELD_REQUIRED = _("This field is required.")
    FIELD_BLANK = _("This field cannot be blank.")
    FIELD_INVALID = _("Invalid value.")

    # أخطاء التكرار
    ALREADY_EXISTS = _("{model} with this {field} already exists.")
    DUPLICATE_ENTRY = _("This record already exists.")

    # أخطاء الصلاحيات
    PERMISSION_DENIED = _("You do not have permission to perform this action.")
    NOT_AUTHENTICATED = _("Authentication credentials were not provided.")

    # أخطاء البيانات
    NOT_FOUND = _("Not found.")
    INVALID_DATA = _("Invalid data provided.")

    # أخطاء المخزون
    INSUFFICIENT_STOCK = _("Insufficient stock. Available: {available}")
    STOCK_RESERVED = _("Stock is reserved and cannot be modified.")


def custom_exception_handler(exc, context):
    """
    معالج مخصص للأخطاء في Django REST Framework مع دعم الترجمة

    يعالج:
    - ValidationError (DRF & Django)
    - IntegrityError (Database)
    - PermissionDenied
    - NotAuthenticated
    - NotFound
    - جميع الأخطاء الأخرى
    """

    # الحصول على اللغة من الـ request
    request = context.get('request')
    if request:
        lang = request.META.get('HTTP_ACCEPT_LANGUAGE', 'ar')
        lang_code = 'en' if lang.startswith('en') else 'ar'
        translation.activate(lang_code)

    # معالجة الأخطاء القياسية من DRF
    response = exception_handler(exc, context)

    # معالجة ValidationError من Django
    if isinstance(exc, DjangoValidationError):
        if hasattr(exc, 'message_dict'):
            # Multiple field errors
            errors = {}
            for field, messages in exc.message_dict.items():
                errors[field] = messages if isinstance(
                    messages, list) else [messages]
            response = Response(errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Single error message
            response = Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

    # معالجة IntegrityError (مثل SKU مكرر)
    elif isinstance(exc, IntegrityError):
        error_message = str(exc)

        # محاولة استخراج اسم الحقل من رسالة الخطأ
        if 'UNIQUE constraint failed' in error_message or 'duplicate key' in error_message:
            # محاولة استخراج اسم الحقل
            field_name = 'field'
            if 'sku' in error_message.lower():
                field_name = 'SKU'
            elif 'email' in error_message.lower():
                field_name = 'email'
            elif 'username' in error_message.lower():
                field_name = 'username'

            # استخدام الرسالة المترجمة
            message = str(ErrorMessages.ALREADY_EXISTS).format(
                model='', field=field_name)
        else:
            message = str(ErrorMessages.DUPLICATE_ENTRY)

        response = Response(
            {'detail': message, 'error_type': 'integrity_error'},
            status=status.HTTP_400_BAD_REQUEST
        )

        # تسجيل الخطأ
        logger.warning(f"IntegrityError: {error_message}")

    # إذا لم يتم معالجة الخطأ بعد
    if response is None:
        # خطأ غير متوقع
        logger.error(f"Unhandled exception: {exc}", exc_info=True)

        response = Response(
            {
                'detail': str(ErrorMessages.GENERAL_ERROR),
                'error_type': 'server_error',
                'debug_info': str(exc) if request and request.user.is_staff else None
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # تحسين رسائل الخطأ القياسية
    elif response.status_code == 401:
        response.data = {
            'detail': str(ErrorMessages.NOT_AUTHENTICATED),
            'error_type': 'authentication_error'
        }

    elif response.status_code == 403:
        response.data = {
            'detail': str(ErrorMessages.PERMISSION_DENIED),
            'error_type': 'permission_error'
        }

    elif response.status_code == 404:
        response.data = {
            'detail': str(ErrorMessages.NOT_FOUND),
            'error_type': 'not_found'
        }

    # إضافة معلومات إضافية للـ response
    if isinstance(response.data, dict):
        response.data['status_code'] = response.status_code

        # إضافة timestamp
        from django.utils import timezone
        response.data['timestamp'] = timezone.now().isoformat()

    # إلغاء تفعيل اللغة
    if request:
        translation.deactivate()

    return response


def validate_unique_field(model, field_name, value, instance=None):
    """
    التحقق من تفرد حقل معين مع رسالة خطأ مترجمة

    Args:
        model: النموذج المراد التحقق منه
        field_name: اسم الحقل
        value: القيمة المراد التحقق منها
        instance: الكائن الحالي (للتحديث)

    Returns:
        value: القيمة إذا كانت فريدة

    Raises:
        ValidationError: إذا كانت القيمة مكررة
    """
    from rest_framework import serializers

    # التحقق من جميع الكائنات بما فيها المحذوفة soft-deleted
    if hasattr(model.objects, 'all_objects'):
        queryset = model.objects.all_objects()
    else:
        queryset = model.objects.all()

    # استثناء الكائن الحالي عند التحديث
    if instance and instance.pk:
        queryset = queryset.exclude(pk=instance.pk)

    # التحقق من التكرار
    if queryset.filter(**{field_name: value}).exists():
        # ترجمة اسم النموذج
        model_name = model._meta.verbose_name or model.__name__

        # ترجمة اسم الحقل
        try:
            field_verbose = model._meta.get_field(
                field_name).verbose_name or field_name
        except:
            field_verbose = field_name

        # استخدام الرسالة المترجمة
        message = str(ErrorMessages.ALREADY_EXISTS).format(
            model=model_name,
            field=field_verbose
        )

        raise serializers.ValidationError({field_name: message})

    return value
