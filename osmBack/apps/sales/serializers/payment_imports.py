from apps.sales.serializers.payment_allocation import PaymentAllocationSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """Payment Serializer"""
    allocations = PaymentAllocationSerializer(many=True, read_only=True)
