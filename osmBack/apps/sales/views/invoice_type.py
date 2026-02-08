from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.sales.models import InvoiceType
from apps.sales.serializers.invoice_type import InvoiceTypeSerializer
from core.views import BaseViewSet


class InvoiceTypeViewSet(BaseViewSet):
    """
    ViewSet for Invoice Types.
    Read-only for most users, full access for admins.
    """
    queryset = InvoiceType.objects.filter(is_active=True).select_related(
        'pricing_policy', 'revenue_account')
    serializer_class = InvoiceTypeSerializer
    permission_classes = [IsAuthenticated]

    # Optional: Enable filtering by code if needed
    filterset_fields = ['code']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']
