# views.py - Order API with actions

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from sales.models import Order
from sales.serializers import OrderSerializer
from sales.services.order_service import confirm_order, cancel_order, calculate_order_totals

# views.py - Invoice API with actions

from sales.models import Invoice
from sales.serializers import InvoiceSerializer
from sales.services.invoice_service import confirm_invoice, calculate_invoice_totals

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

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




class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

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



# views.py - Payment API

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from sales.models import Payment
from sales.serializers import PaymentSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
