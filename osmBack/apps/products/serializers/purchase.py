"""Purchase Order Serializers"""
from rest_framework import serializers
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from apps.products.models import PurchaseOrder, PurchaseOrderItem, ProductVariant
from apps.branches.models import Branch


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    """Serializer for reading purchase order items"""
    variant_name = serializers.SerializerMethodField(read_only=True)
    variant_sku = serializers.CharField(source='variant.sku', read_only=True)
    product_name = serializers.CharField(
        source='variant.product.name', read_only=True)
    line_total = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True)
    remaining_quantity = serializers.IntegerField(read_only=True)
    is_fully_received = serializers.BooleanField(read_only=True)

    class Meta:
        model = PurchaseOrderItem
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at',
                            'updated_at', 'quantity_received']

    def get_variant_name(self, obj):
        return str(obj.variant)


class PurchaseOrderSerializer(serializers.ModelSerializer):
    """Serializer for reading purchase orders"""
    supplier_name = serializers.CharField(
        source='supplier.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    approved_by_name = serializers.SerializerMethodField(read_only=True)
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PurchaseOrder
        exclude = ['is_deleted']
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'order_number',
            'approved_date', 'received_date', 'subtotal', 'total_amount'
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.username
        return None

    def get_items_count(self, obj):
        return obj.items.count()


class PurchaseOrderItemCreateSerializer(serializers.Serializer):
    """Serializer for creating purchase order items"""
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all())
    quantity_ordered = serializers.IntegerField(min_value=1)
    unit_cost = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=0)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class PurchaseOrderCreateSerializer(serializers.Serializer):
    """Serializer for creating a purchase order with items in one request"""
    from apps.products.models import Supplier

    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        help_text=_("Supplier ID")
    )
    branch = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.filter(branch_type='store'),
        help_text=_("Receiving branch (must be a store)")
    )
    order_date = serializers.DateField(required=False)
    expected_date = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    items = PurchaseOrderItemCreateSerializer(many=True, min_length=1)

    def validate_items(self, items):
        """Validate items list"""
        if not items:
            raise serializers.ValidationError(
                _("At least one item is required"))

        # Check for duplicate variants
        variant_ids = [item['variant'].id for item in items]
        if len(variant_ids) != len(set(variant_ids)):
            raise serializers.ValidationError(
                _("Duplicate variants are not allowed"))

        return items

    def create(self, validated_data):
        items_data = validated_data.pop('items')

        with transaction.atomic():
            # Create order
            order = PurchaseOrder.objects.create(
                supplier=validated_data['supplier'],
                branch=validated_data['branch'],
                order_date=validated_data.get('order_date'),
                expected_date=validated_data.get('expected_date'),
                notes=validated_data.get('notes', ''),
                created_by=self.context['request'].user if 'request' in self.context else None
            )

            # Create items
            for item_data in items_data:
                PurchaseOrderItem.objects.create(
                    order=order,
                    variant=item_data['variant'],
                    quantity_ordered=item_data['quantity_ordered'],
                    unit_cost=item_data['unit_cost'],
                    notes=item_data.get('notes', '')
                )

            # Calculate totals
            from apps.products.services.purchase_service import calculate_purchase_order_totals
            calculate_purchase_order_totals(order)

            return order


class ReceiveItemsSerializer(serializers.Serializer):
    """Serializer for receiving items"""
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        help_text=_("List of items: [{'item_id': int, 'quantity': int}]")
    )

    def validate_items(self, items):
        """Validate received items"""
        for item in items:
            if 'item_id' not in item:
                raise serializers.ValidationError(
                    _("Each item must have 'item_id'"))
            if 'quantity' not in item:
                raise serializers.ValidationError(
                    _("Each item must have 'quantity'"))
            if not isinstance(item['quantity'], int) or item['quantity'] < 0:
                raise serializers.ValidationError(
                    _("Quantity must be a non-negative integer"))
        return items
