# apps/sales/views_reports.py
"""
تقارير المبيعات والمخزون
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F, Q
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.sales.models import Order, Invoice, Payment
from apps.products.models import Stock, StockMovement
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
from core.permissions.BranchAccessMixin import BranchAccessMixin

REPORT_ROLES = ["manager", "accountant"]
SUPER_ROLES = ["admin", "owner"]


def get_user_branch_ids(user):
    """Get branch IDs accessible by the user"""
    if user.is_superuser:
        return None  # All branches

    role = getattr(user, 'role', None)
    role_name = getattr(role, 'name', None)

    if role_name in SUPER_ROLES + ["manager"]:
        return None  # All branches

    # Get assigned branches
    try:
        from apps.branches.models import BranchUsers
        return list(
            BranchUsers.objects.filter(
                employee__user=user,
                is_active=True
            ).values_list('branch_id', flat=True)
        )
    except:
        return []


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
    )
])
def sales_summary(request):
    """
    ملخص المبيعات
    Parameters:
        - branch_id: optional
        - from_date: YYYY-MM-DD
        - to_date: YYYY-MM-DD
        - period: today, week, month, year
    """
    branch_ids = get_user_branch_ids(request.user)

    # Date filtering
    period = request.query_params.get('period', 'month')
    from_date = request.query_params.get('from_date')
    to_date = request.query_params.get('to_date')
    branch_id = request.query_params.get('branch_id')

    today = timezone.now().date()

    if from_date and to_date:
        pass  # Use provided dates
    elif period == 'today':
        from_date = to_date = today
    elif period == 'week':
        from_date = today - timedelta(days=7)
        to_date = today
    elif period == 'month':
        from_date = today.replace(day=1)
        to_date = today
    elif period == 'year':
        from_date = today.replace(month=1, day=1)
        to_date = today

    # Base queryset
    orders = Order.objects.filter(
        status='delivered',
        delivered_at__date__gte=from_date,
        delivered_at__date__lte=to_date
    )

    # Branch filtering
    if branch_ids is not None:
        orders = orders.filter(branch_id__in=branch_ids)
    if branch_id:
        orders = orders.filter(branch_id=branch_id)

    # Aggregate
    summary = orders.aggregate(
        total_orders=Count('id'),
        total_revenue=Sum('total_amount'),
        total_tax=Sum('tax_amount'),
        total_discount=Sum('discount_amount'),
        avg_order_value=Avg('total_amount'),
    )

    # Fill nulls with 0
    for key in summary:
        if summary[key] is None:
            summary[key] = Decimal(
                '0') if 'total' in key or 'avg' in key else 0

    # Payment breakdown
    payments = Payment.objects.filter(
        invoice__order__in=orders
    ).aggregate(
        total_payments=Sum('amount'),
        cash_payments=Sum('amount', filter=Q(payment_method='cash')),
        card_payments=Sum('amount', filter=Q(payment_method='card')),
    )

    summary['payments'] = {
        'total': payments['total_payments'] or 0,
        'cash': payments['cash_payments'] or 0,
        'card': payments['card_payments'] or 0,
    }

    return Response(summary)


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
    )
])
def sales_by_date(request):
    """
    المبيعات حسب التاريخ (للرسوم البيانية)
    """
    branch_ids = get_user_branch_ids(request.user)
    branch_id = request.query_params.get('branch_id')
    days = int(request.query_params.get('days', 30))

    from_date = timezone.now().date() - timedelta(days=days)

    orders = Order.objects.filter(
        status='delivered',
        delivered_at__date__gte=from_date
    )

    if branch_ids is not None:
        orders = orders.filter(branch_id__in=branch_ids)
    if branch_id:
        orders = orders.filter(branch_id=branch_id)

    daily_sales = orders.annotate(
        date=TruncDate('delivered_at')
    ).values('date').annotate(
        orders_count=Count('id'),
        revenue=Sum('total_amount')
    ).order_by('date')

    return Response(list(daily_sales))


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
    )
])
def inventory_summary(request):
    """
    ملخص المخزون
    """
    branch_ids = get_user_branch_ids(request.user)
    branch_id = request.query_params.get('branch_id')

    stocks = Stock.objects.filter(is_active=True)

    if branch_ids is not None:
        stocks = stocks.filter(branch_id__in=branch_ids)
    if branch_id:
        stocks = stocks.filter(branch_id=branch_id)

    summary = stocks.aggregate(
        total_items=Count('id'),
        total_quantity=Sum('quantity_in_stock'),
        total_reserved=Sum('reserved_quantity'),
        total_value=Sum(F('quantity_in_stock') * F('average_cost')),
        low_stock_count=Count('id', filter=Q(
            quantity_in_stock__lte=F('reorder_level'))),
        out_of_stock_count=Count('id', filter=Q(quantity_in_stock=0)),
    )

    # Fill nulls
    for key in summary:
        if summary[key] is None:
            summary[key] = 0

    return Response(summary)


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
    )
])
def stock_movements_report(request):
    """
    تقرير حركات المخزون
    """
    branch_ids = get_user_branch_ids(request.user)
    branch_id = request.query_params.get('branch_id')
    movement_type = request.query_params.get('movement_type')
    days = int(request.query_params.get('days', 30))

    from_date = timezone.now() - timedelta(days=days)

    movements = StockMovement.objects.filter(
        created_at__gte=from_date
    ).select_related('stock__branch', 'stock__variant__product')

    if branch_ids is not None:
        movements = movements.filter(stock__branch_id__in=branch_ids)
    if branch_id:
        movements = movements.filter(stock__branch_id=branch_id)
    if movement_type:
        movements = movements.filter(movement_type=movement_type)

    # Aggregate by type
    by_type = movements.values('movement_type').annotate(
        count=Count('id'),
        total_quantity=Sum('quantity')
    )

    return Response({
        'by_type': list(by_type),
        'total_movements': movements.count(),
    })


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
    )
])
def top_products(request):
    """
    أكثر المنتجات مبيعاً
    """
    branch_ids = get_user_branch_ids(request.user)
    branch_id = request.query_params.get('branch_id')
    limit = int(request.query_params.get('limit', 10))
    days = int(request.query_params.get('days', 30))

    from_date = timezone.now() - timedelta(days=days)

    from apps.sales.models import OrderItem

    items = OrderItem.objects.filter(
        order__status='delivered',
        order__delivered_at__gte=from_date
    ).select_related('product_variant__product')

    if branch_ids is not None:
        items = items.filter(order__branch_id__in=branch_ids)
    if branch_id:
        items = items.filter(order__branch_id=branch_id)

    top = items.values(
        'product_variant_id',
        product_name=F('product_variant__product__name'),
        variant_name=F('product_variant__sku')
    ).annotate(
        total_sold=Sum('quantity'),
        total_revenue=Sum('total_price')
    ).order_by('-total_sold')[:limit]

    return Response(list(top))


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
    )
])
def branch_comparison(request):
    """
    مقارنة أداء الفروع
    """
    branch_ids = get_user_branch_ids(request.user)
    days = int(request.query_params.get('days', 30))

    from_date = timezone.now() - timedelta(days=days)

    orders = Order.objects.filter(
        status='delivered',
        delivered_at__gte=from_date
    )

    if branch_ids is not None:
        orders = orders.filter(branch_id__in=branch_ids)

    comparison = orders.values(
        'branch_id',
        branch_name=F('branch__name')
    ).annotate(
        orders_count=Count('id'),
        total_revenue=Sum('total_amount'),
        avg_order=Avg('total_amount')
    ).order_by('-total_revenue')

    return Response(list(comparison))


# ═══════════════════════════════════════════════════════════════════════════════
# التقارير المالية الشاملة
# ═══════════════════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
    )
])
def financial_dashboard(request):
    """
    لوحة المعلومات المالية الشاملة
    تشمل:
    - إجمالي الفواتير
    - إجمالي المدفوعات
    - المبالغ المعلقة (غير المدفوعة)
    - الخصومات
    - الضرائب
    """
    branch_ids = get_user_branch_ids(request.user)
    branch_id = request.query_params.get('branch_id')
    period = request.query_params.get('period', 'month')

    today = timezone.now().date()

    if period == 'today':
        from_date = today
    elif period == 'week':
        from_date = today - timedelta(days=7)
    elif period == 'month':
        from_date = today.replace(day=1)
    elif period == 'year':
        from_date = today.replace(month=1, day=1)
    else:
        from_date = today - timedelta(days=30)

    # ─────────────────────────────────────────
    # الفواتير
    # ─────────────────────────────────────────
    invoices = Invoice.objects.filter(created_at__date__gte=from_date)

    if branch_ids is not None:
        invoices = invoices.filter(branch_id__in=branch_ids)
    if branch_id:
        invoices = invoices.filter(branch_id=branch_id)

    # فواتير البيع
    sale_invoices = invoices.filter(invoice_type='sale')
    sale_summary = sale_invoices.aggregate(
        count=Count('id'),
        total=Sum('total_amount'),
        subtotal=Sum('subtotal'),
        tax=Sum('tax_amount'),
        discount=Sum('discount_amount'),
        paid=Sum('paid_amount'),
    )

    # فواتير الشراء (من الموردين)
    purchase_invoices = invoices.filter(invoice_type='purchase')
    purchase_summary = purchase_invoices.aggregate(
        count=Count('id'),
        total=Sum('total_amount'),
        paid=Sum('paid_amount'),
    )

    # فواتير المرتجعات
    return_invoices = invoices.filter(
        invoice_type__in=['return_sale', 'return_purchase'])
    return_summary = return_invoices.aggregate(
        count=Count('id'),
        total=Sum('total_amount'),
    )

    # ─────────────────────────────────────────
    # المبالغ المعلقة (الذمم المدينة)
    # ─────────────────────────────────────────
    pending_invoices = sale_invoices.filter(
        status__in=['draft', 'partially_paid', 'overdue']
    ).annotate(
        remaining=F('total_amount') - F('paid_amount')
    )

    pending_summary = pending_invoices.aggregate(
        count=Count('id'),
        total_pending=Sum('remaining'),
    )

    # ─────────────────────────────────────────
    # المدفوعات
    # ─────────────────────────────────────────
    payments = Payment.objects.filter(created_at__date__gte=from_date)
    if branch_ids is not None:
        payments = payments.filter(invoice__branch_id__in=branch_ids)
    if branch_id:
        payments = payments.filter(invoice__branch_id=branch_id)

    payments_summary = payments.aggregate(
        total=Sum('amount'),
        cash=Sum('amount', filter=Q(payment_method='cash')),
        card=Sum('amount', filter=Q(payment_method='card')),
    )

    # ─────────────────────────────────────────
    # المخزون المحجوز (المعلق)
    # ─────────────────────────────────────────
    stocks = Stock.objects.filter(is_active=True)
    if branch_ids is not None:
        stocks = stocks.filter(branch_id__in=branch_ids)
    if branch_id:
        stocks = stocks.filter(branch_id=branch_id)

    reserved_stock = stocks.aggregate(
        total_reserved=Sum('reserved_quantity'),
        reserved_value=Sum(F('reserved_quantity') * F('average_cost')),
    )

    # ─────────────────────────────────────────
    # النتيجة النهائية
    # ─────────────────────────────────────────
    def safe_decimal(val):
        return val if val else Decimal('0')

    return Response({
        'period': period,
        'from_date': str(from_date),
        'sales': {
            'invoices_count': sale_summary['count'] or 0,
            'gross_total': safe_decimal(sale_summary['subtotal']),
            'tax_collected': safe_decimal(sale_summary['tax']),
            'discounts_given': safe_decimal(sale_summary['discount']),
            'net_total': safe_decimal(sale_summary['total']),
            'amount_received': safe_decimal(sale_summary['paid']),
            'pending_amount': safe_decimal(pending_summary['total_pending']),
        },
        'purchases': {
            'invoices_count': purchase_summary['count'] or 0,
            'total': safe_decimal(purchase_summary['total']),
            'paid': safe_decimal(purchase_summary['paid']),
        },
        'returns': {
            'count': return_summary['count'] or 0,
            'total': safe_decimal(return_summary['total']),
        },
        'payments': {
            'total': safe_decimal(payments_summary['total']),
            'by_method': {
                'cash': safe_decimal(payments_summary['cash']),
                'card': safe_decimal(payments_summary['card']),
            }
        },
        'reserved_inventory': {
            'quantity': reserved_stock['total_reserved'] or 0,
            'estimated_value': safe_decimal(reserved_stock['reserved_value']),
        },
    })


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
    )
])
def receivables_aging(request):
    """
    تقرير أعمار الذمم المدينة (المبالغ المستحقة)
    يوضح الفواتير غير المدفوعة حسب العمر
    """
    branch_ids = get_user_branch_ids(request.user)
    branch_id = request.query_params.get('branch_id')

    today = timezone.now().date()

    # الفواتير غير المسددة بالكامل
    invoices = Invoice.objects.filter(
        invoice_type='sale',
        status__in=['draft', 'partially_paid', 'overdue']
    ).annotate(
        remaining=F('total_amount') - F('paid_amount'),
        age_days=today - F('created_at__date')
    ).filter(remaining__gt=0)

    if branch_ids is not None:
        invoices = invoices.filter(branch_id__in=branch_ids)
    if branch_id:
        invoices = invoices.filter(branch_id=branch_id)

    # تصنيف حسب العمر
    aging = {
        'current': {'days': '0-30', 'count': 0, 'amount': Decimal('0')},
        'days_31_60': {'days': '31-60', 'count': 0, 'amount': Decimal('0')},
        'days_61_90': {'days': '61-90', 'count': 0, 'amount': Decimal('0')},
        'over_90': {'days': '90+', 'count': 0, 'amount': Decimal('0')},
    }

    for inv in invoices:
        age = (today - inv.created_at.date()).days
        remaining = inv.total_amount - inv.paid_amount

        if age <= 30:
            aging['current']['count'] += 1
            aging['current']['amount'] += remaining
        elif age <= 60:
            aging['days_31_60']['count'] += 1
            aging['days_31_60']['amount'] += remaining
        elif age <= 90:
            aging['days_61_90']['count'] += 1
            aging['days_61_90']['amount'] += remaining
        else:
            aging['over_90']['count'] += 1
            aging['over_90']['amount'] += remaining

    total_pending = sum(a['amount'] for a in aging.values())

    return Response({
        'aging': aging,
        'total_pending': total_pending,
        'invoices_count': invoices.count(),
    })


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
    )
])
def pending_orders(request):
    """
    الطلبات المعلقة (غير المسلمة)
    """
    branch_ids = get_user_branch_ids(request.user)
    branch_id = request.query_params.get('branch_id')

    orders = Order.objects.filter(
        status__in=['pending', 'confirmed', 'ready']
    )

    if branch_ids is not None:
        orders = orders.filter(branch_id__in=branch_ids)
    if branch_id:
        orders = orders.filter(branch_id=branch_id)

    by_status = orders.values('status').annotate(
        count=Count('id'),
        total_value=Sum('total_amount'),
        paid_amount=Sum('paid_amount'),
    )

    total = orders.aggregate(
        count=Count('id'),
        total_value=Sum('total_amount'),
        reserved_items=Count('items__id'),
    )

    return Response({
        'by_status': list(by_status),
        'total': total,
    })
