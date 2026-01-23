# apps/sales/views/wholesale.py
"""
Views للبيع بالجملة
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Count, Q
from django.utils import timezone
from decimal import Decimal

from apps.crm.models import Customer
from apps.sales.models import Order, Invoice, Payment
from apps.products.models import ProductVariant
from apps.sales.services.wholesale_service import WholesaleService
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

# الأدوار المسموحة
WHOLESALE_ROLES = ["SalesClerk", "BranchManager"]


@api_view(['POST'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=WHOLESALE_ROLES
    )
])
def get_wholesale_pricing(request):
    """
    حساب تسعير الجملة لعميل معين

    Request Body:
    {
        "customer_id": 1,
        "items": [
            {"variant_id": 1, "quantity": 10},
            {"variant_id": 2, "quantity": 5}
        ],
        "branch_id": 1  // اختياري
    }
    """
    customer_id = request.data.get('customer_id')
    items_data = request.data.get('items', [])
    branch_id = request.data.get('branch_id')

    if not customer_id or not items_data:
        return Response(
            {'error': 'customer_id و items مطلوبة'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return Response(
            {'error': 'العميل غير موجود'},
            status=status.HTTP_404_NOT_FOUND
        )

    # تجهيز العناصر
    items = []
    for item in items_data:
        try:
            variant = ProductVariant.objects.get(id=item['variant_id'])
            items.append({
                'variant': variant,
                'quantity': item.get('quantity', 1)
            })
        except ProductVariant.DoesNotExist:
            return Response(
                {'error': f'المنتج {item["variant_id"]} غير موجود'},
                status=status.HTTP_404_NOT_FOUND
            )

    # الفرع
    branch = None
    if branch_id:
        from apps.branches.models import Branch
        branch = Branch.objects.filter(id=branch_id).first()

    # حساب التسعير
    pricing = WholesaleService.get_order_pricing(customer, items, branch)

    # تحويل للـ JSON
    response_items = []
    for item in pricing['items']:
        response_items.append({
            'variant_id': item['variant'].id,
            'variant_name': str(item['variant']),
            'quantity': item['quantity'],
            'original_price': str(item['original_price']),
            'unit_price': str(item['unit_price']),
            'discount_type': item['discount_type'],
            'discount_source': item['discount_source'],
            'line_discount': str(item['line_discount']),
            'line_total': str(item['line_total']),
        })

    return Response({
        'customer': {
            'id': customer.id,
            'name': customer.full_name,
            'pricing_tier': customer.pricing_tier,
            'pricing_tier_display': customer.get_pricing_tier_display(),
            'default_discount': str(customer.default_discount_percentage),
        },
        'items': response_items,
        'subtotal': str(pricing['subtotal']),
        'line_discounts': str(pricing['line_discounts']),
        'customer_discount': str(pricing['customer_discount']),
        'total_discount': str(pricing['total_discount']),
        'final_total': str(pricing['final_total']),
    })


@api_view(['POST'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=WHOLESALE_ROLES
    )
])
def validate_wholesale_order(request):
    """
    التحقق من صحة طلب الجملة قبل إنشائه
    """
    customer_id = request.data.get('customer_id')
    items_data = request.data.get('items', [])
    use_credit = request.data.get('use_credit', False)

    if not customer_id or not items_data:
        return Response(
            {'error': 'customer_id و items مطلوبة'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return Response(
            {'error': 'العميل غير موجود'},
            status=status.HTTP_404_NOT_FOUND
        )

    # تجهيز العناصر
    items = []
    for item in items_data:
        try:
            variant = ProductVariant.objects.get(id=item['variant_id'])
            items.append({
                'variant': variant,
                'quantity': item.get('quantity', 1)
            })
        except ProductVariant.DoesNotExist:
            return Response({
                'is_valid': False,
                'errors': [f'المنتج {item["variant_id"]} غير موجود'],
            })

    is_valid, errors = WholesaleService.validate_wholesale_order(
        customer, items, use_credit
    )

    return Response({
        'is_valid': is_valid,
        'errors': errors,
        'customer_credit': {
            'credit_limit': str(customer.credit_limit),
            'current_balance': str(customer.current_balance),
            'available_credit': str(customer.available_credit),
            'credit_status': customer.credit_status,
        } if customer.credit_status == 'approved' else None,
    })


@api_view(['POST'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=WHOLESALE_ROLES
    )
])
def create_wholesale_order(request):
    """
    إنشاء طلب جملة

    Request Body:
    {
        "customer_id": 1,
        "branch_id": 1,
        "items": [
            {"variant_id": 1, "quantity": 10},
            {"variant_id": 2, "quantity": 5}
        ],
        "payment_method": "credit",  // credit, cash, card, etc.
        "notes": "ملاحظات"
    }
    """
    customer_id = request.data.get('customer_id')
    branch_id = request.data.get('branch_id')
    items_data = request.data.get('items', [])
    payment_method = request.data.get('payment_method', 'credit')
    notes = request.data.get('notes', '')

    if not customer_id or not branch_id or not items_data:
        return Response(
            {'error': 'customer_id و branch_id و items مطلوبة'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return Response(
            {'error': 'العميل غير موجود'},
            status=status.HTTP_404_NOT_FOUND
        )

    from apps.branches.models import Branch
    try:
        branch = Branch.objects.get(id=branch_id)
    except Branch.DoesNotExist:
        return Response(
            {'error': 'الفرع غير موجود'},
            status=status.HTTP_404_NOT_FOUND
        )

    # تجهيز العناصر
    items = []
    for item in items_data:
        try:
            variant = ProductVariant.objects.get(id=item['variant_id'])
            items.append({
                'variant': variant,
                'quantity': item.get('quantity', 1)
            })
        except ProductVariant.DoesNotExist:
            return Response(
                {'error': f'المنتج {item["variant_id"]} غير موجود'},
                status=status.HTTP_404_NOT_FOUND
            )

    try:
        order = WholesaleService.create_wholesale_order(
            customer=customer,
            items=items,
            branch=branch,
            user=request.user,
            payment_method=payment_method,
            notes=notes
        )

        return Response({
            'status': 'success',
            'message': 'تم إنشاء طلب الجملة بنجاح',
            'order': {
                'id': order.id,
                'order_number': order.order_number,
                'total_amount': str(order.total_amount),
                'discount_amount': str(order.discount_amount),
                'status': order.status,
            }
        }, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=WHOLESALE_ROLES
    )
])
def customer_statement(request, customer_id):
    """
    كشف حساب العميل
    """
    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return Response(
            {'error': 'العميل غير موجود'},
            status=status.HTTP_404_NOT_FOUND
        )

    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    statement = WholesaleService.get_customer_statement(
        customer, start_date, end_date
    )

    return Response({
        'customer': {
            'id': customer.id,
            'name': customer.full_name,
            'credit_limit': str(customer.credit_limit),
            'current_balance': str(customer.current_balance),
        },
        'period': {
            'start_date': start_date,
            'end_date': end_date,
        },
        'opening_balance': str(statement['opening_balance']),
        'transactions': [
            {
                'date': t['date'].isoformat() if hasattr(t['date'], 'isoformat') else str(t['date']),
                'type': t['type'],
                'reference': t['reference'],
                'debit': str(t['debit']),
                'credit': str(t['credit']),
                'balance': str(t['balance']),
            }
            for t in statement['transactions']
        ],
        'closing_balance': str(statement['closing_balance']),
        'summary': {
            'total_invoices': str(statement['total_invoices']),
            'total_payments': str(statement['total_payments']),
        }
    })


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=WHOLESALE_ROLES
    )
])
def wholesale_customers(request):
    """
    قائمة عملاء الجملة
    """
    customers = Customer.objects.filter(
        Q(customer_type__in=['wholesaler', 'distributor']) |
        Q(pricing_tier__in=['wholesale_1',
          'wholesale_2', 'wholesale_3', 'distributor'])
    ).values(
        'id', 'first_name', 'last_name', 'customer_type', 'pricing_tier',
        'credit_limit', 'current_balance', 'credit_status',
        'payment_terms_days', 'minimum_order_amount'
    )

    return Response(list(customers))


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=WHOLESALE_ROLES
    )
])
def wholesale_dashboard(request):
    """
    لوحة تحكم البيع بالجملة
    """
    today = timezone.now().date()
    month_start = today.replace(day=1)

    # إجمالي طلبات الجملة
    wholesale_orders = Order.objects.filter(order_type='wholesale')

    # إحصائيات الشهر
    month_orders = wholesale_orders.filter(created_at__date__gte=month_start)
    month_stats = month_orders.aggregate(
        count=Count('id'),
        total=Sum('total_amount'),
        discount=Sum('discount_amount'),
    )

    # العملاء الأكثر شراءً
    top_customers = wholesale_orders.filter(
        created_at__date__gte=month_start
    ).values('customer__first_name', 'customer__last_name', 'customer_id').annotate(
        total=Sum('total_amount'),
        orders_count=Count('id')
    ).order_by('-total')[:10]

    # الذمم المستحقة
    receivables = Customer.objects.filter(
        current_balance__gt=0
    ).aggregate(
        total=Sum('current_balance'),
        count=Count('id')
    )

    # المتأخرين
    overdue_customers = Customer.objects.filter(
        current_balance__gt=0,
        payment_terms_days__gt=0
    ).count()

    return Response({
        'month_stats': {
            'orders_count': month_stats['count'] or 0,
            'total_sales': str(month_stats['total'] or 0),
            'total_discount': str(month_stats['discount'] or 0),
        },
        'top_customers': [
            {
                'customer_id': c['customer_id'],
                'name': f"{c['customer__first_name']} {c['customer__last_name']}",
                'total': str(c['total'] or 0),
                'orders_count': c['orders_count'],
            }
            for c in top_customers
        ],
        'receivables': {
            'total': str(receivables['total'] or 0),
            'customers_count': receivables['count'] or 0,
        },
        'overdue_count': overdue_customers,
    })


@api_view(['POST'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=['FinanceOfficer', 'BranchManager']
    )
])
def update_customer_credit(request, customer_id):
    """
    تحديث ائتمان العميل
    """
    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return Response(
            {'error': 'العميل غير موجود'},
            status=status.HTTP_404_NOT_FOUND
        )

    credit_limit = request.data.get('credit_limit')
    credit_status = request.data.get('credit_status')
    payment_terms_days = request.data.get('payment_terms_days')
    pricing_tier = request.data.get('pricing_tier')
    default_discount = request.data.get('default_discount_percentage')

    if credit_limit is not None:
        customer.credit_limit = Decimal(str(credit_limit))
    if credit_status:
        customer.credit_status = credit_status
    if payment_terms_days is not None:
        customer.payment_terms_days = payment_terms_days
    if pricing_tier:
        customer.pricing_tier = pricing_tier
    if default_discount is not None:
        customer.default_discount_percentage = Decimal(str(default_discount))

    customer.save()

    return Response({
        'status': 'success',
        'message': 'تم تحديث بيانات الائتمان',
        'customer': {
            'id': customer.id,
            'credit_limit': str(customer.credit_limit),
            'credit_status': customer.credit_status,
            'pricing_tier': customer.pricing_tier,
            'available_credit': str(customer.available_credit),
        }
    })
