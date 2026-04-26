from django.db import transaction
from django.db.models import F
from django.utils import timezone
from apps.products.models.inventory import Stock, StockMovement

def reserve_stock(stock, quantity):
    if stock.allow_backorder:
        stock.reserved_quantity = F('reserved_quantity') + quantity
        stock.save(update_fields=['reserved_quantity'])
        stock.refresh_from_db()  # Get the new value
        return True

    # Atomic update for non-backorder items
    # We try to update ONLY if we have enough available quantity
    # Condition: quantity_in_stock - reserved_quantity >= quantity
    # Rearranged: quantity_in_stock >= reserved_quantity + quantity
    updated = Stock.objects.filter(
        id=stock.id,
        quantity_in_stock__gte=F('reserved_quantity') + quantity
    ).update(reserved_quantity=F('reserved_quantity') + quantity)

    if updated > 0:
        stock.refresh_from_db()
        return True

    return False

def release_reserved_stock(stock, quantity):
    stock.reserved_quantity = max(0, stock.reserved_quantity - quantity)
    stock.save(update_fields=['reserved_quantity'])

def update_stock_average_cost(stock, new_quantity, new_cost):
    """Update average cost"""
    if stock.quantity_in_stock > 0:
        total_cost = (stock.quantity_in_stock * stock.average_cost) + (new_quantity * new_cost)
        total_quantity = stock.quantity_in_stock + new_quantity
        stock.average_cost = total_cost / total_quantity if total_quantity > 0 else new_cost
    else:
        stock.average_cost = new_cost
    stock.last_cost = new_cost

def execute_transfer_shipment(transfer):
    """Execute shipment: Deduct quantities from sending branch"""
    if transfer.status != 'submitted':
        raise ValueError("Only submitted transfers can be shipped.")

    with transaction.atomic():
        for item in transfer.items.select_for_update():
            # Deduct from sending branch
            # Fixed: Use Stock instead of Inventory
            from_stock = Stock.objects.select_for_update().get(
                branch=transfer.from_branch,
                variant=item.variant
            )
            if from_stock.quantity_in_stock < item.quantity_requested:
                raise ValueError(
                    f"Insufficient stock for variant {item.variant}")

            from_stock.quantity_in_stock -= item.quantity_requested
            from_stock.save()

            item.quantity_sent = item.quantity_requested
            item.save()

            # Log movement
            StockMovement.objects.create(
                stock=from_stock,
                movement_type='transfer_out',
                quantity=-item.quantity_requested,
                quantity_before=from_stock.quantity_in_stock + item.quantity_requested,
                quantity_after=from_stock.quantity_in_stock,
                notes=f"Transfer {transfer.transfer_number}"
            )

        transfer.status = 'shipped'
        transfer.shipped_date = timezone.now()
        transfer.save()

def execute_transfer_receiving(transfer):
    """Execute receiving: Add quantities to receiving branch"""
    if transfer.status != 'shipped':
        raise ValueError("Only shipped transfers can be received.")

    with transaction.atomic():
        for item in transfer.items.select_for_update():
            to_stock, _ = Stock.objects.select_for_update().get_or_create(
                branch=transfer.to_branch,
                variant=item.variant,
                defaults={'quantity_in_stock': 0}
            )
            to_stock.quantity_in_stock += item.quantity_sent
            to_stock.save()

            item.quantity_received = item.quantity_sent
            item.save()

            StockMovement.objects.create(
                stock=to_stock,
                movement_type='transfer_in',
                quantity=item.quantity_sent,
                quantity_before=to_stock.quantity_in_stock - item.quantity_sent,
                quantity_after=to_stock.quantity_in_stock,
                notes=f"Transfer {transfer.transfer_number}"
            )

        transfer.status = 'received'
        transfer.received_date = timezone.now()
        transfer.save()
