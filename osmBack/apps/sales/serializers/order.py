

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.sales.models import Order, OrderItem, Invoice, InvoiceItem, Payment
from apps.products.models import ProductVariant


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        exclude = ['is_deleted']
        # order يتم تعيينه تلقائياً في OrderSerializer.create()
        read_only_fields = ['total_price', 'order']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    # حقل محسوب للمبلغ المتبقي
    remaining_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    # حقل اختياري للبدء (سيتم استخدام الـ ID بدلاً منه)
    payment_method_display = serializers.CharField(
        source='payment_method.name_ar', read_only=True
    )

    class Meta:
        model = Order
        exclude = ['is_deleted']
        read_only_fields = ['order_number', 'total_amount',
                            'subtotal', 'tax_amount', 'confirmed_at', 'delivered_at']

    def validate_paid_amount(self, value):
        """التحقق من أن المبلغ المدفوع ليس سلبياً"""
        if value < 0:
            raise serializers.ValidationError(
                str(_('Paid amount cannot be negative'))
            )
        return value

    def validate_discount_amount(self, value):
        """التحقق من أن الخصم ليس سلبياً"""
        if value < 0:
            raise serializers.ValidationError(
                str(_('Discount amount cannot be negative'))
            )
        return value

    def validate_items(self, items):
        """التحقق من العناصر"""
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

            # التحقق من التكرار
            variant_id = variant.id if hasattr(variant, 'id') else variant
            if variant_id in seen:
                raise serializers.ValidationError(
                    str(_('Duplicate product in order: {id}').format(
                        id=variant_id))
                )
            seen.add(variant_id)

            # التحقق من الكمية
            quantity = item.get('quantity', 1)
            if quantity < 1:
                raise serializers.ValidationError(
                    str(_('Quantity must be at least 1'))
                )

            # التحقق من السعر
            unit_price = item.get('unit_price', 0)
            if unit_price < 0:
                raise serializers.ValidationError(
                    str(_('Unit price cannot be negative'))
                )

        # التحقق من المخزون (soft check)
        from apps.products.models import Stock

        # الحصول على الفرع من الـ request context
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
        """التحقق على مستوى الطلب كاملاً"""
        items = data.get('items', [])
        discount_amount = data.get('discount_amount', 0)
        paid_amount = data.get('paid_amount', 0)
        tax_rate = data.get('tax_rate', 0.15)

        # حساب الإجمالي المبدئي
        subtotal = sum(
            item.get('quantity', 1) * item.get('unit_price', 0)
            for item in items
        )

        # التحقق من أن الخصم لا يتجاوز الإجمالي
        if discount_amount > subtotal:
            raise serializers.ValidationError({
                'discount_amount': str(_('Discount ({discount}) cannot exceed products total ({total})').format(
                    discount=discount_amount,
                    total=subtotal
                ))
            })

        # حساب المبلغ المطلوب
        discounted_subtotal = subtotal - discount_amount
        tax_amount = discounted_subtotal * tax_rate
        total_amount = discounted_subtotal + tax_amount

        # التحقق من أن المبلغ المدفوع لا يتجاوز المطلوب
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

        # تحديث بيانات الطلب
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # تحديث العناصر إذا تم إرسالها
        if items_data is not None:
            # حذف العناصر القديمة
            instance.items.all().delete()
            # إنشاء العناصر الجديدة
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)

        instance.calculate_totals()
        return instance


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        exclude = ['is_deleted']
        # invoice يتم تعيينه تلقائياً في InvoiceSerializer.create()
        read_only_fields = ['total_price', 'invoice']


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        exclude = ['is_deleted']
        read_only_fields = [
            'invoice_number', 'total_amount', 'subtotal', 'tax_amount',
            'created_by', 'status'
        ]

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


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        exclude = ['is_deleted']
        read_only_fields = ['id']
