from rest_framework import serializers
from apps.sales.models import PaymentAllocation


class PaymentAllocationSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(
        source='invoice.invoice_number', read_only=True)

    class Meta:
        model = PaymentAllocation
        fields = ['id', 'invoice', 'invoice_number', 'invoice_item', 'amount']
