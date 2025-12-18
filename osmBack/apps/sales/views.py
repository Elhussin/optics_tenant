# views.py - Order API with actions

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.sales.models import Order, Invoice, Payment
from apps.sales.serializers import OrderSerializer, InvoiceSerializer, PaymentSerializer
from apps.sales.services.order_service import confirm_order, cancel_order, calculate_order_totals
from apps.sales.services.invoice_service import confirm_invoice, calculate_invoice_totals
from rest_framework.decorators import api_view
from core.views import BaseViewSet

class BaseSalesViewSet(BaseViewSet):
    """
    Base ViewSet for Sales to enforce Branch Isolation
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Start with default filtering (e.g. by IsDeleted if implemented in BaseViewSet)
        qs = super().get_queryset()
        user = self.request.user
        
        # Superuser sees all
        if user.is_superuser:
            return qs

        # Regular users see records from their branch
        if hasattr(user, 'branchusers') and user.branchusers.branch:
            # Check if model has 'branch' field or relation
            if hasattr(self.serializer_class.Meta.model, 'branch'):
                return qs.filter(branch=user.branchusers.branch)
            # Payment links to Invoice -> Branch
            if self.serializer_class.Meta.model == Payment:
                 return qs.filter(invoice__branch=user.branchusers.branch)
        
        # If no branch assigned, maybe return nothing or own records?
        # Safe default: return nothing or check logic
        return qs.none() 


class OrderViewSet(BaseSalesViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        order = self.get_object()
        confirm_order(order, request.user)
        return Response({'status': 'order confirmed'}, status=200)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        cancel_order(order, request.user)
        return Response({'status': 'order cancelled'}, status=200)

    @action(detail=True, methods=['post'])
    def calculate_totals(self, request, pk=None):
        order = self.get_object()
        calculate_order_totals(order)
        return Response({'total': order.total_amount}, status=200)


class InvoiceViewSet(BaseSalesViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        invoice = self.get_object()
        confirm_invoice(invoice)
        return Response({'status': 'invoice confirmed'}, status=200)

    @action(detail=True, methods=['post'])
    def calculate_totals(self, request, pk=None):
        invoice = self.get_object()
        calculate_invoice_totals(invoice)
        return Response({'total': invoice.total_amount}, status=200)


class PaymentViewSet(BaseSalesViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer 


@api_view(['GET'])
def order_choices(request):
    return Response({
        'order_type': Order.ORDER_TYPE_choices,
        'payment_type': Order.PAYMENT_TYPE_CHOICES,
        'status': Order.STATUS_CHOICES,
        'payment_status': Order.PAYMENT_STATUS_CHOICES,
    })

@api_view(['GET'])
def invoice_choices(request):
    return Response({
        'invoice_type': Invoice.INVOICE_TYPES,
        'status': Invoice.INVOICE_STATUS,
    })
