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

        from apps.api.services.mobile_service import MobileService
        data = MobileService.get_dashboard_data(user, branch_id)
        return Response(data)


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

        from apps.api.services.mobile_service import MobileService
        results = MobileService.search_products(query, limit, branch_id)
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

        from apps.api.services.mobile_service import MobileService
        results = MobileService.search_customers(query, limit)
        return Response(results)


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

        from apps.sales.services.order_service import create_order

        # Create order
        try:
            order = create_order(
                branch=branch,
                customer=customer,
                items_data=items_data,
                payment_method=payment_method,
                discount=discount,
                user=user
            )
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'order_id': order.id,
            'order_number': order.order_number,
            'total': str(order.total_amount),
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

        from apps.api.services.mobile_service import MobileService
        data = MobileService.sync_data(last_sync, branch_id)
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
