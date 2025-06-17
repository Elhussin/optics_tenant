# customers/serializers.py
from rest_framework import serializers
from tenants.models import Client, Domain

from django.conf import settings
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django_tenants.utils import schema_context
from tenants.models import PendingTenantRequest
from django.core.validators import RegexValidator
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _ # for translation

from django.utils.text import slugify

class RegisterTenantSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[
            RegexValidator(
                regex=r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$',
                message=_("Password must contain at least one uppercase, one lowercase letter, and one number.")
            )
        ],
        error_messages={
            "required": _("Password is required."),
            "blank": _("Password cannot be blank."),
        }
    )

    name = serializers.CharField(
        error_messages={
            "required": _("Store name is required."),
            "blank": _("Store name cannot be blank.")
        }
    )

    email = serializers.EmailField(
        error_messages={
            "required": _("Email is required."),
            "blank": _("Email cannot be blank."),
            "invalid": _("Enter a valid email address.")
        }
    )

    class Meta:
        model = PendingTenantRequest
        fields = ['name', 'email', 'password']  

    def validate_email(self, value):
        if PendingTenantRequest.objects.filter(email=value, is_activated=False).exists():
            raise serializers.ValidationError(_("An activation email has already been sent to this email."))
        return value

    def create(self, validated_data):
        name = validated_data['name']
        schema_base = slugify(name)

        # generate unique schema_name
        schema_name = schema_base
        i = 1
        while Client.objects.filter(schema_name=schema_name).exists() or \
              PendingTenantRequest.objects.filter(schema_name=schema_name).exists():
            schema_name = f"{schema_base}{i}"
            i += 1

        return PendingTenantRequest.objects.create(
            name=name,
            email=validated_data['email'],
            password=validated_data['password'],
            schema_name=schema_name
        )
