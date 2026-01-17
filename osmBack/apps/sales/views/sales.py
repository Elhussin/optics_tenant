# views/sales.py - Order and Invoice API with actions

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
from apps.sales.services.invoice_service import confirm_invoice, calculate_invoice_totals
from rest_framework.decorators import action, api_view, permission_classes
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
from core.permissions.BranchAccessMixin import BranchAccessMixin

SALES_ROLES = ["sales", "cashier", "manager"]
SUPER_ROLES = ["admin", "owner"]


class BaseSalesViewSet(BranchAccessMixin, BaseViewSet):
    """
    Base ViewSet for Sales with Branch Isolation via BranchAccessMixin.
    Users only see data from their assigned branches.
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=SALES_ROLES, super_roles=SUPER_ROLES)
    ]

    # Branch access configuration
    branch_field = 'branch'
    allow_all_branches_for_roles = SUPER_ROLES + ['manager']


class OrderViewSet(BaseSalesViewSet):
    queryset = Order.objects.select_related(
        'branch', 'customer', 'sales_person__employee__user'
    ).prefetch_related('items__product_variant').all()
    serializer_class = OrderSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """تأكيد الطلب وحجز المخزون"""
        order = self.get_object()
        try:
            confirm_order(order, request.user)
            return Response({
                'status': 'success',
                'message': 'تم تأكيد الطلب وحجز المخزون'
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def ready(self, request, pk=None):
        """تجهيز الطلب للتسليم"""
        order = self.get_object()
        try:
            ready_order(order, request.user)
            return Response({
                'status': 'success',
                'message': 'تم تجهيز الطلب للتسليم'
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        """توصيل الطلب وخصم المخزون وإنشاء الفاتورة"""
        order = self.get_object()
        try:
            invoice = deliver_order(order, request.user)
            return Response({
                'status': 'success',
                'message': 'تم توصيل الطلب وإنشاء الفاتورة',
                'invoice_number': invoice.invoice_number
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """إلغاء الطلب وتحرير المخزون"""
        order = self.get_object()
        try:
            cancel_order(order, request.user)
            return Response({
                'status': 'success',
                'message': 'تم إلغاء الطلب'
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

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


class InvoiceViewSet(BaseSalesViewSet):
    queryset = Invoice.objects.select_related(
        'branch', 'customer', 'order', 'created_by__employee__user'
    ).prefetch_related('items__product_variant').all()
    serializer_class = InvoiceSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """تأكيد الفاتورة وخصم المخزون"""
        invoice = self.get_object()
        try:
            confirm_invoice(invoice)
            return Response({
                'status': 'success',
                'message': 'تم تأكيد الفاتورة'
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

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

    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """جلب فواتير طلب معين"""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response({'error': 'order_id is required'}, status=400)
        queryset = self.filter_queryset(
            self.get_queryset()).filter(order_id=order_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# PaymentViewSet moved to views/payment.py with more features


@api_view(['GET'])
def order_choices(request):
    return Response({
        'order_type': Order.ORDER_TYPE_CHOICES,
        'payment_method': Order.PAYMENT_METHOD_CHOICES,
        'status': Order.STATUS_CHOICES,
        'payment_status': Order.PAYMENT_STATUS_CHOICES,
    })


@api_view(['GET'])
def invoice_choices(request):
    return Response({
        'invoice_type': Invoice.INVOICE_TYPES,
        'status': Invoice.INVOICE_STATUS,
    })


# ═══════════════════════════════════════════════════════════════════════════════
# المرتجعات
# ═══════════════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=SALES_ROLES, super_roles=SUPER_ROLES
    )
])
def create_return(request, order_id):
    """
    إنشاء مرتجع مبيعات

    Request Body:
    {
        "items": [
            {"order_item_id": 1, "quantity": 2},
            {"order_item_id": 2, "quantity": 1}
        ],
        "reason": "سبب الإرجاع"
    }
    """
    from apps.sales.services.return_service import create_sale_return

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response(
            {'error': 'الطلب غير موجود'},
            status=status.HTTP_404_NOT_FOUND
        )

    items_to_return = request.data.get('items', [])
    reason = request.data.get('reason', '')

    if not items_to_return:
        return Response(
            {'error': 'يجب تحديد المنتجات المراد إرجاعها'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        invoice = create_sale_return(
            order, items_to_return, request.user, reason)
        return Response({
            'status': 'success',
            'message': 'تم إنشاء مرتجع المبيعات بنجاح',
            'invoice_number': invoice.invoice_number,
            'return_amount': str(invoice.total_amount),
        })
    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=['manager', 'store_keeper'], super_roles=SUPER_ROLES
    )
])
def create_damage_record(request):
    """
    تسجيل تلف/إتلاف منتجات

    Request Body:
    {
        "branch_id": 1,
        "items": [
            {"variant_id": 1, "quantity": 5, "reason": "كسر"}
        ],
        "reason": "سبب عام"
    }
    """
    from apps.sales.services.return_service import process_damage
    from apps.branches.models import Branch

    branch_id = request.data.get('branch_id')
    items = request.data.get('items', [])
    reason = request.data.get('reason', '')

    if not branch_id or not items:
        return Response(
            {'error': 'يجب تحديد الفرع والمنتجات'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        branch = Branch.objects.get(id=branch_id)
        process_damage(branch, items, request.user, reason)
        return Response({
            'status': 'success',
            'message': 'تم تسجيل التلف بنجاح',
        })
    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
