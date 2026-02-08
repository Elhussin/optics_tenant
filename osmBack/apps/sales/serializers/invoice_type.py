from rest_framework import serializers
from apps.sales.models import InvoiceType
from apps.products.serializers.pricing_policy import PricingPolicySerializer
from apps.products.models import PricingPolicy
from apps.accounting.serializers import ChartOfAccountsSerializer
from apps.accounting.models import ChartOfAccounts


class InvoiceTypeSerializer(serializers.ModelSerializer):
    pricing_policy = PricingPolicySerializer(read_only=True)
    pricing_policy_id = serializers.PrimaryKeyRelatedField(
        queryset=PricingPolicy.objects.all(),
        source='pricing_policy',
        write_only=True
    )
    revenue_account = ChartOfAccountsSerializer(read_only=True)
    revenue_account_id = serializers.PrimaryKeyRelatedField(
        queryset=ChartOfAccounts.objects.all(),
        source='revenue_account',
        write_only=True
    )

    class Meta:
        model = InvoiceType
        fields = [
            'id', 'name', 'code',
            'pricing_policy', 'pricing_policy_id',
            'revenue_account', 'revenue_account_id',
            'is_active'
        ]
