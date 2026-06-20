# apps/api/views_mobile.py
"""
Optimized Mobile APIs
APIs designed to minimize data consumption and request count
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import timedelta
from decimal import Decimal
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from rest_framework import serializers

from core.caching import cache_result, CacheManager, SHORT_CACHE_TTL
from core.query_optimizer import QueryOptimizer
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired


class MobileDashboardView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            required_permissions=["view_dashboard"])
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='branch_id', required=False, type=int),
        ],
        responses={
            200: inline_serializer(
                name='MobileDashboardResponse',
                fields={
                    'today': inline_serializer(
                        name='MobileDashboardTodayStats',
                        fields={
                            'orders_count': serializers.IntegerField(),
                            'total_sales': serializers.CharField(),
                            'cash_sales': serializers.CharField(),
                            'card_sales': serializers.CharField(),
                        }
                    ),
                    'recent_orders': inline_serializer(
                        name='MobileDashboardOrder',
                        fields={
                            'id': serializers.IntegerField(),
                            'order_number': serializers.CharField(),
                            'customer_name': serializers.CharField(),
                            'total': serializers.CharField(),
                            'status': serializers.CharField(),
                            'time': serializers.CharField(),
                        },
                        many=True
                    ),
                    'alerts': inline_serializer(
                        name='MobileDashboardAlert',
                        fields={
                            'type': serializers.CharField(),
                            'title': serializers.CharField(),
                            'message': serializers.CharField(),
                            'action': serializers.CharField(),
                        },
                        many=True
                    ),
                    'user_performance': inline_serializer(
                        name='MobileUserPerformance',
                        fields={
                            'orders': serializers.IntegerField(),
                            'sales': serializers.CharField(),
                        },
                        allow_null=True
                    ),
                    'timestamp': serializers.CharField(),
                }
            )
        }
    )
    def get(self, request):
        """
        Mobile Dashboard - All data in one request

        Aggregates:
        - Today's statistics
        - Recent orders
        - Alerts
        - User performance
        """
        user = request.user
        branch_id = request.query_params.get('branch_id')

        # Get branch from user if not specified
        if not branch_id and hasattr(user, 'branches'):
            branches = user.branches.all()
            if branches.exists():
                branch_id = branches.first().id

        from apps.sales.models import Order, Invoice, Payment
        from apps.products.models import Stock

        today = timezone.now().date()

        # ═══ Today's Statistics ═══
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

        # ═══ Recent Orders ═══
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

        # ═══ Alerts ═══
        alerts = []

        # Pending Orders
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

        # Low Stock
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

        # ═══ User Performance (for employees) ═══
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


class MobileProductSearchView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            required_permissions=["view_product"])
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='q', required=False, type=str),
            OpenApiParameter(name='branch_id', required=False, type=int),
            OpenApiParameter(name='limit', required=False, type=int),
        ],
        responses={
            200: inline_serializer(
                name='MobileProductSearchItem',
                fields={
                    'id': serializers.IntegerField(),
                    'sku': serializers.CharField(),
                    'name': serializers.CharField(),
                    'price': serializers.CharField(),
                    'stock': serializers.IntegerField(),
                },
                many=True
            )
        }
    )
    def get(self, request):
        """
        Quick product search for mobile
        Returns only required fields to minimize data size
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

        # Get stock if branch is provided
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


class MobileCustomerLookupView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            required_permissions=["view_customer"])
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='q', required=False, type=str),
            OpenApiParameter(name='limit', required=False, type=int),
        ],
        responses={
            200: inline_serializer(
                name='MobileCustomerLookupItem',
                fields={
                    'id': serializers.IntegerField(),
                    'name': serializers.CharField(),
                    'phone': serializers.CharField(),
                    'tier': serializers.CharField(),
                    'has_credit': serializers.BooleanField(),
                },
                many=True
            )
        }
    )
    def get(self, request):
        """
        Quick customer lookup for mobile
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
            'id', 'first_name', 'last_name', 'phone'
        )[:limit]

        return Response([
            {
                'id': c.id,
                'name': c.full_name,
                'phone': c.phone,
                'tier': 'retail', # Default since Customer is strictly B2C
                'has_credit': False, # Default since Customer is strictly B2C
            }
            for c in customers
        ])


class MobileQuickSaleView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            required_permissions=["create_sale"])
    ]

    @extend_schema(
        request=inline_serializer(
            name='MobileQuickSaleRequest',
            fields={
                'customer_id': serializers.IntegerField(required=False),
                'items': inline_serializer(
                    name='QuickSaleItem',
                    fields={
                        'variant_id': serializers.IntegerField(),
                        'quantity': serializers.IntegerField(),
                        'price': serializers.CharField(),
                    },
                    many=True
                ),
                'payment_method': serializers.CharField(),
                'discount': serializers.CharField(),
            }
        ),
        responses={
            201: inline_serializer(
                name='MobileQuickSaleResponse',
                fields={
                    'success': serializers.BooleanField(),
                    'order_id': serializers.IntegerField(),
                    'order_number': serializers.CharField(),
                    'total': serializers.CharField(),
                }
            )
        }
    )
    def post(self, request):
        """
        Quick sale from mobile
        """
        from apps.sales.models import Order, OrderItem
        from apps.crm.models import Customer
        from apps.products.models import ProductVariant
        from django.db import transaction

        user = request.user

        # Get branch from user
        branch = None
        if hasattr(user, 'branches'):
            branches = user.branches.all()
            if branches.exists():
                branch = branches.first()

        if not branch:
            return Response(
                {'detail': str(_('Branch not specified'))},
                status=status.HTTP_400_BAD_REQUEST
            )

        customer_id = request.data.get('customer_id')
        items_data = request.data.get('items', [])
        payment_method = request.data.get('payment_method', 'cash')
        discount = Decimal(request.data.get('discount', '0'))

        if not items_data:
            return Response(
                {'detail': str(_('No products'))},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            customer = Customer.objects.get(
                id=customer_id) if customer_id else None
        except Customer.DoesNotExist:
            customer = None

        # Calculate totals
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
                    {'detail': str(_('Product {id} not found').format(
                        id=item['variant_id']))},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Calculate tax and total
        tax_rate = Decimal('0.15')
        discounted_subtotal = subtotal - discount
        tax_amount = discounted_subtotal * tax_rate
        total_amount = discounted_subtotal + tax_amount

        # Create order
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


class MobileSyncDataView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            required_permissions=["view_inventory"])
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='since', required=False, type=str),
            OpenApiParameter(name='branch_id', required=False, type=int),
        ],
        responses={
            200: inline_serializer(
                name='MobileSyncResponse',
                fields={
                    'products': inline_serializer(
                        name='SyncProduct',
                        fields={
                            'id': serializers.IntegerField(),
                            'sku': serializers.CharField(),
                            'price': serializers.CharField(),
                            'product__name': serializers.CharField(),
                            'updated_at': serializers.DateTimeField(),
                        },
                        many=True
                    ),
                    'customers': inline_serializer(
                        name='SyncCustomer',
                        fields={
                            'id': serializers.IntegerField(),
                            'first_name': serializers.CharField(),
                            'last_name': serializers.CharField(),
                            'phone': serializers.CharField(),
                            'updated_at': serializers.DateTimeField(),
                        },
                        many=True
                    ),
                    'timestamp': serializers.CharField(),
                }
            )
        }
    )
    def get(self, request):
        """
        Mobile data sync (offline-first)
        Returns only changes since last sync
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

        # Updated products
        products_filter = {'is_active': True}
        if last_sync:
            products_filter['updated_at__gte'] = last_sync

        products = ProductVariant.objects.filter(
            **products_filter
        ).select_related('product').values(
            'id', 'sku', 'price', 'product__name',
            'updated_at'
        )[:500]  # limit

        data['products'] = list(products)

        # Updated customers
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

        return Response(data)


class MobileOrderDetailView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            required_permissions=["view_sale"])
    ]

    @extend_schema(
        responses={
            200: inline_serializer(
                name='MobileOrderDetailResponse',
                fields={
                    'id': serializers.IntegerField(),
                    'order_number': serializers.CharField(),
                    'status': serializers.CharField(),
                    'payment_status': serializers.CharField(),
                    'customer': inline_serializer(
                        name='OrderDetailCustomer',
                        fields={
                            'id': serializers.IntegerField(),
                            'name': serializers.CharField(),
                        },
                        allow_null=True
                    ),
                    'branch': serializers.CharField(allow_null=True),
                    'items': inline_serializer(
                        name='OrderDetailItem',
                        fields={
                            'id': serializers.IntegerField(),
                            'name': serializers.CharField(),
                            'sku': serializers.CharField(),
                            'quantity': serializers.IntegerField(),
                            'price': serializers.CharField(),
                            'total': serializers.CharField(),
                        },
                        many=True
                    ),
                    'subtotal': serializers.CharField(),
                    'discount': serializers.CharField(),
                    'tax': serializers.CharField(),
                    'total': serializers.CharField(),
                    'paid': serializers.CharField(),
                    'remaining': serializers.CharField(),
                    'created_at': serializers.CharField(),
                }
            )
        }
    )
    def get(self, request, order_id):
        """
        Mobile order details - Optimized
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
                {'detail': str(_('Order not found'))},
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
