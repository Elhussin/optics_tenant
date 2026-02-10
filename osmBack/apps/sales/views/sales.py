# views/sales.py - Order and Invoice API with actions
from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.sales.models import Order, Invoice, Payment
from apps.sales.serializers import OrderSerializer, InvoiceSerializer, PaymentSerializer
from apps.sales.services.order_service import (
    confirm_order, cancel_order, calculate_order_totals,
    deliver_order, ready_order
)
from rest_framework.views import APIView
from apps.sales.services.invoice_service import confirm_invoice, calculate_invoice_totals
from rest_framework.decorators import action, api_view, permission_classes
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from rest_framework import serializers
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
from core.permissions.BranchAccessMixin import BranchAccessMixin

SALES_ROLES = ["SalesClerk", "BranchManager"]
super_roles = ["TenantOwner", "TenantAdmin"]


class BaseSalesViewSet(BranchAccessMixin, BaseViewSet):
    """
    Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
    Users only see data from their assigned branches.
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=SALES_ROLES,
            required_permissions=["view_sale"]
        )
    ]

    # Branch access configuration
    branch_field = 'branch'
    allow_all_branches_for_roles = super_roles


class OrderViewSet(BaseSalesViewSet):
    queryset = Order.objects.select_related(
        'branch', 'customer', 'sales_person__employee__user'
    ).prefetch_related('items__product_variant').all()
    serializer_class = OrderSerializer

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='OrderConfirmResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """تأكيد الطلب وحجز المخزون"""
        order = self.get_object()
        try:
            confirm_order(order, request.user)
            return Response({
                'status': 'success',
                'message': _('Order confirmed and stock reserved')
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='OrderReadyResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def ready(self, request, pk=None):
        """تجهيز الطلب للتسليم"""
        order = self.get_object()
        try:
            ready_order(order, request.user)
            return Response({
                'status': 'success',
                'message': _('Order is ready for delivery')
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='OrderDeliverResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                    'invoice_number': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        """توصيل الطلب وخصم المخزون وإنشاء الفاتورة"""
        order = self.get_object()
        try:
            invoice = deliver_order(order, request.user)
            return Response({
                'status': 'success',
                'message': _('Order delivered and invoice created'),
                'invoice_number': invoice.invoice_number
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='OrderCancelResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """إلغاء الطلب وتحرير المخزون"""
        order = self.get_object()
        try:
            cancel_order(order, request.user)
            return Response({
                'status': 'success',
                'message': _('Order cancelled')
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='OrderTotalsResponse',
                fields={
                    'subtotal': serializers.DecimalField(max_digits=10, decimal_places=2),
                    'tax_amount': serializers.DecimalField(max_digits=10, decimal_places=2),
                    'discount_amount': serializers.DecimalField(max_digits=10, decimal_places=2),
                    'total': serializers.DecimalField(max_digits=10, decimal_places=2),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def calculate_totals(self, request, pk=None):
        order = self.get_object()
        calculate_order_totals(order)
        return Response({
            'subtotal': order.subtotal,
            'tax_amount': order.tax_amount,
            'discount_amount': order.discount_amount,
            'total': order.total_amount
        })

    @extend_schema(
        request=inline_serializer(
            name='OrderBulkUpdateStatusRequest',
            fields={
                'ids': serializers.ListField(child=serializers.IntegerField()),
                'status': serializers.ChoiceField(choices=[
                    ('confirmed', 'Confirmed'),
                    ('ready', 'Ready'),
                    ('delivered', 'Delivered'),
                    ('cancelled', 'Cancelled')
                ])
            }
        ),
        responses={
            200: inline_serializer(
                name='OrderBulkUpdateStatusResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                    'updated_count': serializers.IntegerField(),
                    'errors': serializers.ListField(child=serializers.CharField())
                }
            )
        }
    )
    @action(detail=False, methods=['post'], url_path='bulk-update-status')
    def bulk_update_status(self, request):
        """تحديث حالة مجموعة من الطلبات دفعة واحدة"""
        ids = request.data.get('ids', [])
        new_status = request.data.get('status')

        if not ids or not new_status:
            return Response(
                {'detail': _('IDs and status are required')},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated_count = 0
        errors = []

        # Fetch orders efficiently
        orders = Order.objects.filter(id__in=ids, branch=request.branch)

        for order in orders:
            try:
                if new_status == 'confirmed':
                    confirm_order(order, request.user)
                elif new_status == 'ready':
                    ready_order(order, request.user)
                elif new_status == 'delivered':
                    deliver_order(order, request.user)
                elif new_status == 'cancelled':
                    cancel_order(order, request.user)
                else:
                    raise ValidationError(_("Invalid status"))

                updated_count += 1
            except Exception as e:
                errors.append(f"Order {order.order_number}: {str(e)}")

        return Response({
            'status': 'success' if updated_count > 0 else 'warning',
            'message': _('{0} orders updated successfully').format(updated_count),
            'updated_count': updated_count,
            'errors': errors
        })


class InvoiceViewSet(BaseSalesViewSet):
    queryset = Invoice.objects.select_related(
        'branch', 'customer', 'order', 'created_by__employee__user'
    ).prefetch_related('items__product_variant').all()
    serializer_class = InvoiceSerializer

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='InvoiceConfirmResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """تأكيد الفاتورة وخصم المخزون"""
        invoice = self.get_object()
        try:
            confirm_invoice(invoice)
            return Response({
                'status': 'success',
                'message': _('Invoice confirmed')
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='InvoiceTotalsResponse',
                fields={
                    'subtotal': serializers.DecimalField(max_digits=10, decimal_places=2),
                    'tax_amount': serializers.DecimalField(max_digits=10, decimal_places=2),
                    'discount_amount': serializers.DecimalField(max_digits=10, decimal_places=2),
                    'total': serializers.DecimalField(max_digits=10, decimal_places=2),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def calculate_totals(self, request, pk=None):
        invoice = self.get_object()
        calculate_invoice_totals(invoice)
        return Response({
            'subtotal': invoice.subtotal,
            'tax_amount': invoice.tax_amount,
            'discount_amount': invoice.discount_amount,
            'total': invoice.total_amount
        })

    @extend_schema(
        parameters=[
            OpenApiParameter(name='order_id', required=True, type=int),
        ],
        responses={200: InvoiceSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """جلب فواتير طلب معين"""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response({'detail': 'order_id is required'}, status=400)
        queryset = self.filter_queryset(
            self.get_queryset()).filter(order_id=order_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# PaymentViewSet moved to views/payment.py with more features


class OrderChoicesView(APIView):
    @extend_schema(
        responses={
            200: inline_serializer(
                name='OrderChoicesResponse',
                fields={
                    'order_type': serializers.DictField(),
                    'payment_method': serializers.DictField(),
                    'status': serializers.DictField(),
                    'payment_status': serializers.DictField(),
                }
            )
        }
    )
    def get(self, request):
        return Response({
            'order_type': Order.ORDER_TYPE_CHOICES,
            'payment_method': Order.PAYMENT_METHOD_CHOICES,
            'status': Order.STATUS_CHOICES,
            'payment_status': Order.PAYMENT_STATUS_CHOICES,
        })


class InvoiceChoicesView(APIView):
    @extend_schema(
        responses={
            200: inline_serializer(
                name='InvoiceChoicesResponse',
                fields={
                    'invoice_type': serializers.DictField(),
                    'status': serializers.DictField(),
                }
            )
        }
    )
    def get(self, request):
        return Response({
            'invoice_type': Invoice.INVOICE_TYPES,
            'status': Invoice.INVOICE_STATUS,
        })


# ═══════════════════════════════════════════════════════════════════════════════
# المرتجعات
# ═══════════════════════════════════════════════════════════════════════════════

class CreateReturnView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=SALES_ROLES
        )
    ]

    @extend_schema(
        request=inline_serializer(
            name='CreateReturnRequest',
            fields={
                'items': inline_serializer(
                    name='ReturnItemRequest',
                    fields={
                        'order_item_id': serializers.IntegerField(),
                        'quantity': serializers.IntegerField()
                    },
                    many=True
                ),
                'reason': serializers.CharField(required=False)
            }
        ),
        responses={
            200: inline_serializer(
                name='CreateReturnResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                    'invoice_number': serializers.CharField(),
                    'return_amount': serializers.CharField(),
                }
            )
        }
    )
    def post(self, request, order_id):
        """
        إنشاء مرتجع مبيعات
        """
        from apps.sales.services.return_service import create_sale_return

        if not order_id:
            return Response(
                {'detail': str(_('order_id is required'))},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'detail': str(_('Order {0} not found').format(order_id))},
                status=status.HTTP_404_NOT_FOUND
            )

        items_to_return = request.data.get('items', [])
        reason = request.data.get('reason', '')

        if not items_to_return:
            return Response(
                {'detail': _('Items to return must be specified')},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            invoice = create_sale_return(
                order, items_to_return, request.user, reason)
            return Response({
                'status': 'success',
                'message': _('Sale return created successfully'),
                'invoice_number': invoice.invoice_number,
                'return_amount': str(invoice.total_amount),
            })
        except Exception as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class CreateDamageRecordView(APIView):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=['BranchManager', 'InventoryManager']
        )
    ]

    @extend_schema(
        request=inline_serializer(
            name='CreateDamageRecordRequest',
            fields={
                'branch_id': serializers.IntegerField(),
                'items': inline_serializer(
                    name='DamageItemRequest',
                    fields={
                        'variant_id': serializers.IntegerField(),
                        'quantity': serializers.IntegerField(),
                        'reason': serializers.CharField()
                    },
                    many=True
                ),
                'reason': serializers.CharField(required=False)
            }
        ),
        responses={
            200: inline_serializer(
                name='CreateDamageRecordResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                }
            )
        }
    )
    def post(self, request):
        """
        تسجيل تلف/إتلاف منتجات
        """
        from apps.sales.services.return_service import process_damage
        from apps.branches.models import Branch

        branch_id = request.data.get('branch_id')
        items = request.data.get('items', [])
        reason = request.data.get('reason', '')

        if not branch_id or not items:
            return Response(
                {'detail': _('Branch and items must be specified')},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            branch = Branch.objects.get(id=branch_id)
            process_damage(branch, items, request.user, reason)
            return Response({
                'status': 'success',
                'message': _('Damage record created successfully'),
            })
        except Exception as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
