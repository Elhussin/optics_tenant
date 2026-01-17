# services/order_service.py
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from apps.products.models import Stock, StockMovement
from apps.sales.services.base_document_service import calculate_document_totals


def calculate_order_totals(order):
    return calculate_document_totals(order)


@transaction.atomic
def confirm_order(order, user):
    """
    تأكيد الطلب: يحجز المخزون (reserve)
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
                f"المنتج {item.product_variant} غير موجود في مخزون الفرع")

        if stock.available_quantity < item.quantity:
            raise ValidationError(
                f"الكمية المتاحة من {item.product_variant} غير كافية. "
                f"المتاح: {stock.available_quantity}، المطلوب: {item.quantity}"
            )

        # حجز الكمية
        StockMovement.objects.create(
            stock=stock,
            movement_type='reserve',
            quantity=-item.quantity,  # سالب = حجز
            quantity_before=stock.quantity_in_stock,
            quantity_after=stock.quantity_in_stock,
            reference_number=order.order_number,
            notes=f"Reserved for order {order.order_number}",
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
    توصيل الطلب: يخصم المخزون فعلياً ويحرر الحجز
    """
    if order.status not in ['confirmed', 'ready']:
        raise ValidationError("يمكن توصيل الطلبات المؤكدة أو الجاهزة فقط")

    for item in order.items.select_related('product_variant'):
        stock = Stock.objects.select_for_update().filter(
            branch=order.branch,
            variant=item.product_variant
        ).first()

        if stock:
            # تحرير الحجز
            stock.reserved_quantity = max(
                0, stock.reserved_quantity - item.quantity)

            # خصم المخزون فعلياً
            quantity_before = stock.quantity_in_stock
            stock.quantity_in_stock = max(
                0, stock.quantity_in_stock - item.quantity)
            stock.last_sale = timezone.now()
            stock.save()

            # سجل حركة البيع
            StockMovement.objects.create(
                stock=stock,
                movement_type='sale',
                quantity=-item.quantity,
                quantity_before=quantity_before,
                quantity_after=stock.quantity_in_stock,
                reference_number=order.order_number,
                notes=f"Sold via order {order.order_number}",
                created_by=user if hasattr(user, 'id') else None,
            )

    order.status = 'delivered'
    order.delivered_at = timezone.now()
    order.save(update_fields=['status', 'delivered_at'])

    # إنشاء فاتورة تلقائياً
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
        notes=f"فاتورة للطلب {order.order_number}",
    )

    # نسخ عناصر الطلب للفاتورة
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
    إلغاء الطلب: يحرر المخزون المحجوز
    """
    if order.status not in ['pending', 'confirmed', 'ready']:
        raise ValidationError("لا يمكن إلغاء هذا الطلب")

    # تحرير المخزون المحجوز (فقط إذا كان مؤكد)
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
                    quantity=item.quantity,  # موجب = تحرير
                    quantity_before=stock.quantity_in_stock,
                    quantity_after=stock.quantity_in_stock,
                    reference_number=order.order_number,
                    notes=f"Released from cancelled order {order.order_number}",
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
    تجهيز الطلب للتسليم
    """
    if order.status != 'confirmed':
        raise ValidationError("يمكن تجهيز الطلبات المؤكدة فقط")

    order.status = 'ready'
    order.save(update_fields=['status'])
