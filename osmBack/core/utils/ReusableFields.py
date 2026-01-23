"""
حقول قابلة لإعادة الاستخدام مع رسائل خطأ مترجمة
"""

from rest_framework import serializers
from django.core.validators import RegexValidator, MinLengthValidator, MaxLengthValidator
from django.utils.translation import gettext_lazy as _


class ReusableFields:
    """
    حقول قابلة لإعادة الاستخدام في Serializers
    مع رسائل خطأ موحدة ومترجمة باستخدام Django i18n
    """

    @staticmethod
    def username(**kwargs):
        return serializers.CharField(
            validators=[
                MinLengthValidator(5),
                MaxLengthValidator(50),
            ],
            error_messages={
                "required": _("Username is required"),
                "blank": _("Username cannot be blank"),
                "min_length": _("Username must be at least 5 characters"),
                "max_length": _("Username must be at most 50 characters"),
            },
            **kwargs
        )

    @staticmethod
    def password(**kwargs):
        return serializers.CharField(
            write_only=True,
            min_length=8,
            validators=[
                RegexValidator(
                    regex=r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$',
                    message=_(
                        "Password must contain at least one uppercase, one lowercase, and one number")
                )
            ],
            error_messages={
                "required": _("Password is required"),
                "blank": _("Password cannot be blank"),
                "min_length": _("Password must be at least 8 characters"),
            },
            **kwargs
        )

    @staticmethod
    def email(**kwargs):
        return serializers.EmailField(
            error_messages={
                "required": _("Email is required"),
                "blank": _("Email cannot be blank"),
                "invalid": _("Enter a valid email address"),
            },
            **kwargs
        )

    @staticmethod
    def phone(**kwargs):
        return serializers.CharField(
            validators=[
                RegexValidator(
                    regex=r'^\+?\d{7,15}$',
                    message=_("Enter a valid phone number (7-15 digits)")
                )
            ],
            error_messages={
                "required": _("Phone number is required"),
                "blank": _("Phone number cannot be blank"),
            },
            **kwargs
        )

    @staticmethod
    def first_name(**kwargs):
        return serializers.CharField(
            max_length=30,
            error_messages={
                "required": _("First name is required"),
                "blank": _("First name cannot be blank"),
                "max_length": _("First name must be at most 30 characters"),
            },
            **kwargs
        )

    @staticmethod
    def last_name(**kwargs):
        return serializers.CharField(
            max_length=30,
            error_messages={
                "required": _("Last name is required"),
                "blank": _("Last name cannot be blank"),
                "max_length": _("Last name must be at most 30 characters"),
            },
            **kwargs
        )

    @staticmethod
    def name(**kwargs):
        return serializers.CharField(
            max_length=100,
            error_messages={
                "required": _("Name is required"),
                "blank": _("Name cannot be blank"),
                "max_length": _("Name must be at most 100 characters"),
            },
            **kwargs
        )

    @staticmethod
    def sku(**kwargs):
        """حقل SKU مع validation"""
        return serializers.CharField(
            max_length=50,
            error_messages={
                "required": _("SKU is required"),
                "blank": _("SKU cannot be blank"),
                "max_length": _("SKU must be at most 50 characters"),
                "unique": _("Product with this SKU already exists"),
            },
            **kwargs
        )

    @staticmethod
    def price(**kwargs):
        """حقل السعر مع validation"""
        return serializers.DecimalField(
            max_digits=10,
            decimal_places=2,
            min_value=0,
            error_messages={
                "required": _("Price is required"),
                "invalid": _("Enter a valid price"),
                "min_value": _("Price must be greater than or equal to zero"),
                "max_digits": _("Price is too large"),
            },
            **kwargs
        )

    @staticmethod
    def quantity(**kwargs):
        """حقل الكمية مع validation"""
        return serializers.IntegerField(
            min_value=0,
            error_messages={
                "required": _("Quantity is required"),
                "invalid": _("Enter a valid quantity"),
                "min_value": _("Quantity must be greater than or equal to zero"),
            },
            **kwargs
        )

    class _CurrentUserClientDefault:
        requires_context = True

        def __call__(self, serializer_field):
            user = serializer_field.context['request'].user
            return getattr(user, 'client', None)

        def __repr__(self):
            return '%s()' % self.__class__.__name__

    @staticmethod
    def CurrentUserClientDefault():
        return ReusableFields._CurrentUserClientDefault()
