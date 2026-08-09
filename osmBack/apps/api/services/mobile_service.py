from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.sales.models import Order
from apps.products.models import Stock, ProductVariant
from apps.crm.models import Customer


class MobileService:
    @staticmethod
    def get_dashboard_data(user, branch_id=None):
        if not branch_id and hasattr(user, 'branches'):
            branches = user.branches.all()
            if branches.exists():
                branch_id = branches.first().id

        today = timezone.now().date()

        # Today's Statistics
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

        # Recent Orders
        recent_orders = Order.objects.filter(
            **({} if not branch_id else {'branch_id': branch_id})
        ).select_related('customer').order_by('-created_at')[:5]

        recent_orders_data = [
            {
                'id': o.id,
                'order_number': o.order_number,
                'customer_name': o.customer.full_name if o.customer else str(_('Customer')),
                'total': str(o.total_amount),
                'status': o.status,
                'time': o.created_at.strftime('%H:%M'),
            }
            for o in recent_orders
        ]

        # Alerts
        alerts = []
        pending_count = Order.objects.filter(
            status='pending',
            **({} if not branch_id else {'branch_id': branch_id})
        ).count()
        if pending_count > 0:
            alerts.append({
                'type': 'warning',
                'title': str(_('Pending Orders')),
                'message': str(_("{count} orders awaiting confirmation").format(count=pending_count)),
                'action': 'orders_pending',
            })

        if branch_id:
            low_stock = Stock.objects.filter(
                branch_id=branch_id,
                quantity__lte=F('min_quantity'),
                quantity__gt=0
            ).count()
            if low_stock > 0:
                alerts.append({
                    'type': 'alert',
                    'title': str(_('Low Stock')),
                    'message': str(_('{count} products need reordering').format(count=low_stock)),
                    'action': 'low_stock',
                })

        # User Performance
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

        return {
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
        }

    @staticmethod
    def search_products(query, limit=20, branch_id=None):
        if len(query) < 2:
            return []

        variants = ProductVariant.objects.filter(
            Q(sku__icontains=query) |
            Q(product__name__icontains=query) |
            Q(product__model__icontains=query)
        ).select_related('product').only(
            'id', 'sku', 'price', 'product__name', 'product_id'
        )[:limit]

        stock_map = {}
        if branch_id:
            stocks = Stock.objects.filter(
                branch_id=branch_id,
                variant_id__in=[v.id for v in variants]
            ).values('variant_id', 'quantity')
            stock_map = {s['variant_id']: s['quantity'] for s in stocks}

        return [
            {
                'id': v.id,
                'sku': v.sku,
                'name': v.product.name,
                'price': str(v.price),
                'stock': stock_map.get(v.id, 0),
            }
            for v in variants
        ]

    @staticmethod
    def search_customers(query, limit=10):
        if len(query) < 2:
            return []

        customers = Customer.objects.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(phone__icontains=query) |
            Q(identification_number__icontains=query)
        ).only(
            'id', 'first_name', 'last_name', 'phone'
        )[:limit]

        return [
            {
                'id': c.id,
                'name': c.full_name,
                'phone': c.phone,
                'tier': 'retail',
                'has_credit': False,
            }
            for c in customers
        ]

    @staticmethod
    def sync_data(last_sync=None, branch_id=None):
        data = {
            'products': [],
            'customers': [],
            'timestamp': timezone.now().isoformat(),
        }

        products_filter = {'is_active': True}
        if last_sync:
            products_filter['updated_at__gte'] = last_sync

        products = ProductVariant.objects.filter(
            **products_filter
        ).select_related('product').values(
            'id', 'sku', 'price', 'product__name',
            'updated_at'
        )[:500]

        data['products'] = list(products)

        customers_filter = {}
        if last_sync:
            customers_filter['updated_at__gte'] = last_sync

        customers = Customer.objects.filter(
            **customers_filter
        ).values(
            'id', 'first_name', 'last_name', 'phone',
            'updated_at'
        )[:500]

        data['customers'] = list(customers)

        return data
