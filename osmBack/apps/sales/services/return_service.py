# services/return_service.py
"""
خدمات المرتجعات:
- مرتجع مبيعات (العميل يرجع منتج)
- مرتجع مشتريات (نرجع منتج للمورد)
"""

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from apps.products.models import Stock, StockMovement
from decimal import Decimal


@transaction.atomic
def create_sale_return(order, items_to_return, user, reason=""):
    """
    إنشاء مرتجع مبيعات (العميل يرجع منتج)

    Args:
        order: الطلب الأصلي
        items_to_return: قائمة من {order_item_id, quantity, reason}
        user: المستخدم الذي ينفذ العملية
        reason: سبب الإرجاع

    Returns:
        Invoice: فاتورة المرتجع
    """
    if order.status != 'delivered':
        raise ValidationError("يمكن إرجاع الطلبات المسلمة فقط")

    from apps.sales.models import Invoice, InvoiceItem, OrderItem

    # التحقق من الكميات
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
                f"لا يمكن إرجاع كمية أكبر من المشتراة للمنتج {order_item.product_variant}"
            )

        validated_items.append({
            'order_item': order_item,
            'quantity': return_qty,
            'unit_price': order_item.unit_price,
            'total': return_qty * order_item.unit_price,
        })
        total_return_amount += return_qty * order_item.unit_price

    # إنشاء فاتورة المرتجع
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
        notes=f"مرتجع للطلب {order.order_number}. السبب: {reason}",
    )

    # إضافة العناصر المرتجعة للفاتورة وإعادة المخزون
    for item in validated_items:
        # إنشاء عنصر الفاتورة
        InvoiceItem.objects.create(
            invoice=invoice,
            product_variant=item['order_item'].product_variant,
            quantity=item['quantity'],
            unit_price=item['unit_price'],
        )

        # إعادة الكمية للمخزون
        stock = Stock.objects.select_for_update().filter(
            branch=order.branch,
            variant=item['order_item'].product_variant
        ).first()

        if stock:
            quantity_before = stock.quantity_in_stock
            stock.quantity_in_stock += item['quantity']
            stock.save()

            # سجل حركة الإرجاع
            StockMovement.objects.create(
                stock=stock,
                movement_type='return',
                quantity=item['quantity'],  # موجب = إضافة للمخزون
                quantity_before=quantity_before,
                quantity_after=stock.quantity_in_stock,
                reference_number=invoice.invoice_number,
                notes=f"مرتجع مبيعات - {reason}",
                created_by=user if hasattr(user, 'id') else None,
            )

    return invoice


@transaction.atomic
def create_purchase_return(branch, supplier, items_to_return, user, reason=""):
    """
    إنشاء مرتجع مشتريات (نرجع منتج للمورد)

    Args:
        branch: الفرع
        supplier: المورد
        items_to_return: قائمة من {variant_id, quantity, cost_per_unit}
        user: المستخدم
        reason: سبب الإرجاع

    Returns:
        Invoice: فاتورة المرتجع
    """
    from apps.sales.models import Invoice, InvoiceItem
    from apps.products.models import ProductVariant
    from apps.crm.models import Customer

    # التحقق من الكميات المتوفرة
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
                f"الكمية المتوفرة من {variant} غير كافية للإرجاع"
            )

        validated_items.append({
            'variant': variant,
            'stock': stock,
            'quantity': return_qty,
            'cost': cost,
            'total': return_qty * cost,
        })
        total_return_amount += return_qty * cost

    # نحتاج Customer للفاتورة - يمكن استخدام حساب المورد كـ Customer
    # أو إنشاء حساب خاص للموردين
    supplier_customer, _ = Customer.objects.get_or_create(
        phone=f"supplier_{supplier.id if hasattr(supplier, 'id') else 'unknown'}",
        defaults={
            'first_name': getattr(supplier, 'name', 'Supplier'),
            'last_name': 'Account',
        }
    )

    # إنشاء فاتورة المرتجع
    invoice = Invoice.objects.create(
        branch=branch,
        customer=supplier_customer,
        invoice_type='return_purchase',
        subtotal=total_return_amount,
        total_amount=total_return_amount,
        status='confirmed',
        notes=f"مرتجع للمورد. السبب: {reason}",
    )

    # خصم من المخزون
    for item in validated_items:
        # إنشاء عنصر الفاتورة
        InvoiceItem.objects.create(
            invoice=invoice,
            product_variant=item['variant'],
            quantity=item['quantity'],
            unit_price=item['cost'],
        )

        # خصم الكمية من المخزون
        stock = item['stock']
        quantity_before = stock.quantity_in_stock
        stock.quantity_in_stock -= item['quantity']
        stock.save()

        # سجل حركة الإرجاع للمورد
        StockMovement.objects.create(
            stock=stock,
            movement_type='return_to_supplier',
            quantity=-item['quantity'],  # سالب = خصم من المخزون
            quantity_before=quantity_before,
            quantity_after=stock.quantity_in_stock,
            reference_number=invoice.invoice_number,
            notes=f"مرتجع للمورد - {reason}",
            created_by=user if hasattr(user, 'id') else None,
        )

    return invoice


@transaction.atomic
def process_damage(branch, items, user, reason=""):
    """
    تسجيل تلف/إتلاف منتجات

    Args:
        branch: الفرع
        items: قائمة من {variant_id, quantity, reason}
        user: المستخدم
        reason: سبب التلف
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
                f"الكمية المتوفرة من {variant} غير كافية"
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
            notes=f"تلف/إتلاف - {item_reason}",
            created_by=user if hasattr(user, 'id') else None,
        )

    return True
