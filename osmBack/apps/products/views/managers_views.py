# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import F, Sum
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _

from apps.branches.models import Branch
from apps.branches.serializers import BranchSerializer
from apps.products.models import Stock, ProductVariant
from apps.products.serializers.inventory import StockSerializer
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers


class ActiveBranchesView(APIView):
    """
    API View to list all active branches.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=BranchSerializer(many=True))
    def get(self, request):
        branches = Branch.objects.filter(is_active=True)
        return Response(BranchSerializer(branches, many=True).data)


class MainBranchView(APIView):
    """
    API View to get the main branch details.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=BranchSerializer)
    def get(self, request):
        branch = Branch.objects.filter(is_main=True).first()
        if not branch:
            return Response({'detail': _('No main branch found.')}, status=status.HTTP_404_NOT_FOUND)
        return Response(BranchSerializer(branch).data)


class LowStockByBranchView(APIView):
    """
    API View to list low stock items for a specific branch.
    Low stock is defined as: quantity_in_stock <= reorder_level + reserved_quantity
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=StockSerializer(many=True))
    def get(self, request, branch_id):
        # Verify branch exists? Optional but good practice.
        # branch = get_object_or_404(Branch, id=branch_id)

        inventories = Stock.objects.filter(
            branch_id=branch_id,
            quantity_in_stock__lte=F('reorder_level') + F('reserved_quantity')
        )
        return Response(StockSerializer(inventories, many=True).data)


class VariantTotalStockView(APIView):
    """
    API View to get total stock quantity for a variant across all branches.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses=inline_serializer(
            name='VariantTotalStockResponse',
            fields={
                'variant': serializers.IntegerField(),
                'total_stock': serializers.FloatField()
            }
        )
    )
    def get(self, request, variant_id):
        variant = get_object_or_404(ProductVariant, id=variant_id)
        total_stock = Stock.objects.filter(variant=variant).aggregate(
            total=Sum('quantity_in_stock'))['total'] or 0
        return Response({'variant': variant.id, 'total_stock': total_stock})
