# tenants/serializers.py
from rest_framework import serializers
from tenants.models import Client
from tenants.models import PendingTenantRequest
from django.utils.translation import gettext_lazy as _ # for translation
from django.utils.text import slugify
from core.utils.ReusableFields import ReusableFields
from core.utils.check_unique_field import check_unique_field

class RegisterTenantSerializer(serializers.ModelSerializer):
    email = ReusableFields.email()
    password = ReusableFields.password()
    name = ReusableFields.name()

    class Meta:
        model = PendingTenantRequest
        fields = ['name', 'email', 'password']  

    def validate_email(self, value):
        return check_unique_field(PendingTenantRequest, 'email', value, self.instance)
    
    def validate_name(self, value):
        return check_unique_field(PendingTenantRequest, 'name', value, self.instance)


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
