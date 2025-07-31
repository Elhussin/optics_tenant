
from rest_framework import serializers
from tenants.models import Client, PendingTenantRequest, Payment,Domain,SubscriptionPlan, PLAN_CHOICES, PLAN_LIMITS
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from core.utils.ReusableFields import ReusableFields
from core.utils.check_unique_field import check_unique_field
from django.utils import timezone
from datetime import timedelta


class RegisterTenantSerializer(serializers.ModelSerializer):
    email = ReusableFields.email()
    password = ReusableFields.password()
    name = ReusableFields.name()
    requested_plan = serializers.ChoiceField(choices=PLAN_CHOICES)

    class Meta:
        model = PendingTenantRequest
        fields = ['name', 'email', 'password', 'requested_plan']

    def validate_email(self, value):
        return check_unique_field(PendingTenantRequest, 'email', value, self.instance)
    
    def validate_name(self, value):
        return check_unique_field(PendingTenantRequest, 'name', value, self.instance)

    def create(self, validated_data):
        from django.utils.text import slugify
        from django.utils import timezone
        from datetime import timedelta

        name = validated_data['name']
        email = validated_data['email']
        password = validated_data['password']
        requested_plan = validated_data['requested_plan']

        # تحديد schema_name فريد
        schema_base = slugify(name)
        schema_name = schema_base
        i = 1
        while Client.objects.filter(schema_name=schema_name).exists() or \
              PendingTenantRequest.objects.filter(schema_name=schema_name).exists():
            schema_name = f"{schema_base}{i}"
            i += 1

        # تطبيق حدود trial
        trial_limits = PLAN_LIMITS['trial']
        expires_at = timezone.now() + timedelta(days=trial_limits['duration_days'])

        return PendingTenantRequest.objects.create(
            schema_name=schema_name,
            name=name,
            email=email,
            password=password,
            plan='trial',
            requested_plan=requested_plan,
            max_users=trial_limits['max_users'],
            max_branches=trial_limits['max_branches'],
            max_products=trial_limits['max_products'],
            expires_at=expires_at
        )


def create_payment_request(client, requested_plan):
    # ممكن هنا تعمل Payment Intent مع Stripe أو تسجل في جدول Payment كطلب غير مكتمل
    Payment.objects.create(
        client=client,
        amount=PLAN_LIMITS[requested_plan]['price_month'],
        plan=requested_plan,
        start_date=timezone.now().date(),
        end_date=timezone.now().date() + timedelta(days=PLAN_LIMITS[requested_plan]['duration_days']),
        method='pending'
    )


class ClientSerializer(serializers.ModelSerializer):
    is_paid = serializers.ReadOnlyField()
    is_plan_expired = serializers.ReadOnlyField()

    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['uuid', 'created_at', 'auto_create_schema']


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = '__all__'


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

# class PaymentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Payment
#         fields = '__all__'
#         read_only_fields = ['created_at']

class PayPalPaymentSerializer(serializers.Serializer):
    client_id = serializers.UUIDField()
    plan = serializers.ChoiceField(choices=[(p, p.title()) for p in PLAN_LIMITS.keys()])
    transaction_id = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(default="USD")

    def validate(self, data):
        # التحقق من أن العميل موجود
        try:
            client = Client.objects.get(uuid=data["client_id"])
        except Client.DoesNotExist:
            raise serializers.ValidationError({"client_id": "Client not found"})

        data["client"] = client
        return data

    def create(self, validated_data):
        client = validated_data["client"]
        plan = validated_data["plan"]

        # جلب تفاصيل الخطة
        plan_limits = PLAN_LIMITS[plan]
        duration_days = plan_limits['duration_days']

        start_date = timezone.now().date()
        end_date = start_date + timedelta(days=duration_days)

        # إنشاء سجل الدفع
        payment = Payment.objects.create(
            client=client,
            amount=validated_data["amount"],
            currency=validated_data["currency"],
            method="paypal",
            transaction_id=validated_data["transaction_id"],
            plan=plan,
            start_date=start_date,
            end_date=end_date
        )

        # تحديث بيانات العميل
        client.plan = plan
        client.paid_until = end_date
        client.max_users = plan_limits['max_users']
        client.max_branches = plan_limits['max_branches']
        client.max_products = plan_limits['max_products']
        client.on_trial = False
        client.is_active = True
        client.save()

        return payment


class CreatePayPalOrderSerializer(serializers.Serializer):
    client_id = serializers.UUIDField()
    plan = serializers.ChoiceField(choices=[(p, p.title()) for p in PLAN_LIMITS.keys()])
    period = serializers.ChoiceField(choices=[("month", _("Monthly")), ("year", _("Yearly"))])

    def validate(self, data):
        try:
            client = Client.objects.get(uuid=data["client_id"])
        except Client.DoesNotExist:
            raise serializers.ValidationError({"client_id": _("Client not found")})

        data["client"] = client
        return data