# services/invoice_service.py

from apps.accounting.services.entry_service import create_invoice_journal_entry
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.products.models import Stock, StockMovement
from apps.sales.services.base_document_service import calculate_document_totals


def calculate_invoice_totals(invoice):
    return calculate_document_totals(invoice)


@transaction.atomic
def confirm_invoice(invoice):
    """
    Confirms an invoice, locking it and generating related records.
    1. Validates status.
    2. Snapshots Pricing and Tax data.
    3. Updates Stock (if applicable).
    4. Generates GL Entries.
    5. Sets status to CONFIRMED.
    """
    if invoice.status != 'draft':
        raise ValidationError(_("Only draft invoices can be confirmed"))

    # 1. Snapshot Data
    # In a real scenario, we might re-calculate here to ensure latest data
    # For now, we assume current values on invoice are correct/latest calculated
    invoice.pricing_policy_snapshot = {
        'id': invoice.invoice_type.pricing_policy.id,
        'name': invoice.invoice_type.pricing_policy.name,
        'code': getattr(invoice.invoice_type.pricing_policy, 'code', '')
    } if invoice.invoice_type.pricing_policy else {}

    # Snapshot taxes (simplified for now, ideally per line item or global)
    # create_snapshot needs to be implemented or logic added here
    # invoice.tax_snapshot = ...

    # 2. Stock Movement
    # Determine movement type based on InvoiceType action_type
    movement_type = None
    factor = 0

    action_type = invoice.invoice_type.action_type
    if action_type == 'sale':
        # If invoice is linked to an order, the order handles physical stock movement upon delivery
        if invoice.order_id:
            movement_type = None
            factor = 0
        else:
            movement_type = 'sale'
            factor = -1
    elif action_type == 'purchase':
        movement_type = 'purchase'
        factor = 1
    elif action_type == 'return_sale':
        movement_type = 'return'
        factor = 1
    elif action_type == 'return_purchase':
        movement_type = 'return_to_supplier'
        factor = -1

    if movement_type:
        for item in invoice.items.select_related('product_variant'):
            stock = Stock.objects.select_for_update().filter(
                branch=invoice.branch,
                variant=item.product_variant
            ).first()

            if stock:
                # factor determines if we add or remove stock
                # quantity is always positive in the item
                quantity_delta = item.quantity * factor
                
                # Check sufficient stock for outgoing movements (sale, return_to_supplier)
                if factor < 0 and stock.available_quantity < item.quantity:
                    raise ValidationError(
                        _("Not enough stock for {0}").format(item.product_variant))

                before = stock.quantity_in_stock
                stock.quantity_in_stock += quantity_delta
                
                # Update cost for purchases
                if action_type == 'purchase' and item.unit_price > 0:
                    stock.last_cost = item.unit_price
                    # simple average cost recalculation
                    total_value = (before * stock.average_cost) + (item.quantity * item.unit_price)
                    if stock.quantity_in_stock > 0:
                        stock.average_cost = total_value / stock.quantity_in_stock

                stock.save()

                StockMovement.objects.create(
                    stock=stock,
                    movement_type=movement_type,
                    quantity=abs(quantity_delta), # store positive quantity
                    quantity_before=before,
                    quantity_after=stock.quantity_in_stock,
                    reference_number=invoice.invoice_number,
                    invoice=invoice,
                    cost_per_unit=item.unit_price if action_type == 'purchase' else stock.average_cost,
                    notes=_("Invoice {0}").format(invoice.invoice_number),
                )

    # 3. Finalize Status & Date (in memory first)
    invoice.status = 'confirmed'
    invoice.confirmed_at = timezone.now()

    # Generate final ZATCA tax number upon confirmation
    from apps.sales.utils import generate_serial_number
    if not invoice.zatca_tax_number:
        invoice.zatca_tax_number = generate_serial_number(
            invoice.__class__, 'TAX', 'zatca_tax_number'
        )

    # 4. Accounting Entries (Now has access to confirmed_at)
    create_invoice_journal_entry(invoice)

    # 5. Save Changes
    invoice.save()
    
    # ---------------------------------------------------------
    # ZATCA INTEGRATION POINT (Phase 2)
    # ---------------------------------------------------------
    # Call ZATCA celery task asynchronously to prevent UI block
    try:
        from django.db import connection
        from apps.sales.tasks import submit_invoice_to_zatca_task
        submit_invoice_to_zatca_task.delay(connection.schema_name, invoice.id)
    except Exception as e:
        # Log error but do not fail checkout. ZATCA allows 24h for reporting B2C.
        import logging
        logger = logging.getLogger('tenant')
        logger.error(f"Failed to queue ZATCA task for invoice {invoice.invoice_number}: {str(e)}")
    # ---------------------------------------------------------
