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

        # Generate Draft Purchase Invoice
        try:
            generate_purchase_invoice_from_order(order, items_received)
        except Exception as e:
            # We can log this, but we shouldn't fail the receipt process completely
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to generate purchase invoice for PO {order.order_number}: {str(e)}")


def generate_purchase_invoice_from_order(order, items_received):
    """Generates a Draft Purchase Invoice when a Purchase Order is received"""
    from apps.sales.models import Invoice, InvoiceItem, InvoiceType
    from apps.crm.models import Customer
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Get the Purchase InvoiceType
    invoice_type = InvoiceType.objects.filter(action_type='purchase').first()
    if not invoice_type:
        return # Cannot create invoice if no type exists
        
    # Find or create a CRM Customer representing this supplier
    supplier = order.supplier
    system_user = User.objects.first() # Fallback user
    
    customer = Customer.objects.filter(first_name=supplier.name, customer_type='supplier').first()
    if not customer:
        customer = Customer.objects.create(
            first_name=supplier.name,
            customer_type='supplier',
            phone=supplier.phone,
            email=supplier.email,
            created_by=order.created_by or system_user
        )

    # Calculate subtotal for the received items
    subtotal = 0
    valid_items = []
    for item in order.items.all():
        qty = items_received.get(item.id, 0)
        if qty > 0:
            line_total = qty * item.unit_cost
            subtotal += line_total
            valid_items.append((item, qty, line_total))
            
    if not valid_items:
        return

    # Create the draft invoice
    invoice = Invoice.objects.create(
        branch=order.branch,
        customer=customer,
        invoice_type=invoice_type,
        purchase_order=order,
        status='draft',
        # Assuming system currency or order currency
        total_amount_base=subtotal,
        total_amount=subtotal,
        subtotal=subtotal,
    )
    
    # Create invoice items
    for item, qty, line_total in valid_items:
        InvoiceItem.objects.create(
            invoice=invoice,
            product_variant=item.variant,
            quantity=qty,
            unit_price=item.unit_cost,
            total_price=line_total
        )
