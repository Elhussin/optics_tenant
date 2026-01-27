# apps/sales/views/reports.py
"""
Sales and Inventory Reports
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from django.db.models import Sum, Count, Avg, F, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter

from apps.sales.models import Order, Invoice, Payment, OrderItem
from apps.products.models import Stock, StockMovement
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

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


class SalesSummaryView(APIView):
    """
    Sales Summary
    Parameters:
        - branch_id: optional
        - from_date: YYYY-MM-DD
        - to_date: YYYY-MM-DD
        - period: today, week, month, year
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='branch_id', required=False, type=int),
            OpenApiParameter(name='from_date', required=False, type=str),
            OpenApiParameter(name='to_date', required=False, type=str),
            OpenApiParameter(name='period', required=False, type=str, enum=[
                             'today', 'week', 'month', 'year']),
        ],
        responses={
            200: inline_serializer(
                name='SalesSummaryResponse',
                fields={
                    'total_orders': serializers.IntegerField(),
                    'total_revenue': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'total_tax': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'total_discount': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'avg_order_value': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'payments': inline_serializer(
                        name='SalesSummaryPayments',
                        fields={
                            'total': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'cash': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'card': serializers.DecimalField(max_digits=20, decimal_places=2),
                        }
                    )
                }
            )
        }
    )
    def get(self, request):
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
        else:
            # Default fallback if nothing provided
            from_date = today.replace(day=1)
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
                    '0') if 'total' in key or 'avg' in key or 'revenue' in key else 0

        # Payment breakdown
        payments = Payment.objects.filter(
            invoice__order__in=orders
        ).aggregate(
            total_payments=Sum('amount'),
            cash_payments=Sum('amount', filter=Q(payment_method='cash')),
            card_payments=Sum('amount', filter=Q(payment_method='card')),
        )

        summary['payments'] = {
            'total': payments['total_payments'] or Decimal('0'),
            'cash': payments['cash_payments'] or Decimal('0'),
            'card': payments['card_payments'] or Decimal('0'),
        }

        return Response(summary)


class SalesByDateView(APIView):
    """
    Sales by Date (for charts)
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='branch_id', required=False, type=int),
            OpenApiParameter(name='days', required=False, type=int,
                             description='Number of days to look back'),
        ],
        responses={
            200: inline_serializer(
                name='SalesByDateResponse',
                fields={
                    'date': serializers.DateField(),
                    'orders_count': serializers.IntegerField(),
                    'revenue': serializers.DecimalField(max_digits=20, decimal_places=2),
                },
                many=True
            )
        }
    )
    def get(self, request):
        branch_ids = get_user_branch_ids(request.user)
        branch_id = request.query_params.get('branch_id')
        days_param = request.query_params.get('days', 30)
        try:
            days = int(days_param)
        except ValueError:
            days = 30

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


class InventorySummaryView(APIView):
    """
    Inventory Summary
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='branch_id', required=False, type=int),
        ],
        responses={
            200: inline_serializer(
                name='InventorySummaryResponse',
                fields={
                    'total_items': serializers.IntegerField(),
                    'total_quantity': serializers.IntegerField(),
                    'total_reserved': serializers.IntegerField(),
                    'total_value': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'low_stock_count': serializers.IntegerField(),
                    'out_of_stock_count': serializers.IntegerField(),
                }
            )
        }
    )
    def get(self, request):
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


class StockMovementsReportView(APIView):
    """
    Stock Movements Report
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='branch_id', required=False, type=int),
            OpenApiParameter(name='movement_type', required=False, type=str),
            OpenApiParameter(name='days', required=False, type=int),
        ],
        responses={
            200: inline_serializer(
                name='StockMovementsReportResponse',
                fields={
                    'by_type': inline_serializer(
                        name='StockMovementByType',
                        fields={
                            'movement_type': serializers.CharField(),
                            'count': serializers.IntegerField(),
                            'total_quantity': serializers.IntegerField()
                        },
                        many=True
                    ),
                    'total_movements': serializers.IntegerField()
                }
            )
        }
    )
    def get(self, request):
        branch_ids = get_user_branch_ids(request.user)
        branch_id = request.query_params.get('branch_id')
        movement_type = request.query_params.get('movement_type')
        days_param = request.query_params.get('days', 30)
        try:
            days = int(days_param)
        except ValueError:
            days = 30

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


class TopProductsView(APIView):
    """
    Top Selling Products
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='branch_id', required=False, type=int),
            OpenApiParameter(name='limit', required=False,
                             type=int, description='Limit results'),
            OpenApiParameter(name='days', required=False, type=int),
        ],
        responses={
            200: inline_serializer(
                name='TopProductsResponse',
                fields={
                    'product_variant_id': serializers.IntegerField(),
                    'product_name': serializers.CharField(),
                    'variant_name': serializers.CharField(),
                    'total_sold': serializers.IntegerField(),
                    'total_revenue': serializers.DecimalField(max_digits=20, decimal_places=2),
                },
                many=True
            )
        }
    )
    def get(self, request):
        branch_ids = get_user_branch_ids(request.user)
        branch_id = request.query_params.get('branch_id')
        limit_param = request.query_params.get('limit', 10)
        days_param = request.query_params.get('days', 30)
        try:
            limit = int(limit_param)
        except ValueError:
            limit = 10
        try:
            days = int(days_param)
        except ValueError:
            days = 30

        from_date = timezone.now() - timedelta(days=days)

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


class BranchComparisonView(APIView):
    """
    Branch Performance Comparison
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='days', required=False, type=int),
        ],
        responses={
            200: inline_serializer(
                name='BranchComparisonResponse',
                fields={
                    'branch_id': serializers.IntegerField(),
                    'branch_name': serializers.CharField(),
                    'orders_count': serializers.IntegerField(),
                    'total_revenue': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'avg_order': serializers.DecimalField(max_digits=20, decimal_places=2),
                },
                many=True
            )
        }
    )
    def get(self, request):
        branch_ids = get_user_branch_ids(request.user)
        days_param = request.query_params.get('days', 30)
        try:
            days = int(days_param)
        except ValueError:
            days = 30

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
# Comprehensive Financial Reports
# ═══════════════════════════════════════════════════════════════════════════════

class FinancialDashboardView(APIView):
    """
    Comprehensive Financial Dashboard
    Includes:
    - Total Invoices
    - Total Payments
    - Pending Amounts (Unpaid)
    - Discounts
    - Taxes
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='branch_id', required=False, type=int),
            OpenApiParameter(name='period', required=False, type=str, enum=[
                             'today', 'week', 'month', 'year']),
        ],
        responses={
            200: inline_serializer(
                name='FinancialDashboardResponse',
                fields={
                    'period': serializers.CharField(),
                    'from_date': serializers.CharField(),
                    'sales': inline_serializer(
                        name='FinancialDashboardSales',
                        fields={
                            'invoices_count': serializers.IntegerField(),
                            'gross_total': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'tax_collected': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'discounts_given': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'net_total': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'amount_received': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'pending_amount': serializers.DecimalField(max_digits=20, decimal_places=2),
                        }
                    ),
                    'purchases': inline_serializer(
                        name='FinancialDashboardPurchases',
                        fields={
                            'invoices_count': serializers.IntegerField(),
                            'total': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'paid': serializers.DecimalField(max_digits=20, decimal_places=2),
                        }
                    ),
                    'returns': inline_serializer(
                        name='FinancialDashboardReturns',
                        fields={
                            'count': serializers.IntegerField(),
                            'total': serializers.DecimalField(max_digits=20, decimal_places=2),
                        }
                    ),
                    'payments': inline_serializer(
                        name='FinancialDashboardPayments',
                        fields={
                            'total': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'by_method': inline_serializer(
                                name='FinancialDashboardPaymentsByMethod',
                                fields={
                                    'cash': serializers.DecimalField(max_digits=20, decimal_places=2),
                                    'card': serializers.DecimalField(max_digits=20, decimal_places=2),
                                }
                            )
                        }
                    ),
                    'reserved_inventory': inline_serializer(
                        name='FinancialDashboardReservedInv',
                        fields={
                            'quantity': serializers.IntegerField(),
                            'estimated_value': serializers.DecimalField(max_digits=20, decimal_places=2),
                        }
                    )
                }
            )
        }
    )
    def get(self, request):
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
        # Invoices
        # ─────────────────────────────────────────
        invoices = Invoice.objects.filter(created_at__date__gte=from_date)

        if branch_ids is not None:
            invoices = invoices.filter(branch_id__in=branch_ids)
        if branch_id:
            invoices = invoices.filter(branch_id=branch_id)

        # Sale Invoices
        sale_invoices = invoices.filter(invoice_type='sale')
        sale_summary = sale_invoices.aggregate(
            count=Count('id'),
            total=Sum('total_amount'),
            subtotal=Sum('subtotal'),
            tax=Sum('tax_amount'),
            discount=Sum('discount_amount'),
            paid=Sum('paid_amount'),
        )

        # Purchase Invoices (from suppliers)
        purchase_invoices = invoices.filter(invoice_type='purchase')
        purchase_summary = purchase_invoices.aggregate(
            count=Count('id'),
            total=Sum('total_amount'),
            paid=Sum('paid_amount'),
        )

        # Return Invoices
        return_invoices = invoices.filter(
            invoice_type__in=['return_sale', 'return_purchase'])
        return_summary = return_invoices.aggregate(
            count=Count('id'),
            total=Sum('total_amount'),
        )

        # ─────────────────────────────────────────
        # Pending Amounts (Accounts Receivable)
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
        # Payments
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
        # Reserved Inventory
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
        # Final Result
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


class ReceivablesAgingView(APIView):
    """
    Receivables Aging Report (Due Amounts)
    Shows unpaid invoices by age
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='branch_id', required=False, type=int),
        ],
        responses={
            200: inline_serializer(
                name='ReceivablesAgingResponse',
                fields={
                    'aging': inline_serializer(
                        name='AgingBuckets',
                        fields={
                            'current': inline_serializer(name='AgingBucketCurrent', fields={'days': serializers.CharField(), 'count': serializers.IntegerField(), 'amount': serializers.DecimalField(max_digits=20, decimal_places=2)}),
                            'days_31_60': inline_serializer(name='AgingBucket3160', fields={'days': serializers.CharField(), 'count': serializers.IntegerField(), 'amount': serializers.DecimalField(max_digits=20, decimal_places=2)}),
                            'days_61_90': inline_serializer(name='AgingBucket6190', fields={'days': serializers.CharField(), 'count': serializers.IntegerField(), 'amount': serializers.DecimalField(max_digits=20, decimal_places=2)}),
                            'over_90': inline_serializer(name='AgingBucket90Plus', fields={'days': serializers.CharField(), 'count': serializers.IntegerField(), 'amount': serializers.DecimalField(max_digits=20, decimal_places=2)}),
                        }
                    ),
                    'total_pending': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'invoices_count': serializers.IntegerField(),
                }
            )
        }
    )
    def get(self, request):
        branch_ids = get_user_branch_ids(request.user)
        branch_id = request.query_params.get('branch_id')

        today = timezone.now().date()

        # Invoices not fully paid
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

        # Classification by age
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


class PendingOrdersView(APIView):
    """
    Pending Orders (Not Delivered)
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='branch_id', required=False, type=int),
        ],
        responses={
            200: inline_serializer(
                name='PendingOrdersResponse',
                fields={
                    'by_status': inline_serializer(
                        name='PendingOrdersByStatus',
                        fields={
                            'status': serializers.CharField(),
                            'count': serializers.IntegerField(),
                            'total_value': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'paid_amount': serializers.DecimalField(max_digits=20, decimal_places=2),
                        },
                        many=True
                    ),
                    'total': inline_serializer(
                        name='PendingOrdersTotal',
                        fields={
                            'count': serializers.IntegerField(),
                            'total_value': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'reserved_items': serializers.IntegerField(),
                        }
                    )
                }
            )
        }
    )
    def get(self, request):
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
