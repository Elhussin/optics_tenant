# # customers/serializers.py
# from rest_framework import serializers
# from customers.models import Client, Domain

# from django.conf import settings
# from django.utils.text import slugify
# from django.contrib.auth import get_user_model
# from django_tenants.utils import schema_context
# from customers.models import PendingTenantRequest
# from django.core.validators import RegexValidator


# class TenantCreateSerializer(serializers.Serializer):
#     schema_name = serializers.CharField(
#         error_messages={
#             "required": "schema_name is required.",
#             "blank": "schema_name cannot be blank."
#         }
#     )
#     name = serializers.CharField(
#         error_messages={
#             "required": "Store name is required.",
#             "blank": "Store name cannot be blank."
#         }
#     )
#     email = serializers.EmailField(
#         error_messages={
#             "required": "Email is required.",
#             "blank": "Email cannot be blank.",
#             "invalid": "Enter a valid email address."
#         }
#     )
#     password = serializers.CharField(
#         write_only=True,
#         error_messages={
#             "required": "Password is required.",
#             "blank": "Password cannot be blank."
#         }
#     )

#     def validate_schema_name(self, value):
#         if Client.objects.filter(schema_name=value).exists():
#             raise serializers.ValidationError("schema_name is already in use.")
#         return value

#     def validate_password(self, value):
#         if len(value) < 8:
#             raise serializers.ValidationError("Password must be at least 8 characters long.")
#         return value

#     def create(self, validated_data):
#         schema_name = validated_data['schema_name']
#         name = validated_data['name']
#         email = validated_data['email']
#         password = validated_data['password']

#         # Generate domain name automatically
#         slug_store = slugify(name)
#         base_domain = settings.TENANT_BASE_DOMAIN
#         full_domain = f"{slug_store}.{base_domain}"

#         # Create tenant
#         tenant = Client.objects.create(
#             schema_name=schema_name,
#             name=name,
#             paid_until='2030-01-01',
#             on_trial=True,
#         )

#         # Create domain
#         Domain.objects.create(
#             domain=full_domain,
#             tenant=tenant,
#             is_primary=True
#         )

#         # Create superuser in tenant schema
#         with schema_context(schema_name):
#             User = get_user_model()
#             User.objects.create_superuser(
#                 email=email,
#                 username=email,
#                 password=password,
#             )

#         return tenant



# api/serializers.py

# class RegisterTenantSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, min_length=8, validators=[
#         RegexValidator(
#             regex=r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$',
#             message="Password must contain at least one uppercase, one lowercase letter, and one number."
#         )
#     ])
    
#     class Meta:
#         model = PendingTenantRequest
#         fields = ['schema_name', 'name', 'email', 'password']
    
#     def validate_schema_name(self, value):
#         if PendingTenantRequest.objects.filter(schema_name=value).exists():
#             raise serializers.ValidationError("This schema name is already in use.")
#         return value
# api/serializers.py
from rest_framework import serializers
from tenants.models import PendingTenantRequest
from django.core.validators import RegexValidator

class RegisterTenantSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, validators=[
        RegexValidator(
            regex=r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$',
            message="Password must contain at least one uppercase, one lowercase letter, and one number."
        )
    ])
    
    class Meta:
        model = PendingTenantRequest
        fields = ['schema_name', 'name', 'email', 'password']
    
    def validate_schema_name(self, value):
        if PendingTenantRequest.objects.filter(schema_name=value).exists():
            raise serializers.ValidationError(f"This failed: {value} is already in use.")
        return value
