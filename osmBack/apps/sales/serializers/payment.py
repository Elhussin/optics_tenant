# apps/sales/serializers/payment.py
"""
Payment Serializers
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.sales.models import Payment, Installment


from apps.sales.serializers.payment_allocation import PaymentAllocationSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """Payment Serializer"""
    payment_method_display = serializers.CharField(
        source='payment_method.name_ar', read_only=True
    )
    payment_method_name_en = serializers.CharField(
        source='payment_method.name_en', read_only=True
    )
    payment_method_code = serializers.CharField(
        source='payment_method.code', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    invoice_number = serializers.CharField(
        source='invoice.invoice_number', read_only=True
    )
    order_number = serializers.CharField(
        source='order.order_number', read_only=True
    )
    partner_name = serializers.CharField(
        source='partner.name', read_only=True
    )
    allocations = PaymentAllocationSerializer(many=True, read_only=True)
    installments = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'invoice_number', 'order', 'order_number',
            'amount', 'amount_base', 'amount_foreign', 'currency', 'exchange_rate',
            'payment_method', 'payment_method_display', 'payment_method_name_en', 'payment_method_code',
            'status', 'status_display',
            'payer_content_type', 'payer_object_id', 'partner', 'partner_name',
            'gateway_transaction_id', 'gateway_reference',
            'is_installment', 'installments_count', 'installment_amount', 'bnpl_order_id',
            'card_last_four', 'card_brand',
            'cheque_number', 'cheque_bank', 'cheque_date',
            'transfer_reference', 'transfer_bank',
            'paid_at', 'refunded_at', 'refund_amount',
            'notes', 'installments', 'allocations',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'gateway_transaction_id', 'paid_at', 'refunded_at',
            'created_at', 'updated_at', 'allocations', 'created_by'
        ]

    def get_installments(self, obj):
        if obj.is_installment:
            return InstallmentSerializer(obj.installments.all(), many=True).data
        return []


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Payment Creation Serializer"""

    class Meta:
        model = Payment
        fields = [
            'invoice', 'order', 'amount', 'currency', 'payment_method',
            'partner', 'is_installment', 'installments_count',
            'card_last_four', 'card_brand',
            'cheque_number', 'cheque_bank', 'cheque_date',
            'transfer_reference', 'transfer_bank',
            'notes',
        ]

    def validate(self, data):
        # Check for invoice or order
        if not data.get('invoice') and not data.get('order'):
            raise serializers.ValidationError(
                str(_('Invoice or order must be specified'))
            )

        # Check if payment method is installment
        payment_method = data.get('payment_method')
        if payment_method and payment_method.is_installment:
            data['is_installment'] = True
            if not data.get('installments_count'):
                data['installments_count'] = 4  # Default for BNPL

        return data

    def create(self, validated_data):
        payment = Payment.objects.create(**validated_data)

        # Create installments if BNPL
        if payment.is_installment and payment.installments_count > 1:
            self._create_installments(payment)

        return payment

    def _create_installments(self, payment):
        """Create installment records"""
        from datetime import timedelta
        from django.utils import timezone

        installment_amount = payment.amount / payment.installments_count
        today = timezone.now().date()

        for i in range(payment.installments_count):
            # First installment today, then every month
            due_date = today if i == 0 else today + timedelta(days=30 * i)

            Installment.objects.create(
                payment=payment,
                installment_number=i + 1,
                amount=installment_amount,
                due_date=due_date,
                status='due' if i == 0 else 'pending',
            )


class PaymentListSerializer(serializers.ModelSerializer):
    """Brief Payment List Serializer"""
    payment_method_display = serializers.CharField(
        source='payment_method.name_ar', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )

    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'currency', 'payment_method', 'payment_method_display',
            'status', 'status_display', 'is_installment', 'paid_at', 'created_at',
        ]


class InstallmentSerializer(serializers.ModelSerializer):
    """Installment Serializer"""
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )

    class Meta:
        model = Installment
        fields = [
            'id', 'payment', 'installment_number', 'amount',
            'due_date', 'status', 'status_display',
            'paid_at', 'paid_amount',
        ]
        read_only_fields = ['id', 'payment', 'installment_number', 'amount']


class BNPLSessionRequestSerializer(serializers.Serializer):
    """BNPL Session Request Serializer"""
    order_id = serializers.IntegerField()
    gateway = serializers.ChoiceField(choices=['tabby', 'tamara'])
    installments_count = serializers.IntegerField(
        min_value=2, max_value=12, default=4)
    success_url = serializers.URLField()
    cancel_url = serializers.URLField()
    failure_url = serializers.URLField()
    webhook_url = serializers.URLField(required=False)


class BNPLSessionResponseSerializer(serializers.Serializer):
    """BNPL Session Response Serializer"""
    success = serializers.BooleanField()
    checkout_url = serializers.URLField()
    session_id = serializers.CharField()
    payment_id = serializers.IntegerField()
    gateway = serializers.CharField()
    installments = serializers.ListField(required=False)


class PaymentRefundSerializer(serializers.Serializer):
    """Payment Refund Serializer"""
    amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False
    )
    reason = serializers.CharField(max_length=500, required=False)
