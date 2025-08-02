
from rest_framework import serializers
from tenants.models import Client, PendingTenantRequest, Payment,Domain,SubscriptionPlan
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from core.utils.ReusableFields import ReusableFields
from core.utils.check_unique_field import check_unique_field
from core.utils.expiration_date import expiration_date
from core.constants.tenants import PAYMENT_METHODS,PAYMENT_PERIODS



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
        email = validated_data['email']
        password = validated_data['password']

        # Generate unique schema_name
        schema_base = slugify(name)
        schema_name = schema_base
        i = 1
        while Client.objects.filter(schema_name=schema_name).exists() or \
              PendingTenantRequest.objects.filter(schema_name=schema_name).exists():
            schema_name = f"{schema_base}{i}"
            i += 1

        # Apply trial limits
        trial_plan = SubscriptionPlan.objects.filter(name__iexact="trial").first()
        expires_at =expiration_date(days=trial_plan.duration_days)

        return PendingTenantRequest.objects.create(
            schema_name=schema_name,
            name=name,
            email=email,
            password=password,
            plan=trial_plan,
            expires_at=expires_at
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


class PaymentSerializer(serializers.Serializer):
    client_id = serializers.UUIDField()
    plan = serializers.PrimaryKeyRelatedField(queryset=SubscriptionPlan.objects.filter(is_active=True))

    transaction_id = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(default="USD")

    def validate(self, data):
        # Check client
        try:
            client = Client.objects.get(uuid=data["client_id"])
        except Client.DoesNotExist:
            raise serializers.ValidationError({"client_id": _("Client not found")})

        # Prevent duplicate transaction_id
        if Payment.objects.filter(transaction_id=data["transaction_id"]).exists():
            raise serializers.ValidationError({"transaction_id": _("Transaction already exists")})

        data["client"] = client
        return data

    def create(self, validated_data):
        client = validated_data["client"]
        plan = validated_data["plan"]

        # Create payment
        payment = Payment.objects.create(
            client=client,
            amount=validated_data["amount"],
            currency=validated_data["currency"],
            method=validated_data["method"],
            transaction_id=validated_data["transaction_id"],
            plan=plan,
            status="success"
        )

        # Apply plan to client
        payment.apply_to_client()

        return payment


class CreatePaymentOrderSerializer(serializers.Serializer):
    client_id = serializers.UUIDField()
    plan = serializers.PrimaryKeyRelatedField(queryset=SubscriptionPlan.objects.filter(is_active=True))
    period = serializers.ChoiceField(choices=PAYMENT_PERIODS)
    method = serializers.ChoiceField(choices=PAYMENT_METHODS)

    def validate(self, data):
        try:
            client = Client.objects.get(uuid=data["client_id"])
        except Client.DoesNotExist:
            raise serializers.ValidationError({"client_id": _("Client not found")})

        data["client"] = client
        return data


