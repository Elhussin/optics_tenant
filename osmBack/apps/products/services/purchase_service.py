from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.products.models.purchase import PurchaseOrder
from apps.products.models.inventory import Stock, StockMovement

def calculate_purchase_order_totals(order):
    """Recalculate order totals from items"""
    items = order.items.all()
    order.subtotal = sum(item.line_total for item in items)
    order.total_amount = order.subtotal + order.tax_amount
    order.save(update_fields=['subtotal', 'total_amount'])

def submit_purchase_order(order):
    """Submit the order for approval"""
    if order.status != PurchaseOrder.Status.DRAFT:
        raise ValidationError(_("Only draft orders can be submitted"))
    if not order.items.exists():
        raise ValidationError(_("Cannot submit an empty order"))
    order.status = PurchaseOrder.Status.SUBMITTED
    order.save(update_fields=['status'])

def approve_purchase_order(order, user):
    """Approve the order"""
    if order.status != PurchaseOrder.Status.SUBMITTED:
        raise ValidationError(_("Only submitted orders can be approved"))
    order.status = PurchaseOrder.Status.APPROVED
    order.approved_by = user
    order.approved_date = timezone.now()
    order.save(update_fields=['status', 'approved_by', 'approved_date'])

def cancel_purchase_order(order):
    """Cancel the order"""
    if order.status in [PurchaseOrder.Status.RECEIVED, PurchaseOrder.Status.CANCELLED]:
        raise ValidationError(
            _("Cannot cancel a received or already cancelled order"))
    order.status = PurchaseOrder.Status.CANCELLED
    order.save(update_fields=['status'])

def receive_purchase_order_items(order, items_received: dict):
    """
    Receive items and create stock movements.
    items_received: {item_id: quantity_received}
    """
    if order.status not in [PurchaseOrder.Status.APPROVED, PurchaseOrder.Status.PARTIALLY_RECEIVED]:
        raise ValidationError(_("Only approved orders can be received"))

    with transaction.atomic():
        all_received = True

        for item in order.items.select_for_update():
            qty_to_receive = items_received.get(item.id, 0)
            if qty_to_receive <= 0:
                if item.quantity_received < item.quantity_ordered:
                    all_received = False
                continue

            # Validate quantity
            max_receivable = item.quantity_ordered - item.quantity_received
            if qty_to_receive > max_receivable:
                raise ValidationError(
                    _("Cannot receive more than ordered for {variant}").format(
                        variant=item.variant
                    )
                )

            # Update item received quantity
            item.quantity_received += qty_to_receive
            item.save(update_fields=['quantity_received'])

            # Get or create stock record
            stock, created = Stock.objects.get_or_create(
                branch=order.branch,
                variant=item.variant,
                defaults={'quantity_in_stock': 0}
            )

            # Calculate quantities
            quantity_before = stock.quantity_in_stock
            quantity_after = quantity_before + qty_to_receive

            # Update average cost before updating quantity
            from apps.products.services.inventory_service import update_stock_average_cost
            update_stock_average_cost(stock, qty_to_receive, item.unit_cost)
            
            stock.quantity_in_stock = quantity_after
            stock.last_restocked = timezone.now()
            stock.save()

            # Create stock movement
            StockMovement.objects.create(
                stock=stock,
                movement_type='purchase',
                quantity=qty_to_receive,
                quantity_before=quantity_before,
                quantity_after=quantity_after,
                cost_per_unit=item.unit_cost,
                reference_number=order.order_number,
                notes=_("Received from PO: {order}").format(
                    order=order.order_number)
            )

            # Check if fully received
            if item.quantity_received < item.quantity_ordered:
                all_received = False

        # Update order status
        if all_received:
            order.status = PurchaseOrder.Status.RECEIVED
            order.received_date = timezone.now()
        else:
            order.status = PurchaseOrder.Status.PARTIALLY_RECEIVED

        order.save(update_fields=['status', 'received_date'])
