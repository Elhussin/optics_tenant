from apps.sales.serializers.invoice_type import InvoiceTypeSerializer


from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.sales.models import Order, OrderItem, Invoice, InvoiceItem, Payment
from apps.products.models import ProductVariant


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        exclude = ['is_deleted']
        # order is set automatically in OrderSerializer.create()
        read_only_fields = ['total_price', 'order']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    # Calculated field for remaining amount
    remaining_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    # Optional field for display (ID will be used instead)
    payment_method_display = serializers.CharField(
        source='payment_method.name_ar', read_only=True
    )

    class Meta:
        model = Order
        exclude = ['is_deleted']
        read_only_fields = ['order_number', 'total_amount',
                            'subtotal', 'tax_amount', 'confirmed_at', 'delivered_at', 'insurance_details']

    insurance_details = serializers.SerializerMethodField()

    def get_insurance_details(self, obj):
        if obj.order_type == 'insurance' and obj.partner:
            return InsuranceDetailsSerializer(obj).data
        return None

    def validate_paid_amount(self, value):
        """Validate paid amount is not negative"""
        if value < 0:
            raise serializers.ValidationError(
                str(_('Paid amount cannot be negative'))
            )
        return value

    def validate_discount_amount(self, value):
        """Validate discount amount is not negative"""
        if value < 0:
            raise serializers.ValidationError(
                str(_('Discount amount cannot be negative'))
            )
        return value

    def validate_items(self, items):
        """Validate items"""
        if not items:
            raise serializers.ValidationError(
                str(_('At least one product is required for the order'))
            )

        seen = set()
        for item in items:
            variant = item.get('product_variant')
            if variant is None:
                raise serializers.ValidationError(
                    str(_('Each item must have a product'))
                )

            # Check for duplicates
            variant_id = variant.id if hasattr(variant, 'id') else variant
            if variant_id in seen:
                raise serializers.ValidationError(
                    str(_('Duplicate product in order: {id}').format(
                        id=variant_id))
                )
            seen.add(variant_id)

            # Check quantity
            quantity = item.get('quantity', 1)
            if quantity < 1:
                raise serializers.ValidationError(
                    str(_('Quantity must be at least 1'))
                )

            # Check price
            unit_price = item.get('unit_price', 0)
            if unit_price < 0:
                raise serializers.ValidationError(
                    str(_('Unit price cannot be negative'))
                )

        # Check stock (soft check)
        from apps.products.models import Stock

        # Get branch from request context
        request = self.context.get('request')
        if request and hasattr(request.user, 'branch_user'):
            branch_id = request.user.branch_user.branch_id

            for item in items:
                variant_id = item.get('product_variant').id if hasattr(
                    item.get('product_variant'), 'id') else item.get('product_variant')
                quantity = item.get('quantity', 1)

                stock = Stock.objects.filter(
                    branch_id=branch_id,
                    variant_id=variant_id
                ).first()

                if not stock:
                    raise serializers.ValidationError(
                        str(_('Product (ID: {id}) is not available in this branch stock').format(
                            id=variant_id))
                    )

                if stock.available_quantity < quantity:
                    raise serializers.ValidationError(
                        str(_('Available quantity for product (ID: {id}) is only {available}, requested {requested}').format(
                            id=variant_id,
                            available=stock.available_quantity,
                            requested=quantity
                        ))
                    )

        return items

    def validate(self, data):
        """Validate entire order"""
        items = data.get('items', [])
        discount_amount = data.get('discount_amount', 0)
        paid_amount = data.get('paid_amount', 0)
        tax_rate = data.get('tax_rate', 0.15)

        # Calculate initial subtotal
        subtotal = sum(
            item.get('quantity', 1) * item.get('unit_price', 0)
            for item in items
        )

        # Check discount does not exceed subtotal
        if discount_amount > subtotal:
            raise serializers.ValidationError({
                'discount_amount': str(_('Discount ({discount}) cannot exceed products total ({total})').format(
                    discount=discount_amount,
                    total=subtotal
                ))
            })

        # Calculate required amount
        discounted_subtotal = subtotal - discount_amount
        tax_amount = discounted_subtotal * tax_rate
        total_amount = discounted_subtotal + tax_amount

        # Check paid amount does not exceed total
        if paid_amount > total_amount:
            raise serializers.ValidationError({
                'paid_amount': str(_('Paid amount ({paid}) cannot exceed total amount ({total})').format(
                    paid=paid_amount,
                    total=f"{total_amount:.2f}"
                ))
            })

        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        order.calculate_totals()
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # Update order data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update items if provided
        if items_data is not None:
            # Delete old items
            instance.items.all().delete()
            # Create new items
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)

        instance.calculate_totals()
        return instance


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        exclude = ['is_deleted']
        # invoice is set automatically in InvoiceSerializer.create()
        read_only_fields = ['total_price', 'invoice']


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)

    invoice_type_details = InvoiceTypeSerializer(
        source='invoice_type', read_only=True)

    # Dynamically inject insurance details
    insurance_details = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        exclude = ['is_deleted']
        read_only_fields = [
            'invoice_number', 'total_amount', 'subtotal', 'tax_amount',
            'created_by', 'status', 'total_amount_base', 'total_amount_foreign',
            'pricing_policy_snapshot', 'tax_snapshot', 'confirmed_at',
            'insurance_details'
        ]

    def get_insurance_details(self, obj):
        if obj.order and obj.order.order_type == 'insurance' and obj.order.partner:
            # Use the order's partner/link for details
            return InsuranceDetailsSerializer(obj.order).data
        return None

    def validate_items(self, items):
        seen = set()
        for item in items:
            variant_id = item.get('product_variant')
            if variant_id in seen:
                raise serializers.ValidationError(
                    str(_('Duplicate variant in invoice: {id}').format(id=variant_id)))
            seen.add(variant_id)
        return items

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        invoice.calculate_totals()
        return invoice


class InsuranceDetailsSerializer(serializers.Serializer):
    """
    Serializer for insurance details to be embedded in Order/Invoice
    """
    policy_number = serializers.CharField(
        source='customer_partner_link.policy_number', read_only=True)
    member_id = serializers.CharField(
        source='customer_partner_link.member_id', read_only=True)
    provider_name = serializers.CharField(
        source='partner.name', read_only=True)
    provider_name_en = serializers.CharField(
        source='partner.name_en', read_only=True)
    copay_percentage = serializers.DecimalField(
        source='customer_partner_link.patient_share_percentage', max_digits=5, decimal_places=2, read_only=True)
    coverage_limit = serializers.DecimalField(
        source='customer_partner_link.annual_limit', max_digits=12, decimal_places=2, read_only=True)
    remaining_limit = serializers.DecimalField(
        source='customer_partner_link.remaining_limit', max_digits=12, decimal_places=2, read_only=True)


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        exclude = ['is_deleted']
        read_only_fields = ['id']
