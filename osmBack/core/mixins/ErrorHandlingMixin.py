"""
Mixins to add unified error handling in Views
"""

from rest_framework.response import Response
from rest_framework import status
from django.utils.translation import gettext_lazy as _
from core.exceptions import ErrorMessages
import logging

logger = logging.getLogger(__name__)


class ErrorHandlingMixin:
    """
    Mixin to add unified error handling in ViewSets

    Usage:
    class MyViewSet(ErrorHandlingMixin, viewsets.ModelViewSet):
        pass
    """

    def handle_error(self, error, error_key='GENERAL_ERROR', **kwargs):
        """
        Handle errors consistently

        Args:
            error: The error that occurred
            error_key: Error message key from ErrorMessages
            **kwargs: Additional arguments for error message formatting

        Returns:
            Response: Error response
        """
        # Get translated message via getattr (fallback to GENERAL_ERROR)
        message_obj = getattr(ErrorMessages, error_key,
                              ErrorMessages.GENERAL_ERROR)
        message = str(message_obj)

        if kwargs:
            try:
                message = message.format(**kwargs)
            except Exception:
                pass

        # Log error
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
        Return unified success response

        Args:
            message_key: Success message key
            data: Data to return
            **kwargs: Additional arguments

        Returns:
            Response: Success response
        """

        # Success messages using Django i18n
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
    Mixin to add common validation methods
    """

    def validate_required_fields(self, data, required_fields):
        """
        Validate presence of required fields

        Args:
            data: Data to validate
            required_fields: List of required field names

        Raises:
            ValidationError: If any field is missing
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
        Validate that number is positive

        Args:
            value: Value to validate
            field_name: Field name

        Raises:
            ValidationError: If number is negative
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
