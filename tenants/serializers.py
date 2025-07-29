# tenants/serializers.py
from rest_framework import serializers
from tenants.models import Client
from tenants.models import PendingTenantRequest,PLAN_CHOICES, PLAN_LIMITS
from django.utils.translation import gettext_lazy as _ # for translation
from django.utils.text import slugify
from core.utils.ReusableFields import ReusableFields
from core.utils.check_unique_field import check_unique_field


# class RegisterTenantSerializer(serializers.ModelSerializer):
#     email = ReusableFields.email()
#     password = ReusableFields.password()
#     name = ReusableFields.name()
#     max_users = serializers.IntegerField()
#     plan = serializers.CharField()

#     class Meta:
#         model = PendingTenantRequest
#         fields = ['name', 'email', 'password','plan']  

#     def validate_email(self, value):
#         return check_unique_field(PendingTenantRequest, 'email', value, self.instance)
    
#     def validate_name(self, value):
#         return check_unique_field(PendingTenantRequest, 'name', value, self.instance)

              

#     def create(self, validated_data):
#         name = validated_data['name']
#         schema_base = slugify(name)

#         # generate unique schema_name
#         schema_name = schema_base
#         i = 1
#         while Client.objects.filter(schema_name=schema_name).exists() or \
#               PendingTenantRequest.objects.filter(schema_name=schema_name).exists():
#             schema_name = f"{schema_base}{i}"
#             i += 1
            

#         return PendingTenantRequest.objects.create(
#             name=name,
#             email=validated_data['email'],
#             password=validated_data['password'],
#             schema_name=schema_name,
#             plan=validated_data['plan']
#         )


class RegisterTenantSerializer(serializers.ModelSerializer):
    email = ReusableFields.email()
    password = ReusableFields.password()
    name = ReusableFields.name()
    plan = serializers.ChoiceField(choices=PLAN_CHOICES)

    class Meta:
        model = PendingTenantRequest
        fields = ['name', 'email', 'password', 'plan']  # لا نطلب max_users أو max_branches من العميل

    def validate_email(self, value):
        return check_unique_field(PendingTenantRequest, 'email', value, self.instance)
    
    def validate_name(self, value):
        return check_unique_field(PendingTenantRequest, 'name', value, self.instance)

    def create(self, validated_data):
        name = validated_data['name']
        plan = validated_data['plan']
        schema_base = slugify(name)

        # تحديد القيم بناءً على الخطة
        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['trial'])
        max_users = limits['max_users']
        max_branches = limits['max_branches']

        # توليد اسم schema فريد
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
            schema_name=schema_name,
            plan=plan,
            max_users=max_users,
            max_branches=max_branches
        )