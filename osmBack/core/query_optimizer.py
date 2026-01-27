# core/query_optimizer.py
"""
Query Optimization Tools
"""

from django.db.models import Prefetch, Q, Count, Sum
from django.db.models.query import QuerySet
from functools import wraps
import logging
import time

logger = logging.getLogger(__name__)


class QueryOptimizer:
    """
    Tools to optimize Django ORM queries
    """

    # Common select_related relations
    COMMON_RELATIONS = {
        'Order': {
            'select': ['branch', 'customer', 'partner', 'customer_partner_link'],
            'prefetch': ['items', 'items__product_variant'],
        },
        'Invoice': {
            'select': ['branch', 'customer', 'order', 'created_by'],
            'prefetch': ['items', 'items__product_variant', 'payments'],
        },
        'Payment': {
            'select': ['invoice', 'order', 'partner'],
            'prefetch': ['installments'],
        },
        'Customer': {
            'select': ['created_by', 'sales_representative'],
            'prefetch': ['partner_links', 'partner_links__partner'],
        },
        'ProductVariant': {
            'select': ['product', 'product__brand', 'product__manufacturer'],
            'prefetch': ['stocks', 'price_rules'],
        },
        'GeneralJournal': {
            'select': ['posted_by'],
            'prefetch': ['lines', 'lines__account'],
        },
    }

    @classmethod
    def optimize(cls, queryset, include_prefetch=True):
        """
        Automatically optimize QuerySet based on model
        """
        model_name = queryset.model.__name__
        relations = cls.COMMON_RELATIONS.get(model_name, {})

        # select_related
        select_fields = relations.get('select', [])
        if select_fields:
            queryset = queryset.select_related(*select_fields)

        # prefetch_related
        if include_prefetch:
            prefetch_fields = relations.get('prefetch', [])
            if prefetch_fields:
                queryset = queryset.prefetch_related(*prefetch_fields)

        return queryset

    @classmethod
    def paginate_efficiently(cls, queryset, page=1, page_size=20):
        """
        Efficient pagination using LIMIT/OFFSET
        """
        offset = (page - 1) * page_size

        # Use only() or defer() to reduce data load if needed
        return queryset[offset:offset + page_size]

    @classmethod
    def count_efficiently(cls, queryset):
        """
        Efficiently count records
        """
        # Using COUNT(*) instead of COUNT(id) is sometimes faster
        return queryset.count()

    @classmethod
    def bulk_create_optimized(cls, model, objects, batch_size=1000):
        """
        Efficiently create batches
        """
        return model.objects.bulk_create(
            objects,
            batch_size=batch_size,
            ignore_conflicts=False,
        )

    @classmethod
    def bulk_update_optimized(cls, queryset, fields, batch_size=1000):
        """
        Efficiently update batches
        """
        return queryset.model.objects.bulk_update(
            list(queryset),
            fields,
            batch_size=batch_size,
        )


def query_debugger(func):
    """
    Decorator to track query count
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        from django.db import connection, reset_queries
        from django.conf import settings

        if not settings.DEBUG:
            return func(*args, **kwargs)

        reset_queries()
        start_time = time.time()

        result = func(*args, **kwargs)

        end_time = time.time()
        queries = connection.queries

        logger.info(
            f"[{func.__name__}] "
            f"Queries: {len(queries)}, "
            f"Time: {end_time - start_time:.3f}s"
        )

        # Warning if query count is high
        if len(queries) > 10:
            logger.warning(
                f"[{func.__name__}] High query count! ({len(queries)})"
            )

        return result
    return wrapper


# ═══════════════════════════════════════════════════════════════════════════════
# Optimized Managers
# ═══════════════════════════════════════════════════════════════════════════════

class OptimizedManager:
    """
    Mixin to add optimized queries to Manager
    """

    def optimized(self):
        """Optimized QuerySet"""
        return QueryOptimizer.optimize(self.get_queryset())

    def list_optimized(self, page=1, page_size=20):
        """Optimized list with pagination"""
        qs = self.optimized()
        return QueryOptimizer.paginate_efficiently(qs, page, page_size)

    def detail_optimized(self, pk):
        """Optimized details"""
        return self.optimized().get(pk=pk)


# ═══════════════════════════════════════════════════════════════════════════════
# Optimized QuerySets
# ═══════════════════════════════════════════════════════════════════════════════

class OrderQuerySet(QuerySet):
    """Optimized QuerySet for Orders"""

    def with_relations(self):
        return self.select_related(
            'branch', 'customer', 'partner'
        ).prefetch_related(
            'items__product_variant__product'
        )

    def by_branch(self, branch_id):
        return self.filter(branch_id=branch_id)

    def by_status(self, status):
        return self.filter(status=status)

    def pending_only(self):
        return self.filter(status='pending')

    def today_only(self):
        from django.utils import timezone
        today = timezone.now().date()
        return self.filter(created_at__date=today)

    def with_totals(self):
        """Add totals"""
        return self.annotate(
            items_count=Count('items'),
            total_quantity=Sum('items__quantity'),
        )

    def summary(self):
        """Total summary"""
        return self.aggregate(
            count=Count('id'),
            total=Sum('total_amount'),
            discount=Sum('discount_amount'),
        )


class InvoiceQuerySet(QuerySet):
    """Optimized QuerySet for Invoices"""

    def with_relations(self):
        return self.select_related(
            'branch', 'customer', 'order'
        ).prefetch_related(
            'items__product_variant', 'payments'
        )

    def unpaid(self):
        return self.exclude(status='paid')

    def by_customer(self, customer_id):
        return self.filter(customer_id=customer_id)

    def with_payment_info(self):
        return self.annotate(
            payments_total=Sum('payments__amount'),
            payments_count=Count('payments'),
        )


class ProductVariantQuerySet(QuerySet):
    """Optimized QuerySet for Products"""

    def with_relations(self):
        return self.select_related(
            'product', 'product__brand', 'product__manufacturer'
        )

    def active_only(self):
        return self.filter(is_active=True, product__is_active=True)

    def in_stock(self, branch_id=None):
        """Products available in stock"""
        from apps.products.models import Stock

        qs = self.active_only()
        if branch_id:
            variant_ids = Stock.objects.filter(
                branch_id=branch_id,
                quantity__gt=0
            ).values_list('variant_id', flat=True)
            qs = qs.filter(id__in=variant_ids)

        return qs

    def with_stock(self, branch_id):
        """With stock information"""
        from apps.products.models import Stock

        return self.prefetch_related(
            Prefetch(
                'stocks',
                queryset=Stock.objects.filter(branch_id=branch_id),
            )
        )


# ═══════════════════════════════════════════════════════════════════════════════
# Reporting Optimizers
# ═══════════════════════════════════════════════════════════════════════════════

class ReportOptimizer:
    """
    Report query optimization
    """

    @staticmethod
    def sales_by_date(start_date, end_date, branch_id=None):
        """Sales by date - Optimized"""
        from apps.sales.models import Order
        from django.db.models.functions import TruncDate

        qs = Order.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            status__in=['confirmed', 'delivered'],
        )

        if branch_id:
            qs = qs.filter(branch_id=branch_id)

        return qs.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            count=Count('id'),
            total=Sum('total_amount'),
        ).order_by('date')

    @staticmethod
    def top_products(limit=10, branch_id=None, days=30):
        """Top selling products - Optimized"""
        from apps.sales.models import OrderItem
        from django.utils import timezone
        from datetime import timedelta

        since = timezone.now() - timedelta(days=days)

        qs = OrderItem.objects.filter(
            order__created_at__gte=since,
            order__status__in=['confirmed', 'delivered'],
        )

        if branch_id:
            qs = qs.filter(order__branch_id=branch_id)

        return qs.values(
            'product_variant_id',
            'product_variant__product__name',
        ).annotate(
            sold=Sum('quantity'),
            revenue=Sum('total_price'),
        ).order_by('-sold')[:limit]

    @staticmethod
    def customer_summary(customer_id):
        """Customer summary - Optimized"""
        from apps.sales.models import Order, Payment
        from apps.crm.models import Customer

        customer = Customer.objects.only(
            'id', 'first_name', 'last_name',
            'credit_limit', 'current_balance', 'pricing_tier'
        ).get(id=customer_id)

        orders_summary = Order.objects.filter(
            customer_id=customer_id
        ).aggregate(
            total_orders=Count('id'),
            total_spent=Sum('total_amount'),
            avg_order=Sum('total_amount') / Count('id'),
        )

        return {
            'customer': customer,
            **orders_summary,
        }
