"""
Mixins لإضافة معالجة أخطاء موحدة في Views
"""

from rest_framework.response import Response
from rest_framework import status
from django.utils.translation import gettext_lazy as _
from core.exceptions import ErrorMessages
import logging

logger = logging.getLogger(__name__)


class ErrorHandlingMixin:
    """
    Mixin لإضافة معالجة أخطاء موحدة في ViewSets

    الاستخدام:
    class MyViewSet(ErrorHandlingMixin, viewsets.ModelViewSet):
        pass
    """

    def get_error_lang(self):
        """الحصول على لغة رسائل الخطأ من الـ request"""
        lang = self.request.headers.get('Accept-Language', 'ar')
        return 'en' if lang.startswith('en') else 'ar'

    def handle_error(self, error, error_key='GENERAL_ERROR', **kwargs):
        """
        معالجة الأخطاء بشكل موحد

        Args:
            error: الخطأ الذي حدث
            error_key: مفتاح رسالة الخطأ من ErrorMessages
            **kwargs: معاملات إضافية لرسالة الخطأ

        Returns:
            Response: استجابة بالخطأ
        """
        lang = self.get_error_lang()
        message = ErrorMessages.get(error_key, lang, **kwargs)

        # تسجيل الخطأ
        logger.error(
            f"Error in {self.__class__.__name__}: {error}", exc_info=True)

        return Response(
            {
                'detail': message,
                'error_type': error_key.lower(),
                'status_code': status.HTTP_400_BAD_REQUEST
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def success_response(self, message_key, data=None, **kwargs):
        """
        إرجاع استجابة نجاح موحدة

        Args:
            message_key: مفتاح رسالة النجاح
            data: البيانات المراد إرجاعها
            **kwargs: معاملات إضافية

        Returns:
            Response: استجابة النجاح
        """
        lang = self.get_error_lang()

        # رسائل النجاح باستخدام Django i18n
        success_messages = {
            'CREATED': _('Created successfully'),
            'UPDATED': _('Updated successfully'),
            'DELETED': _('Deleted successfully'),
            'ACTION_COMPLETED': _('Action completed successfully'),
        }

        message = str(success_messages.get(message_key, _('Success')))

        response_data = {
            'message': message,
            'status_code': status.HTTP_200_OK
        }

        if data is not None:
            response_data['data'] = data

        return Response(response_data, status=status.HTTP_200_OK)


class ValidationMixin:
    """
    Mixin لإضافة validation methods شائعة
    """

    def validate_required_fields(self, data, required_fields):
        """
        التحقق من وجود الحقول المطلوبة

        Args:
            data: البيانات المراد التحقق منها
            required_fields: قائمة بأسماء الحقول المطلوبة

        Raises:
            ValidationError: إذا كان أي حقل مفقود
        """
        from rest_framework.exceptions import ValidationError

        missing_fields = [
            field for field in required_fields if field not in data or not data[field]]

        if missing_fields:
            message = str(_("The following fields are required: {fields}").format(
                fields=', '.join(missing_fields)))
            raise ValidationError({'detail': message})

    def validate_positive_number(self, value, field_name):
        """
        التحقق من أن الرقم موجب

        Args:
            value: القيمة المراد التحقق منها
            field_name: اسم الحقل

        Raises:
            ValidationError: إذا كان الرقم سالب
        """
        from rest_framework.exceptions import ValidationError
        from decimal import Decimal, InvalidOperation

        try:
            num = Decimal(str(value))
            if num < 0:
                message = str(_("{field_name} must be greater than zero").format(
                    field_name=field_name))
                raise ValidationError({field_name: message})
        except (ValueError, InvalidOperation):
            message = str(_("{field_name} must be a valid number").format(
                field_name=field_name))
            raise ValidationError({field_name: message})
