from rest_framework import serializers
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from apps.products.models import Stock, StockMovement, StockTransfer, StockTransferItem
from apps.branches.models import Branch


class StockSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    branch_code = serializers.CharField(
        source='branch.branch_code', read_only=True)
    branch_type = serializers.CharField(
        source='branch.branch_type', read_only=True)
    variant_sku = serializers.CharField(source='variant.sku', read_only=True)
    variant_name = serializers.SerializerMethodField()
    product_name = serializers.CharField(
        source='variant.product.name', read_only=True)
    stock_status = serializers.CharField(read_only=True)
    available_quantity = serializers.IntegerField(read_only=True)

    class Meta:
        model = Stock
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at',
                            'updated_at', 'last_restocked', 'last_sale']

    def get_variant_name(self, obj):
        return str(obj.variant)

    def validate_branch(self, value):
        """Ensure branch is of type STORE only when adding stock"""
        if value.branch_type != 'store':
            raise serializers.ValidationError(
                _("Stock can only be added to branches of type 'Store'. Branch '{name}' is of type '{type}'.").format(
                    name=value.name,
                    type=value.get_branch_type_display()
                )
            )
        return value


class StockMovementSerializer(serializers.ModelSerializer):
    stock_info = serializers.SerializerMethodField(read_only=True)
    movement_type_display = serializers.CharField(
        source='get_movement_type_display', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True)

    class Meta:
        model = StockMovement
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at',
                            'quantity_before', 'quantity_after', 'movement_date']

    def get_stock_info(self, obj):
        return {
            'branch_name': obj.stock.branch.name,
            'variant_name': str(obj.stock.variant),
            'product_name': obj.stock.variant.product.name,
        }

    def validate(self, data):
        """Validate data"""
        movement_type = data.get('movement_type')
        cost_per_unit = data.get('cost_per_unit', 0)

        # Force input of purchase price when purchasing/restocking
        if movement_type == 'purchase' and (cost_per_unit is None or cost_per_unit <= 0):
            raise serializers.ValidationError({
                'cost_per_unit': _("Purchase price (greater than zero) must be entered when adding new stock")
            })

        # Check available quantity when withdrawing
        if movement_type in ['sale', 'transfer_out', 'damage']:
            stock = data.get('stock')
            quantity = abs(data.get('quantity', 0))
            if stock and stock.available_quantity < quantity:
                raise serializers.ValidationError({
                    'quantity': _("Requested quantity ({quantity}) exceeds available quantity ({available})").format(
                        quantity=quantity,
                        available=stock.available_quantity
                    )
                })

        return data


class StockMovementCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating stock movements with auto-calculation of before/after"""

    class Meta:
        model = StockMovement
        fields = ['stock', 'movement_type', 'quantity',
                  'cost_per_unit', 'reference_number', 'notes']

    def validate(self, data):
        """Validate and calculate quantities"""
        movement_type = data.get('movement_type')
        cost_per_unit = data.get('cost_per_unit', 0)
        stock = data.get('stock')
        quantity = data.get('quantity', 0)

        # Ensure quantity is not zero
        if quantity == 0:
            raise serializers.ValidationError({
                'quantity': _("Quantity must be greater than zero.")
            })

        # Check branch type for purchase
        if movement_type == 'purchase':
            if stock.branch.branch_type != 'store':
                raise serializers.ValidationError({
                    'stock': _("Stock can only be added to branches of type 'Store'")
                })
            if cost_per_unit is None or cost_per_unit <= 0:
                raise serializers.ValidationError({
                    'cost_per_unit': _("Purchase price (greater than zero) must be entered")
                })

        # Check available quantity when withdrawing
        if movement_type in ['sale', 'transfer_out', 'damage']:
            if stock.available_quantity < abs(quantity):
                raise serializers.ValidationError({
                    'quantity': _("Requested quantity exceeds available quantity ({available})").format(available=stock.available_quantity)
                })

        return data

    def create(self, validated_data):
        stock = validated_data['stock']
        movement_type = validated_data['movement_type']
        quantity = validated_data['quantity']

        # Calculate quantities before and after
        quantity_before = stock.quantity_in_stock

        # Determine actual quantity (positive or negative)
        # adjustment can be positive (add) or negative (subtract)
        if movement_type == 'adjustment':
            # For adjustment: use value as is (positive for addition, negative for subtraction)
            actual_quantity = quantity
            quantity_after = quantity_before + actual_quantity
        elif movement_type in ['purchase', 'transfer_in', 'return']:
            actual_quantity = abs(quantity)
            quantity_after = quantity_before + actual_quantity
        else:  # sale, transfer_out, damage, reserve
            actual_quantity = -abs(quantity)
            quantity_after = quantity_before + actual_quantity

        validated_data['quantity'] = actual_quantity
        validated_data['quantity_before'] = quantity_before
        validated_data['quantity_after'] = max(0, quantity_after)

        # Add user who created the movement
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user

        with transaction.atomic():
            # Update average cost for purchase (BEFORE updating quantity)
            if movement_type == 'purchase' and validated_data.get('cost_per_unit', 0) > 0:
                stock.update_average_cost(
                    abs(quantity), validated_data['cost_per_unit'])
                from django.utils import timezone
                stock.last_restocked = timezone.now()

            # Update stock quantity
            stock.quantity_in_stock = max(0, quantity_after)
            stock.save()

            return super().create(validated_data)


class StockTransferItemSerializer(serializers.ModelSerializer):
    variant_name = serializers.SerializerMethodField(read_only=True)
    variant_sku = serializers.CharField(source='variant.sku', read_only=True)
    product_name = serializers.CharField(
        source='variant.product.name', read_only=True)

    class Meta:
        model = StockTransferItem
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at',
                            'updated_at', 'quantity_sent', 'quantity_received']

    def get_variant_name(self, obj):
        return str(obj.variant)


class StockTransferSerializer(serializers.ModelSerializer):
    from_branch_name = serializers.CharField(
        source='from_branch.name', read_only=True)
    from_branch_code = serializers.CharField(
        source='from_branch.branch_code', read_only=True)
    to_branch_name = serializers.CharField(
        source='to_branch.name', read_only=True)
    to_branch_code = serializers.CharField(
        source='to_branch.branch_code', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    items = StockTransferItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StockTransfer
        exclude = ['is_deleted']
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'transfer_number',
            'approved_date', 'shipped_date', 'received_date'
        ]

    def get_items_count(self, obj):
        return obj.items.count()

    def validate(self, data):
        from_branch = data.get('from_branch')
        to_branch = data.get('to_branch')

        if from_branch and to_branch and from_branch == to_branch:
            raise serializers.ValidationError({
                'to_branch': _("Cannot transfer to the same branch")
            })

        return data


class StockTransferCreateSerializer(serializers.Serializer):
    """Serializer for creating a transfer with items in one request"""
    from_branch = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all())
    to_branch = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all())
    notes = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        help_text=_(
            "List of items: [{'variant': id, 'quantity_requested': int, 'unit_cost': decimal}]")
    )

    def validate(self, data):
        from_branch = data.get('from_branch')
        to_branch = data.get('to_branch')

        if from_branch == to_branch:
            raise serializers.ValidationError({
                'to_branch': _("Cannot transfer to the same branch")
            })

        # Check availability
        items = data.get('items', [])
        for item in items:
            variant_id = item.get('variant')
            quantity = item.get('quantity_requested', 0)

            if quantity <= 0:
                raise serializers.ValidationError({
                    'items': _("Quantity requested must be greater than zero.")
                })

            try:
                stock = Stock.objects.get(
                    branch=from_branch, variant_id=variant_id)
                if stock.available_quantity < quantity:
                    raise serializers.ValidationError({
                        'items': _("Requested quantity for product {variant_id} is not available. Available: {available}").format(variant_id=variant_id, available=stock.available_quantity)
                    })
            except Stock.DoesNotExist:
                raise serializers.ValidationError({
                    'items': _("Product {variant_id} does not exist in the source branch stock").format(variant_id=variant_id)
                })

        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items')

        with transaction.atomic():
            transfer = StockTransfer.objects.create(
                from_branch=validated_data['from_branch'],
                to_branch=validated_data['to_branch'],
                notes=validated_data.get('notes', ''),
                requested_by=self.context['request'].user.get_full_name(
                ) or self.context['request'].user.username
            )

            for item_data in items_data:
                StockTransferItem.objects.create(
                    transfer=transfer,
                    variant_id=item_data['variant'],
                    quantity_requested=item_data['quantity_requested'],
                    unit_cost=item_data.get('unit_cost', 0)
                )

            return transfer
