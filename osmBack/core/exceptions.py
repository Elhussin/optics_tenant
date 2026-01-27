"""
Unified Error Handling System for Django REST Framework with Localization Support
Provides:
1. Custom Exception Handler
2. Unified error messages with Django i18n
3. Handling of all error types
4. Automatic Logging
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
    """Unified error messages with Django i18n support"""

    # General Errors
    GENERAL_ERROR = _("An error occurred. Please try again later.")

    # Field Errors
    FIELD_REQUIRED = _("This field is required.")
    FIELD_BLANK = _("This field cannot be blank.")
    FIELD_INVALID = _("Invalid value.")

    # Duplicate Errors
    ALREADY_EXISTS = _("{model} with this {field} already exists.")
    DUPLICATE_ENTRY = _("This record already exists.")

    # Permission Errors
    PERMISSION_DENIED = _("You do not have permission to perform this action.")
    NOT_AUTHENTICATED = _("Authentication credentials were not provided.")

    # Data Errors
    NOT_FOUND = _("Not found.")
    INVALID_DATA = _("Invalid data provided.")

    # Inventory Errors
    INSUFFICIENT_STOCK = _("Insufficient stock. Available: {available}")
    STOCK_RESERVED = _("Stock is reserved and cannot be modified.")


def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework with localization support

    Handles:
    - ValidationError (DRF & Django)
    - IntegrityError (Database)
    - PermissionDenied
    - NotAuthenticated
    - NotFound
    - All other exceptions
    """

    # Get language from request
    request = context.get('request')
    if request:
        lang = request.META.get('HTTP_ACCEPT_LANGUAGE', 'ar')
        lang_code = 'en' if lang.startswith('en') else 'ar'
        translation.activate(lang_code)

    # Handle standard DRF exceptions
    response = exception_handler(exc, context)

    # Handle Django ValidationError
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

    # Handle IntegrityError (e.g. duplicate SKU)
    elif isinstance(exc, IntegrityError):
        error_message = str(exc)

        # Try to extract field name from error message
        if 'UNIQUE constraint failed' in error_message or 'duplicate key' in error_message:
            # Try to identify the field
            field_name = 'field'
            if 'sku' in error_message.lower():
                field_name = 'SKU'
            elif 'email' in error_message.lower():
                field_name = 'email'
            elif 'username' in error_message.lower():
                field_name = 'username'

            # Use translated message
            message = str(ErrorMessages.ALREADY_EXISTS).format(
                model='', field=field_name)
        else:
            message = str(ErrorMessages.DUPLICATE_ENTRY)

        response = Response(
            {'detail': message, 'error_type': 'integrity_error'},
            status=status.HTTP_400_BAD_REQUEST
        )

        # Log the error
        logger.warning(f"IntegrityError: {error_message}")

    # If exception is not yet handled
    if response is None:
        # Unexpected error
        logger.error(f"Unhandled exception: {exc}", exc_info=True)

        response = Response(
            {
                'detail': str(ErrorMessages.GENERAL_ERROR),
                'error_type': 'server_error',
                'debug_info': str(exc) if request and request.user.is_staff else None
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Improve standard error messages
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

    # Add additional info to response
    if isinstance(response.data, dict):
        response.data['status_code'] = response.status_code

        # Add timestamp
        from django.utils import timezone
        response.data['timestamp'] = timezone.now().isoformat()

    # Deactivate language
    if request:
        translation.deactivate()

    return response


def validate_unique_field(model, field_name, value, instance=None):
    """
    Validate field uniqueness with translated error message

    Args:
        model: Model to check
        field_name: Name of the field
        value: Value to check
        instance: Current instance (for update)

    Returns:
        value: The value if unique

    Raises:
        ValidationError: If value is duplicate
    """
    from rest_framework import serializers

    # Check all objects including soft-deleted ones
    if hasattr(model.objects, 'all_objects'):
        queryset = model.objects.all_objects()
    else:
        queryset = model.objects.all()

    # Exclude current instance on update
    if instance and instance.pk:
        queryset = queryset.exclude(pk=instance.pk)

    # Check for duplicates
    if queryset.filter(**{field_name: value}).exists():
        # Translated model name
        model_name = model._meta.verbose_name or model.__name__

        # Translated field name
        try:
            field_verbose = model._meta.get_field(
                field_name).verbose_name or field_name
        except:
            field_verbose = field_name

        # Use translated message
        message = str(ErrorMessages.ALREADY_EXISTS).format(
            model=model_name,
            field=field_verbose
        )

        raise serializers.ValidationError({field_name: message})

    return value
