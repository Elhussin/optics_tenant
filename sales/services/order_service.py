# services/order_service.py

from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from products.models import StockMovements, Stocks


def confirm_order(order, user):
    if order.status != 'pending':
        raise ValidationError("Only pending orders can be confirmed")
    
    with transaction.atomic():
        for item in order.items.select_related('variant'):
            stock = Stocks.objects.select_for_update().filter(
                branch=order.branch,
                variant=item.variant
            ).first()
            if not stock or stock.available_quantity < item.quantity:
                raise ValidationError(f"Insufficient stock for {item.variant}")
            
            # سجل حركة الحجز
            StockMovements.objects.create(
                stocks=stock,
                movement_type='reserve',
                quantity=item.quantity,
                quantity_before=stock.quantity_in_stock,
                quantity_after=stock.quantity_in_stock - item.quantity,
                reference_number=order.order_number,
                notes=f"Reserved for order {order.order_number}",
            )
            stock.reserved_quantity += item.quantity
            stock.save()

        order.status = 'confirmed'
        order.confirmed_at = timezone.now()
        order.save()
