# services/return_service.py
"""
Return Services:
- Sale Return (Customer returns product)
- Purchase Return (Return product to supplier)
"""

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.products.models import Stock, StockMovement
from decimal import Decimal


@transaction.atomic
def create_sale_return(order, items_to_return, user, reason=""):
    """
    Create Sale Return (Customer returns product)

    Args:
        order: Original Order
        items_to_return: List of {order_item_id, quantity, reason}
        user: User performing the action
        reason: Reason for return

    Returns:
        Invoice: Return Invoice
    """
    if order.status != 'delivered':
        raise ValidationError(str(_("Only delivered orders can be returned")))

    from apps.sales.models import Invoice, InvoiceItem, OrderItem

    # Check quantities
    total_return_amount = Decimal('0')
    validated_items = []

    for item_data in items_to_return:
        order_item = OrderItem.objects.get(
            id=item_data['order_item_id'],
            order=order
        )

        return_qty = item_data.get('quantity', order_item.quantity)

        if return_qty > order_item.quantity:
            raise ValidationError(
                str(_("Cannot return more than purchased quantity for product {0}").format(
                    order_item.product_variant))
            )

        validated_items.append({
            'order_item': order_item,
            'quantity': return_qty,
            'unit_price': order_item.unit_price,
            'total': return_qty * order_item.unit_price,
        })
        total_return_amount += return_qty * order_item.unit_price

    # Create return invoice
    invoice = Invoice.objects.create(
        branch=order.branch,
        customer=order.customer,
        order=order,
        invoice_type='return_sale',
        subtotal=total_return_amount,
        tax_rate=order.tax_rate,
        tax_amount=total_return_amount * order.tax_rate,
        discount_amount=Decimal('0'),
        total_amount=total_return_amount * (1 + order.tax_rate),
        status='confirmed',
        notes=str(_("Return for order {0}. Reason: {1}").format(
            order.order_number, reason)),
    )

    # Add returned items to invoice and restock
    for item in validated_items:
        # Create invoice item
        InvoiceItem.objects.create(
            invoice=invoice,
            product_variant=item['order_item'].product_variant,
            quantity=item['quantity'],
            unit_price=item['unit_price'],
        )

        # Return quantity to stock
        stock = Stock.objects.select_for_update().filter(
            branch=order.branch,
            variant=item['order_item'].product_variant
        ).first()

        if stock:
            quantity_before = stock.quantity_in_stock
            stock.quantity_in_stock += item['quantity']
            stock.save()

            # Log return movement
            StockMovement.objects.create(
                stock=stock,
                movement_type='return',
                quantity=item['quantity'],  # Positive = Add to stock
                quantity_before=quantity_before,
                quantity_after=stock.quantity_in_stock,
                reference_number=invoice.invoice_number,
                notes=str(_("Sale Return - {0}").format(reason)),
                created_by=user if hasattr(user, 'id') else None,
            )

    return invoice


@transaction.atomic
def create_purchase_return(branch, supplier, items_to_return, user, reason=""):
    """
    Create Purchase Return (Return product to supplier)

    Args:
        branch: Branch
        supplier: Supplier
        items_to_return: List of {variant_id, quantity, cost_per_unit}
        user: User
        reason: Reason for return

    Returns:
        Invoice: Return Invoice
    """
    from apps.sales.models import Invoice, InvoiceItem
    from apps.products.models import ProductVariant
    from apps.crm.models import Customer

    # Check available quantities
    total_return_amount = Decimal('0')
    validated_items = []

    for item_data in items_to_return:
        variant = ProductVariant.objects.get(id=item_data['variant_id'])
        return_qty = item_data['quantity']
        cost = Decimal(str(item_data.get('cost_per_unit', 0)))

        stock = Stock.objects.filter(
            branch=branch,
            variant=variant
        ).first()

        if not stock or stock.available_quantity < return_qty:
            raise ValidationError(
                str(_("Available quantity of {0} is insufficient for return").format(
                    variant))
            )

        validated_items.append({
            'variant': variant,
            'stock': stock,
            'quantity': return_qty,
            'cost': cost,
            'total': return_qty * cost,
        })
        total_return_amount += return_qty * cost

    # Need Customer for invoice - can use supplier account as Customer
    # or create special account for suppliers
    supplier_customer, _ = Customer.objects.get_or_create(
        phone=f"supplier_{supplier.id if hasattr(supplier, 'id') else 'unknown'}",
        defaults={
            'first_name': getattr(supplier, 'name', 'Supplier'),
            'last_name': 'Account',
        }
    )

    # Create return invoice
    invoice = Invoice.objects.create(
        branch=branch,
        customer=supplier_customer,
        invoice_type='return_purchase',
        subtotal=total_return_amount,
        total_amount=total_return_amount,
        status='confirmed',
        notes=str(_("Return to supplier. Reason: {0}").format(reason)),
    )

    # Deduct from stock
    for item in validated_items:
        # Create invoice item
        InvoiceItem.objects.create(
            invoice=invoice,
            product_variant=item['variant'],
            quantity=item['quantity'],
            unit_price=item['cost'],
        )

        # Deduct quantity from stock
        stock = item['stock']
        quantity_before = stock.quantity_in_stock
        stock.quantity_in_stock -= item['quantity']
        stock.save()

        # Log return movement to supplier
        StockMovement.objects.create(
            stock=stock,
            movement_type='return_to_supplier',
            quantity=-item['quantity'],  # Negative = Deduct from stock
            quantity_before=quantity_before,
            quantity_after=stock.quantity_in_stock,
            reference_number=invoice.invoice_number,
            notes=str(_("Return to supplier - {0}").format(reason)),
            created_by=user if hasattr(user, 'id') else None,
        )

    return invoice


@transaction.atomic
def process_damage(branch, items, user, reason=""):
    """
    Record damage/spoilage of products

    Args:
        branch: Branch
        items: List of {variant_id, quantity, reason}
        user: User
        reason: Reason for damage
    """
    from apps.products.models import ProductVariant

    for item_data in items:
        variant = ProductVariant.objects.get(id=item_data['variant_id'])
        damage_qty = item_data['quantity']
        item_reason = item_data.get('reason', reason)

        stock = Stock.objects.select_for_update().filter(
            branch=branch,
            variant=variant
        ).first()

        if not stock or stock.available_quantity < damage_qty:
            raise ValidationError(
                str(_("Available quantity of {0} is insufficient").format(
                    variant))
            )

        quantity_before = stock.quantity_in_stock
        stock.quantity_in_stock -= damage_qty
        stock.save()

        # سجل حركة التلف
        StockMovement.objects.create(
            stock=stock,
            movement_type='damage',
            quantity=-damage_qty,
            quantity_before=quantity_before,
            quantity_after=stock.quantity_in_stock,
            notes=str(_("Damage/Spoilage - {0}").format(item_reason)),
            created_by=user if hasattr(user, 'id') else None,
        )

    return True
