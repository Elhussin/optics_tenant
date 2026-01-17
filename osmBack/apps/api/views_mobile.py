# apps/api/views_mobile.py
"""
واجهات برمجية محسنة للموبايل
APIs مصممة لتقليل استهلاك البيانات وعدد الطلبات
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from core.caching import cache_result, CacheManager, SHORT_CACHE_TTL
from core.query_optimizer import QueryOptimizer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mobile_dashboard(request):
    """
    لوحة تحكم للموبايل - كل البيانات في طلب واحد

    يجمع:
    - إحصائيات اليوم
    - آخر الطلبات
    - التنبيهات
    - أداء المستخدم
    """
    user = request.user
    branch_id = request.query_params.get('branch_id')

    # الحصول على الفرع من المستخدم إذا لم يحدد
    if not branch_id and hasattr(user, 'branches'):
        branches = user.branches.all()
        if branches.exists():
            branch_id = branches.first().id

    from apps.sales.models import Order, Invoice, Payment
    from apps.products.models import Stock

    today = timezone.now().date()

    # ═══ إحصائيات اليوم ═══
    today_filters = {'created_at__date': today}
    if branch_id:
        today_filters['branch_id'] = branch_id

    orders_today = Order.objects.filter(**today_filters)
    today_stats = orders_today.aggregate(
        orders_count=Count('id'),
        total_sales=Sum('total_amount'),
        cash_sales=Sum('total_amount', filter=Q(payment_method='cash')),
        card_sales=Sum('total_amount', filter=Q(
            payment_method__in=['card', 'mada', 'visa', 'apple_pay'])),
    )

    # ═══ آخر الطلبات ═══
    recent_orders = Order.objects.filter(
        **({} if not branch_id else {'branch_id': branch_id})
    ).select_related('customer').order_by('-created_at')[:5]

    recent_orders_data = [
        {
            'id': o.id,
            'order_number': o.order_number,
            'customer_name': o.customer.full_name if o.customer else 'عميل',
            'total': str(o.total_amount),
            'status': o.status,
            'time': o.created_at.strftime('%H:%M'),
        }
        for o in recent_orders
    ]

    # ═══ التنبيهات ═══
    alerts = []

    # طلبات معلقة
    pending_count = Order.objects.filter(
        status='pending',
        **({} if not branch_id else {'branch_id': branch_id})
    ).count()
    if pending_count > 0:
        alerts.append({
            'type': 'warning',
            'title': 'طلبات معلقة',
            'message': f'{pending_count} طلب في انتظار التأكيد',
            'action': 'orders_pending',
        })

    # مخزون منخفض
    if branch_id:
        low_stock = Stock.objects.filter(
            branch_id=branch_id,
            quantity__lte=F('min_quantity'),
            quantity__gt=0
        ).count()
        if low_stock > 0:
            alerts.append({
                'type': 'alert',
                'title': 'مخزون منخفض',
                'message': f'{low_stock} منتج يحتاج إعادة طلب',
                'action': 'low_stock',
            })

    # ═══ أداء المستخدم (للموظفين) ═══
    user_performance = None
    if hasattr(user, 'sales_profile'):
        sales_profile = user.sales_profile
        user_orders = Order.objects.filter(
            sales_person=sales_profile,
            created_at__date=today
        )
        user_performance = {
            'orders': user_orders.count(),
            'sales': str(user_orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0),
        }

    return Response({
        'today': {
            'orders_count': today_stats['orders_count'] or 0,
            'total_sales': str(today_stats['total_sales'] or 0),
            'cash_sales': str(today_stats['cash_sales'] or 0),
            'card_sales': str(today_stats['card_sales'] or 0),
        },
        'recent_orders': recent_orders_data,
        'alerts': alerts,
        'user_performance': user_performance,
        'timestamp': timezone.now().isoformat(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mobile_product_search(request):
    """
    بحث سريع عن المنتجات للموبايل

    يعيد فقط الحقول المطلوبة لتقليل حجم البيانات
    """
    query = request.query_params.get('q', '')
    branch_id = request.query_params.get('branch_id')
    limit = int(request.query_params.get('limit', 20))

    if len(query) < 2:
        return Response([])

    from apps.products.models import ProductVariant, Stock

    variants = ProductVariant.objects.filter(
        Q(sku__icontains=query) |
        Q(product__name__icontains=query) |
        Q(product__model__icontains=query)
    ).select_related('product').only(
        'id', 'sku', 'price', 'product__name', 'product_id'
    )[:limit]

    # جلب المخزون إذا وجد فرع
    stock_map = {}
    if branch_id:
        stocks = Stock.objects.filter(
            branch_id=branch_id,
            variant_id__in=[v.id for v in variants]
        ).values('variant_id', 'quantity')
        stock_map = {s['variant_id']: s['quantity'] for s in stocks}

    results = [
        {
            'id': v.id,
            'sku': v.sku,
            'name': v.product.name,
            'price': str(v.price),
            'stock': stock_map.get(v.id, 0),
        }
        for v in variants
    ]

    return Response(results)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mobile_customer_lookup(request):
    """
    بحث سريع عن العملاء للموبايل
    """
    query = request.query_params.get('q', '')
    limit = int(request.query_params.get('limit', 10))

    if len(query) < 2:
        return Response([])

    from apps.crm.models import Customer

    customers = Customer.objects.filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(phone__icontains=query) |
        Q(identification_number__icontains=query)
    ).only(
        'id', 'first_name', 'last_name', 'phone',
        'pricing_tier', 'credit_status'
    )[:limit]

    return Response([
        {
            'id': c.id,
            'name': c.full_name,
            'phone': c.phone,
            'tier': c.pricing_tier,
            'has_credit': c.credit_status == 'approved',
        }
        for c in customers
    ])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mobile_quick_sale(request):
    """
    بيع سريع من الموبايل

    Request Body:
    {
        "customer_id": 1,
        "items": [{"variant_id": 1, "quantity": 1, "price": "100.00"}],
        "payment_method": "cash",
        "discount": "0.00"
    }
    """
    from apps.sales.models import Order, OrderItem
    from apps.crm.models import Customer
    from apps.products.models import ProductVariant

    user = request.user

    # جلب الفرع من المستخدم
    branch = None
    if hasattr(user, 'branches'):
        branches = user.branches.all()
        if branches.exists():
            branch = branches.first()

    if not branch:
        return Response(
            {'error': 'لم يتم تحديد الفرع'},
            status=status.HTTP_400_BAD_REQUEST
        )

    customer_id = request.data.get('customer_id')
    items_data = request.data.get('items', [])
    payment_method = request.data.get('payment_method', 'cash')
    discount = Decimal(request.data.get('discount', '0'))

    if not items_data:
        return Response(
            {'error': 'لا توجد منتجات'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        customer = Customer.objects.get(
            id=customer_id) if customer_id else None
    except Customer.DoesNotExist:
        customer = None

    # حساب الإجماليات
    subtotal = Decimal('0')
    order_items = []

    for item in items_data:
        try:
            variant = ProductVariant.objects.get(id=item['variant_id'])
            quantity = item.get('quantity', 1)
            price = Decimal(item.get('price', str(variant.price)))

            subtotal += price * quantity
            order_items.append({
                'variant': variant,
                'quantity': quantity,
                'price': price,
            })
        except ProductVariant.DoesNotExist:
            return Response(
                {'error': f'المنتج {item["variant_id"]} غير موجود'},
                status=status.HTTP_404_NOT_FOUND
            )

    # حساب الضريبة والإجمالي
    tax_rate = Decimal('0.15')
    discounted_subtotal = subtotal - discount
    tax_amount = discounted_subtotal * tax_rate
    total_amount = discounted_subtotal + tax_amount

    # إنشاء الطلب
    from django.db import transaction

    with transaction.atomic():
        order = Order.objects.create(
            branch=branch,
            customer=customer,
            order_type='cash',
            payment_method=payment_method,
            subtotal=subtotal,
            discount_amount=discount,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            total_amount=total_amount,
            paid_amount=total_amount if payment_method == 'cash' else Decimal(
                '0'),
            payment_status='paid' if payment_method == 'cash' else 'pending',
            status='confirmed',
        )

        for item in order_items:
            OrderItem.objects.create(
                order=order,
                product_variant=item['variant'],
                quantity=item['quantity'],
                unit_price=item['price'],
            )

    return Response({
        'success': True,
        'order_id': order.id,
        'order_number': order.order_number,
        'total': str(total_amount),
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mobile_sync_data(request):
    """
    مزامنة البيانات للموبايل (offline-first)

    يعيد فقط التغييرات منذ آخر مزامنة
    """
    last_sync = request.query_params.get('since')
    branch_id = request.query_params.get('branch_id')

    from apps.products.models import ProductVariant
    from apps.crm.models import Customer

    data = {
        'products': [],
        'customers': [],
        'timestamp': timezone.now().isoformat(),
    }

    # المنتجات المحدثة
    products_filter = {'is_active': True}
    if last_sync:
        products_filter['updated_at__gte'] = last_sync

    products = ProductVariant.objects.filter(
        **products_filter
    ).select_related('product').values(
        'id', 'sku', 'price', 'product__name',
        'updated_at'
    )[:500]  # حد أقصى

    data['products'] = list(products)

    # العملاء المحدثين
    customers_filter = {}
    if last_sync:
        customers_filter['updated_at__gte'] = last_sync

    customers = Customer.objects.filter(
        **customers_filter
    ).values(
        'id', 'first_name', 'last_name', 'phone',
        'pricing_tier', 'updated_at'
    )[:500]

    data['customers'] = list(customers)

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mobile_order_detail(request, order_id):
    """
    تفاصيل الطلب للموبايل - محسن
    """
    from apps.sales.models import Order

    try:
        order = Order.objects.select_related(
            'customer', 'branch'
        ).prefetch_related(
            'items__product_variant__product'
        ).get(id=order_id)
    except Order.DoesNotExist:
        return Response(
            {'error': 'الطلب غير موجود'},
            status=status.HTTP_404_NOT_FOUND
        )

    items = [
        {
            'id': item.id,
            'name': item.product_variant.product.name if item.product_variant else 'N/A',
            'sku': item.product_variant.sku if item.product_variant else 'N/A',
            'quantity': item.quantity,
            'price': str(item.unit_price),
            'total': str(item.total_price),
        }
        for item in order.items.all()
    ]

    return Response({
        'id': order.id,
        'order_number': order.order_number,
        'status': order.status,
        'payment_status': order.payment_status,
        'customer': {
            'id': order.customer.id,
            'name': order.customer.full_name,
        } if order.customer else None,
        'branch': order.branch.name if order.branch else None,
        'items': items,
        'subtotal': str(order.subtotal),
        'discount': str(order.discount_amount),
        'tax': str(order.tax_amount),
        'total': str(order.total_amount),
        'paid': str(order.paid_amount),
        'remaining': str(order.remaining_amount),
        'created_at': order.created_at.isoformat(),
    })
