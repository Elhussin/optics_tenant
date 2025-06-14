from django.shortcuts import render

# Create your views here.
from sales.services.order_service import confirm_order
from sales.models import Order
from django.contrib.auth.models import User

order = Order.objects.get(id=1)
user = User.objects.get(id=1)
confirm_order(order, user)

# views.py - Order API with actions

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from sales.models import Order
from sales.serializers import OrderSerializer
from sales.services.order_service import confirm_order, cancel_order, calculate_order_totals

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