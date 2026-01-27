# apps/sales/views/wholesale.py
"""
Wholesale Views
"""

from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Count, Q
from django.utils import timezone
from decimal import Decimal
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from rest_framework import serializers

from apps.crm.models import Customer
from apps.sales.models import Order, Invoice, Payment
from apps.products.models import ProductVariant
from apps.sales.services.wholesale_service import WholesaleService
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

# Allowed Roles
WHOLESALE_ROLES = ["SalesClerk", "BranchManager"]


class GetWholesalePricingView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=WHOLESALE_ROLES
        )
    ]

    @extend_schema(
        request=inline_serializer(
            name='GetWholesalePricingRequest',
            fields={
                'customer_id': serializers.IntegerField(),
                'items': inline_serializer(
                    name='PricingItemRequest',
                    fields={
                        'variant_id': serializers.IntegerField(),
                        'quantity': serializers.IntegerField()
                    },
                    many=True
                ),
                'branch_id': serializers.IntegerField(required=False),
            }
        ),
        responses={
            200: inline_serializer(
                name='GetWholesalePricingResponse',
                fields={
                    'customer': inline_serializer(
                        name='PricingCustomerInfo',
                        fields={
                            'id': serializers.IntegerField(),
                            'name': serializers.CharField(),
                            'pricing_tier': serializers.CharField(),
                            'pricing_tier_display': serializers.CharField(),
                            'default_discount': serializers.CharField(),
                        }
                    ),
                    'items': inline_serializer(
                        name='PricingResponseItem',
                        fields={
                            'variant_id': serializers.IntegerField(),
                            'variant_name': serializers.CharField(),
                            'quantity': serializers.IntegerField(),
                            'original_price': serializers.CharField(),
                            'unit_price': serializers.CharField(),
                            'discount_type': serializers.CharField(),
                            'discount_source': serializers.CharField(),
                            'line_discount': serializers.CharField(),
                            'line_total': serializers.CharField(),
                        },
                        many=True
                    ),
                    'subtotal': serializers.CharField(),
                    'line_discounts': serializers.CharField(),
                    'customer_discount': serializers.CharField(),
                    'total_discount': serializers.CharField(),
                    'final_total': serializers.CharField(),
                }
            )
        }
    )
    def post(self, request):
        """
        Calculate wholesale pricing for a specific customer
        """
        customer_id = request.data.get('customer_id')
        items_data = request.data.get('items', [])
        branch_id = request.data.get('branch_id')

        if not customer_id or not items_data:
            return Response(
                {'detail': _('customer_id and items are required')},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response(
                {'detail': _('Customer not found')},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prepare items
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
                    {'error': _('Product {0} not found').format(
                        item["variant_id"])},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Branch
        branch = None
        if branch_id:
            from apps.branches.models import Branch
            branch = Branch.objects.filter(id=branch_id).first()

        # Calculate Pricing
        pricing = WholesaleService.get_order_pricing(customer, items, branch)

        # Convert to JSON
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


class ValidateWholesaleOrderView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=WHOLESALE_ROLES
        )
    ]

    @extend_schema(
        request=inline_serializer(
            name='ValidateWholesaleOrderRequest',
            fields={
                'customer_id': serializers.IntegerField(),
                'items': inline_serializer(
                    name='ValidateItemRequest',
                    fields={
                        'variant_id': serializers.IntegerField(),
                        'quantity': serializers.IntegerField()
                    },
                    many=True
                ),
                'use_credit': serializers.BooleanField(required=False),
            }
        ),
        responses={
            200: inline_serializer(
                name='ValidateWholesaleOrderResponse',
                fields={
                    'is_valid': serializers.BooleanField(),
                    'errors': serializers.ListField(child=serializers.CharField()),
                    'customer_credit': inline_serializer(
                        name='CustomerCreditInfo',
                        fields={
                            'credit_limit': serializers.CharField(),
                            'current_balance': serializers.CharField(),
                            'available_credit': serializers.CharField(),
                            'credit_status': serializers.CharField(),
                        },
                        allow_null=True
                    )
                }
            )
        }
    )
    def post(self, request):
        """
        Validate wholesale order before creation
        """
        customer_id = request.data.get('customer_id')
        items_data = request.data.get('items', [])
        use_credit = request.data.get('use_credit', False)

        if not customer_id or not items_data:
            return Response(
                {'detail': _('customer_id and items are required')},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response(
                {'detail': _('Customer not found')},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prepare items
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
                    'errors': [_('Product {0} not found').format(item["variant_id"])],
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


class CreateWholesaleOrderView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=WHOLESALE_ROLES
        )
    ]

    @extend_schema(
        request=inline_serializer(
            name='CreateWholesaleOrderRequest',
            fields={
                'customer_id': serializers.IntegerField(),
                'branch_id': serializers.IntegerField(),
                'items': inline_serializer(
                    name='CreateOrderItemRequest',
                    fields={
                        'variant_id': serializers.IntegerField(),
                        'quantity': serializers.IntegerField()
                    },
                    many=True
                ),
                'payment_method': serializers.CharField(required=False),
                'notes': serializers.CharField(required=False),
            }
        ),
        responses={
            201: inline_serializer(
                name='CreateWholesaleOrderResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                    'order': inline_serializer(
                        name='CreatedOrderInfo',
                        fields={
                            'id': serializers.IntegerField(),
                            'order_number': serializers.CharField(),
                            'total_amount': serializers.CharField(),
                            'discount_amount': serializers.CharField(),
                            'status': serializers.CharField(),
                        }
                    )
                }
            )
        }
    )
    def post(self, request):
        """
        Create Wholesale Order
        """
        customer_id = request.data.get('customer_id')
        branch_id = request.data.get('branch_id')
        items_data = request.data.get('items', [])
        payment_method = request.data.get('payment_method', 'credit')
        notes = request.data.get('notes', '')

        if not customer_id or not branch_id or not items_data:
            return Response(
                {'error': _('customer_id, branch_id and items are required')},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response(
                {'error': _('Customer not found')},
                status=status.HTTP_404_NOT_FOUND
            )

        from apps.branches.models import Branch
        try:
            branch = Branch.objects.get(id=branch_id)
        except Branch.DoesNotExist:
            return Response(
                {'error': _('Branch not found')},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prepare items
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
                    {'error': _('Product {0} not found').format(
                        item["variant_id"])},
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
                'message': _('Wholesale order created successfully'),
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


class CustomerStatementView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=WHOLESALE_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='start_date', required=False, type=str),
            OpenApiParameter(name='end_date', required=False, type=str),
        ],
        responses={
            200: inline_serializer(
                name='CustomerStatementResponse',
                fields={
                    'customer': inline_serializer(
                        name='StatementCustomerInfo',
                        fields={
                            'id': serializers.IntegerField(),
                            'name': serializers.CharField(),
                            'credit_limit': serializers.CharField(),
                            'current_balance': serializers.CharField(),
                        }
                    ),
                    'period': inline_serializer(
                        name='StatementPeriod',
                        fields={
                            'start_date': serializers.CharField(allow_null=True),
                            'end_date': serializers.CharField(allow_null=True),
                        }
                    ),
                    'opening_balance': serializers.CharField(),
                    'transactions': inline_serializer(
                        name='StatementTransaction',
                        fields={
                            'date': serializers.CharField(),
                            'type': serializers.CharField(),
                            'reference': serializers.CharField(),
                            'debit': serializers.CharField(),
                            'credit': serializers.CharField(),
                            'balance': serializers.CharField(),
                        },
                        many=True
                    ),
                    'closing_balance': serializers.CharField(),
                    'summary': inline_serializer(
                        name='StatementSummary',
                        fields={
                            'total_invoices': serializers.CharField(),
                            'total_payments': serializers.CharField(),
                        }
                    )
                }
            )
        }
    )
    def get(self, request, customer_id):
        """
        Customer Statement
        """
        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response(
                {'error': _('Customer not found')},
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


class WholesaleCustomersView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=WHOLESALE_ROLES
        )
    ]

    @extend_schema(
        responses={
            200: inline_serializer(
                name='WholesaleCustomer',
                fields={
                    'id': serializers.IntegerField(),
                    'first_name': serializers.CharField(),
                    'last_name': serializers.CharField(),
                    'customer_type': serializers.CharField(),
                    'pricing_tier': serializers.CharField(),
                    'credit_limit': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'current_balance': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'credit_status': serializers.CharField(),
                    'payment_terms_days': serializers.IntegerField(),
                    'minimum_order_amount': serializers.DecimalField(max_digits=20, decimal_places=2),
                },
                many=True
            )
        }
    )
    def get(self, request):
        """
        List of Wholesale Customers
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


class WholesaleDashboardView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=WHOLESALE_ROLES
        )
    ]

    @extend_schema(
        responses={
            200: inline_serializer(
                name='WholesaleDashboardResponse',
                fields={
                    'month_stats': inline_serializer(
                        name='DashboardMonthStats',
                        fields={
                            'orders_count': serializers.IntegerField(),
                            'total_sales': serializers.CharField(),
                            'total_discount': serializers.CharField(),
                        }
                    ),
                    'top_customers': inline_serializer(
                        name='DashboardTopCustomer',
                        fields={
                            'customer_id': serializers.IntegerField(),
                            'name': serializers.CharField(),
                            'total': serializers.CharField(),
                            'orders_count': serializers.IntegerField(),
                        },
                        many=True
                    ),
                    'receivables': inline_serializer(
                        name='DashboardReceivables',
                        fields={
                            'total': serializers.CharField(),
                            'customers_count': serializers.IntegerField(),
                        }
                    ),
                    'overdue_count': serializers.IntegerField(),
                }
            )
        }
    )
    def get(self, request):
        """
        Wholesale Dashboard
        """
        today = timezone.now().date()
        month_start = today.replace(day=1)

        # Total Wholesale Orders
        wholesale_orders = Order.objects.filter(order_type='wholesale')

        # Monthly Statistics
        month_orders = wholesale_orders.filter(
            created_at__date__gte=month_start)
        month_stats = month_orders.aggregate(
            count=Count('id'),
            total=Sum('total_amount'),
            discount=Sum('discount_amount'),
        )

        # Top Customers
        top_customers = wholesale_orders.filter(
            created_at__date__gte=month_start
        ).values('customer__first_name', 'customer__last_name', 'customer_id').annotate(
            total=Sum('total_amount'),
            orders_count=Count('id')
        ).order_by('-total')[:10]

        # Accounts Receivable
        receivables = Customer.objects.filter(
            current_balance__gt=0
        ).aggregate(
            total=Sum('current_balance'),
            count=Count('id')
        )

        # Overdue Customers
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


class UpdateCustomerCreditView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=['FinanceOfficer', 'BranchManager']
        )
    ]

    @extend_schema(
        request=inline_serializer(
            name='UpdateCustomerCreditRequest',
            fields={
                'credit_limit': serializers.DecimalField(max_digits=20, decimal_places=2, required=False),
                'credit_status': serializers.CharField(required=False),
                'payment_terms_days': serializers.IntegerField(required=False),
                'pricing_tier': serializers.CharField(required=False),
                'default_discount_percentage': serializers.DecimalField(max_digits=5, decimal_places=2, required=False),
            }
        ),
        responses={
            200: inline_serializer(
                name='UpdateCustomerCreditResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                    'customer': inline_serializer(
                        name='UpdatedCreditCustomer',
                        fields={
                            'id': serializers.IntegerField(),
                            'credit_limit': serializers.CharField(),
                            'credit_status': serializers.CharField(),
                            'pricing_tier': serializers.CharField(),
                            'available_credit': serializers.CharField(),
                        }
                    )
                }
            )
        }
    )
    def post(self, request, customer_id):
        """
        Update Customer Credit
        """
        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response(
                {'error': _('Customer not found')},
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
            customer.default_discount_percentage = Decimal(
                str(default_discount))

        customer.save()

        return Response({
            'status': 'success',
            'message': _('Credit information updated successfully'),
            'customer': {
                'id': customer.id,
                'credit_limit': str(customer.credit_limit),
                'credit_status': customer.credit_status,
                'pricing_tier': customer.pricing_tier,
                'available_credit': str(customer.available_credit),
            }
        })
