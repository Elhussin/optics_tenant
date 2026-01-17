# apps/sales/views/payment.py
"""
Views للدفعات و BNPL
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Count
from django.utils import timezone
from decimal import Decimal

from apps.sales.models import Payment, Installment, Order, Invoice
from apps.sales.serializers.payment import (
    PaymentSerializer, PaymentCreateSerializer, PaymentListSerializer,
    InstallmentSerializer, BNPLSessionRequestSerializer, BNPLSessionResponseSerializer,
    PaymentRefundSerializer
)
from apps.sales.services.payment_gateway import PaymentGatewayFactory, PaymentGatewayException
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

# الأدوار المسموحة
PAYMENT_ROLES = ["cashier", "sales", "accountant", "manager"]
SUPER_ROLES = ["admin", "owner"]


class PaymentViewSet(BaseViewSet):
    """
    ViewSet للدفعات
    """
    queryset = Payment.objects.select_related(
        'invoice', 'order', 'partner'
    ).prefetch_related('installments').all()
    serializer_class = PaymentSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=PAYMENT_ROLES, super_roles=SUPER_ROLES
        )
    ]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['payment_method', 'status',
                        'is_installment', 'invoice', 'order', 'partner']
    search_fields = ['gateway_transaction_id',
                     'gateway_reference', 'cheque_number']
    ordering_fields = ['created_at', 'amount', 'paid_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        if self.action == 'list':
            return PaymentListSerializer
        return PaymentSerializer

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """تحديد الدفعة كمكتملة"""
        payment = self.get_object()
        transaction_id = request.data.get('transaction_id')

        try:
            payment.mark_completed(transaction_id=transaction_id)
            return Response({
                'status': 'success',
                'message': 'تم تحديث حالة الدفعة',
            })
        except Exception as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def mark_failed(self, request, pk=None):
        """تحديد الدفعة كفاشلة"""
        payment = self.get_object()
        reason = request.data.get('reason', '')

        payment.mark_failed(reason)
        return Response({
            'status': 'success',
            'message': 'تم تحديث حالة الدفعة',
        })

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """استرجاع دفعة"""
        payment = self.get_object()
        serializer = PaymentRefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data.get('amount')
        reason = serializer.validated_data.get('reason')

        # إذا كانت دفعة BNPL، استخدم البوابة
        if payment.payment_method in ['tabby', 'tamara'] and payment.bnpl_order_id:
            try:
                gateway = PaymentGatewayFactory.get_gateway(
                    payment.payment_method)
                result = gateway.refund_payment(payment.bnpl_order_id, amount)
                payment.gateway_response = result.get('raw_response', {})
            except PaymentGatewayException as e:
                return Response(
                    {'status': 'error', 'message': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            refunded = payment.refund(amount, reason)
            return Response({
                'status': 'success',
                'message': 'تم استرجاع الدفعة',
                'refunded_amount': str(refunded),
            })
        except ValueError as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def create_bnpl_session(self, request):
        """
        إنشاء جلسة دفع BNPL (Tabby/Tamara)
        """
        serializer = BNPLSessionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # جلب الطلب
        try:
            order = Order.objects.select_related('customer', 'branch').prefetch_related(
                'items__product_variant__product').get(id=data['order_id'])
        except Order.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'الطلب غير موجود'},
                status=status.HTTP_404_NOT_FOUND
            )

        # تجهيز بيانات الطلب للبوابة
        order_data = {
            'order_id': order.order_number,
            'amount': float(order.total_amount),
            'currency': 'SAR',
            'customer': {
                'email': order.customer.email or 'customer@example.com',
                'phone': order.customer.phone or '+966500000000',
                'first_name': order.customer.first_name or 'عميل',
                'last_name': order.customer.last_name or '',
            },
            'items': [
                {
                    'id': item.id,
                    'name': item.product_variant.product.name if item.product_variant else 'منتج',
                    'quantity': item.quantity,
                    'unit_price': float(item.unit_price),
                    'category': 'eyewear',
                }
                for item in order.items.all()
            ],
            'success_url': data['success_url'],
            'cancel_url': data['cancel_url'],
            'failure_url': data['failure_url'],
            'webhook_url': data.get('webhook_url', ''),
            'installments_count': data.get('installments_count', 4),
        }

        try:
            gateway = PaymentGatewayFactory.get_gateway(data['gateway'])
            result = gateway.create_session(order_data)

            # إنشاء سجل الدفعة
            payment = Payment.objects.create(
                order=order,
                amount=order.total_amount,
                currency='SAR',
                payment_method=data['gateway'],
                status='pending',
                is_installment=True,
                installments_count=data.get('installments_count', 4),
                bnpl_order_id=result.get(
                    'session_id') or result.get('order_id'),
                gateway_response=result.get('raw_response', {}),
            )

            response_data = {
                'success': True,
                'checkout_url': result.get('checkout_url'),
                'session_id': result.get('session_id') or result.get('checkout_id'),
                'payment_id': payment.id,
                'gateway': data['gateway'],
                'installments': result.get('installments', []),
            }

            return Response(response_data)

        except PaymentGatewayException as e:
            return Response(
                {'success': False, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def bnpl_callback(self, request):
        """
        Webhook callback من BNPL providers
        """
        # هذا يحتاج verification مع كل provider
        gateway = request.data.get(
            'gateway') or request.query_params.get('gateway')
        payment_id = request.data.get('payment_id')
        order_id = request.data.get('order_id')
        status_value = request.data.get('status')

        try:
            # البحث عن الدفعة
            payment = None
            if payment_id:
                payment = Payment.objects.filter(id=payment_id).first()
            elif order_id:
                payment = Payment.objects.filter(
                    bnpl_order_id=order_id).first()

            if not payment:
                return Response(
                    {'status': 'error', 'message': 'Payment not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # تحديث الحالة
            if status_value in ['approved', 'captured', 'paid', 'authorized']:
                payment.mark_completed(
                    transaction_id=order_id,
                    response=request.data
                )
            elif status_value in ['failed', 'declined', 'expired']:
                payment.mark_failed(reason=status_value)
            elif status_value in ['cancelled', 'canceled']:
                payment.status = 'cancelled'
                payment.save()

            return Response({'status': 'received'})

        except Exception as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """ملخص الدفعات"""
        # فلترة حسب الفترة
        period = request.query_params.get('period', 'today')
        today = timezone.now().date()

        if period == 'today':
            start_date = today
        elif period == 'week':
            start_date = today - timezone.timedelta(days=7)
        elif period == 'month':
            start_date = today - timezone.timedelta(days=30)
        elif period == 'year':
            start_date = today - timezone.timedelta(days=365)
        else:
            start_date = today

        payments = Payment.objects.filter(
            created_at__date__gte=start_date,
            status='completed'
        )

        # حساب الإجماليات
        total = payments.aggregate(
            total_amount=Sum('amount'),
            total_count=Count('id'),
        )

        # تجميع حسب طريقة الدفع
        by_method = payments.values('payment_method').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        # الدفعات بالتقسيط
        installment_summary = payments.filter(is_installment=True).aggregate(
            total=Sum('amount'),
            count=Count('id'),
        )

        return Response({
            'period': period,
            'total': {
                'amount': total['total_amount'] or 0,
                'count': total['total_count'] or 0,
            },
            'by_method': list(by_method),
            'installments': {
                'amount': installment_summary['total'] or 0,
                'count': installment_summary['count'] or 0,
            },
        })

    @action(detail=False, methods=['get'])
    def choices(self, request):
        """الخيارات المتاحة"""
        return Response({
            'payment_methods': Payment.PAYMENT_METHOD_CHOICES,
            'payment_status': Payment.PAYMENT_STATUS_CHOICES,
        })


class InstallmentViewSet(BaseViewSet):
    """
    ViewSet للأقساط
    """
    queryset = Installment.objects.select_related('payment').all()
    serializer_class = InstallmentSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=['accountant', 'manager'], super_roles=SUPER_ROLES
        )
    ]
    filterset_fields = ['payment', 'status']
    ordering = ['due_date']

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """تسجيل سداد القسط"""
        installment = self.get_object()
        amount = request.data.get('amount')

        installment.mark_paid(amount)
        return Response({
            'status': 'success',
            'message': 'تم تسجيل سداد القسط',
        })

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """الأقساط المتأخرة"""
        today = timezone.now().date()
        overdue_installments = self.get_queryset().filter(
            due_date__lt=today,
            status__in=['pending', 'due']
        )

        # تحديث الحالة
        overdue_installments.update(status='overdue')

        serializer = self.get_serializer(overdue_installments, many=True)
        return Response(serializer.data)
