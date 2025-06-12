# serializers.py
class StockMovementItemSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    movement_type = serializers.ChoiceField(choices=StockMovements.MOVEMENT_TYPES)
    quantity = serializers.IntegerField()
    notes = serializers.CharField(allow_blank=True, required=False)

    def validate(self, data):
        if data['movement_type'] in ['sale', 'transfer_out', 'damage']:
            if data['quantity'] >= 0:
                raise serializers.ValidationError("Quantity must be negative for outgoing movements.")
        elif data['movement_type'] in ['purchase', 'transfer_in', 'adjustment']:
            if data['quantity'] <= 0:
                raise serializers.ValidationError("Quantity must be positive for incoming movements.")
        return data


class BulkStockMovementSerializer(serializers.Serializer):
    movements = StockMovementItemSerializer(many=True)
