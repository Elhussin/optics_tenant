from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.products.models import Stock, StockMovement
from apps.sales.services.base_document_service import calculate_document_totals


def calculate_order_totals(order):
    calculate_document_totals(order)
    order.calculate_partner_shares()
    order.save(update_fields=['customer_share', 'partner_share'])
    return order


@transaction.atomic
def confirm_order(order, user):
    """
    Confirm Order: Reserves stock
    """
    if order.status != 'pending':
        raise ValidationError("Only pending orders can be confirmed")

    for item in order.items.select_related('product_variant'):
        stock = Stock.objects.select_for_update().filter(
            branch=order.branch,
            variant=item.product_variant
        ).first()

        if not stock:
            raise ValidationError(
                _("Product {0} not found in branch stock").format(item.product_variant))

        if stock.available_quantity < item.quantity:
            raise ValidationError(
                _("Insufficient available quantity for {0}. Available: {1}, Requested: {2}").format(
                    item.product_variant, stock.available_quantity, item.quantity
                )
            )

        # حجز الكمية
        StockMovement.objects.create(
            stock=stock,
            movement_type='reserve',
            quantity=-item.quantity,  # Negative = Reserve
            quantity_before=stock.quantity_in_stock,
            quantity_after=stock.quantity_in_stock,
            reference_number=order.order_number,
            notes=_("Reserved for order {0}").format(order.order_number),
            created_by=user if hasattr(user, 'id') else None,
        )
        stock.reserved_quantity += item.quantity
        stock.save()

    order.status = 'confirmed'
    order.confirmed_at = timezone.now()
    order.save(update_fields=['status', 'confirmed_at'])


@transaction.atomic
def deliver_order(order, user):
    """
    Deliver Order: Deducts stock and releases reservation
    """
    if order.status not in ['confirmed', 'ready']:
        raise ValidationError(
            _("Only confirmed or ready orders can be delivered"))

    for item in order.items.select_related('product_variant'):
        stock = Stock.objects.select_for_update().filter(
            branch=order.branch,
            variant=item.product_variant
        ).first()

        if stock:
            # Release reservation
            stock.reserved_quantity = max(
                0, stock.reserved_quantity - item.quantity)

            # Deduct stock
            quantity_before = stock.quantity_in_stock
            stock.quantity_in_stock = max(
                0, stock.quantity_in_stock - item.quantity)
            stock.last_sale = timezone.now()
            stock.save()

            # Log sale movement
            StockMovement.objects.create(
                stock=stock,
                movement_type='sale',
                quantity=-item.quantity,
                quantity_before=quantity_before,
                quantity_after=stock.quantity_in_stock,
                reference_number=order.order_number,
                notes=_("Sold via order {0}").format(order.order_number),
                created_by=user if hasattr(user, 'id') else None,
            )

    order.status = 'delivered'
    order.delivered_at = timezone.now()
    order.save(update_fields=['status', 'delivered_at'])

    # Create invoice automatically
    from apps.sales.models import Invoice, InvoiceItem
    invoice = Invoice.objects.create(
        branch=order.branch,
        customer=order.customer,
        order=order,
        invoice_type='sale',
        subtotal=order.subtotal,
        tax_rate=order.tax_rate,
        tax_amount=order.tax_amount,
        discount_amount=order.discount_amount,
        total_amount=order.total_amount,
        paid_amount=order.paid_amount,
        status='confirmed',
        notes=_("Invoice for order {0}").format(order.order_number),
    )

    # Copy order items to invoice
    for item in order.items.all():
        InvoiceItem.objects.create(
            invoice=invoice,
            product_variant=item.product_variant,
            quantity=item.quantity,
            unit_price=item.unit_price,
        )

    return invoice


@transaction.atomic
def cancel_order(order, user):
    """
    Cancel Order: Releases reserved stock
    """
    if order.status not in ['pending', 'confirmed', 'ready']:
        raise ValidationError(_("This order cannot be cancelled"))

    # Release reserved stock (only if confirmed)
    if order.status in ['confirmed', 'ready']:
        for item in order.items.select_related('product_variant'):
            stock = Stock.objects.select_for_update().filter(
                branch=order.branch,
                variant=item.product_variant
            ).first()

            if stock:
                StockMovement.objects.create(
                    stock=stock,
                    movement_type='release',
                    quantity=item.quantity,  # Positive = Release
                    quantity_before=stock.quantity_in_stock,
                    quantity_after=stock.quantity_in_stock,
                    reference_number=order.order_number,
                    notes=_("Released from cancelled order {0}").format(
                        order.order_number),
                    created_by=user if hasattr(user, 'id') else None,
                )
                stock.reserved_quantity = max(
                    0, stock.reserved_quantity - item.quantity)
                stock.save()

    order.status = 'cancelled'
    order.save(update_fields=['status'])


@transaction.atomic
def ready_order(order, user):
    """
    Ready Order for delivery
    """
    if order.status != 'confirmed':
        raise ValidationError(
            _("Only confirmed orders can be marked as ready"))

    order.status = 'ready'
    order.save(update_fields=['status'])
