# signals.py - System signals for automatic updates
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from django.utils.translation import gettext_lazy as _
import logging

from apps.sales.models import Order, OrderItem, Invoice, InvoiceItem
from apps.products.models import Stock, StockMovement

logger = logging.getLogger(__name__)


@receiver(post_save, sender=OrderItem)
@receiver(post_delete, sender=OrderItem)
def update_order_totals(sender, instance, **kwargs):
    """Update order totals when items change"""
    if hasattr(instance, 'order') and instance.order:
        instance.order.calculate_totals()


@receiver(post_save, sender=InvoiceItem)
@receiver(post_delete, sender=InvoiceItem)
def update_invoice_totals(sender, instance, **kwargs):
    """Update invoice totals when items change"""
    if hasattr(instance, 'invoice') and instance.invoice:
        instance.invoice.calculate_totals()


@receiver(post_save, sender=Order)
def check_order_status_change(sender, instance, created, **kwargs):
    """Check order status change"""
    if not created and instance.status == 'delivered':
        # Automatically create invoice upon delivery
        if not instance.invoices.exists():
            create_invoice_from_order(instance)


@receiver(post_save, sender=StockMovement)
def check_stock_levels(sender, instance, created, **kwargs):
    """Check stock levels after every movement"""
    if created:
        stock = Stock.objects.filter(
            branch=instance.branch,
            variant=instance.variant
        ).first()

        if stock:
            # Check availability against reorder level directly
            # Ignoring stock.stock_status string to be safe against translations
            if stock.available_quantity <= stock.reorder_level:
                # Send low stock notification
                send_low_stock_notification(stock)


def create_invoice_from_order(order):
    """Create invoice from order"""
    with transaction.atomic():
        invoice = Invoice.objects.create(
            customer=order.customer,
            branch=order.branch,
            order=order,
            subtotal=order.subtotal,
            tax_rate=order.tax_rate,
            tax_amount=order.tax_amount,
            discount_amount=order.discount_amount,
            total_amount=order.total_amount,
            notes=str(
                _("Auto-generated from order {0}").format(order.order_number)),
        )

        # Copy order items to invoice
        # Both OrderItem and InvoiceItem inherit from BaseItem and use `product_variant`
        for order_item in order.items.all():
            InvoiceItem.objects.create(
                invoice=invoice,
                product_variant=order_item.product_variant,
                quantity=order_item.quantity,
                unit_price=order_item.unit_price,
            )

        return invoice


def send_low_stock_notification(stock):
    """Send low stock notification"""
    logger.warning(
        f"LOW STOCK: {stock.variant} at {stock.branch} — Available: {stock.available_quantity}"
    )
