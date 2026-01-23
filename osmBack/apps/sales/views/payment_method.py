from rest_framework import viewsets, permissions
from apps.sales.models import PaymentMethod
from apps.sales.serializers.payment_method import PaymentMethodSerializer
from core.views import BaseViewSet


class PaymentMethodViewSet(BaseViewSet):
    """
    ViewSet لإدارة طرق الدفع ديناميكياً
    """
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]  # Adjust if needed
    filterset_fields = ['is_active', 'is_installment']
    search_fields = ['name_ar', 'name_en', 'code']
    ordering = ['name_en']
