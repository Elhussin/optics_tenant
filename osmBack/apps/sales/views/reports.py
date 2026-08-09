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

        from apps.sales.services import SalesReportService
        summary = SalesReportService.get_sales_summary(from_date, to_date, branch_ids, branch_id)
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

        from apps.sales.services import SalesReportService
        daily_sales = SalesReportService.get_sales_by_date(from_date, branch_ids, branch_id)
        return Response(daily_sales)


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

        from apps.sales.services import InventoryReportService
        summary = InventoryReportService.get_inventory_summary(branch_ids, branch_id)
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

        from apps.sales.services import InventoryReportService
        result = InventoryReportService.get_stock_movements(from_date, branch_ids, branch_id, movement_type)
        return Response(result)


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

        from apps.sales.services import InventoryReportService
        top = InventoryReportService.get_top_products(from_date, limit, branch_ids, branch_id)
        return Response(top)


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

        from apps.sales.services import SalesReportService
        comparison = SalesReportService.get_branch_comparison(from_date, branch_ids)
        return Response(comparison)


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

        from apps.sales.services import SalesReportService
        dashboard = SalesReportService.get_financial_dashboard(from_date, branch_ids, branch_id, period)
        return Response(dashboard)


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

        from apps.sales.services import SalesReportService
        aging = SalesReportService.get_receivables_aging(branch_ids, branch_id)
        return Response(aging)


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

        from apps.sales.services import SalesReportService
        pending = SalesReportService.get_pending_orders(branch_ids, branch_id)
        return Response(pending)


class AsyncFinancialDashboardView(APIView):
    """
    Trigger async generation of the financial dashboard report
    which generates a PDF and sends it via email.
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=REPORT_ROLES, super_roles=SUPER_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='start_date', description='YYYY-MM-DD', required=False, type=str),
            OpenApiParameter(name='end_date', description='YYYY-MM-DD', required=False, type=str),
            OpenApiParameter(name='branch_id', required=False, type=int),
            OpenApiParameter(name='email', description='Target email', required=True, type=str),
        ],
        responses={
            202: inline_serializer(
                name='AsyncReportResponse',
                fields={'message': serializers.CharField()}
            )
        }
    )
    def get(self, request):
        email = request.query_params.get('email')
        if not email:
            return Response({'error': 'email is required'}, status=400)

        branch_id = request.query_params.get('branch_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        from apps.sales.tasks import async_generate_financial_report
        from django.db import connection

        # Trigger Celery Task
        async_generate_financial_report.delay(
            schema_name=connection.schema_name,
            branch_id=branch_id,
            start_date=start_date,
            end_date=end_date,
            email=email
        )

        return Response({
            'message': 'Report generation started. It will be sent to your email.'
        }, status=202)
