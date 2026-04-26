"""Purchase Order Views"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiParameter

from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
from core.permissions.BranchAccessMixin import BranchAccessMixin
from apps.products.models import PurchaseOrder, PurchaseOrderItem
from apps.products.serializers.purchase import (
    PurchaseOrderSerializer,
    PurchaseOrderCreateSerializer,
    PurchaseOrderItemSerializer,
    ReceiveItemsSerializer,
)

PURCHASE_MANAGERS = ["InventoryManager", "BranchManager", "PurchasingManager"]
SUPER_ROLES = ["TenantOwner", "TenantAdmin"]


class PurchaseOrderViewSet(BranchAccessMixin, BaseViewSet):
    """
    ViewSet for Purchase Order Management

    Endpoints:
    - GET /purchase-orders/ - List orders
    - GET /purchase-orders/{id}/ - Order details
    - POST /purchase-orders/ - Create order
    - POST /purchase-orders/{id}/submit/ - Submit for approval
    - POST /purchase-orders/{id}/approve/ - Approve order
    - POST /purchase-orders/{id}/receive/ - Receive items
    - POST /purchase-orders/{id}/cancel/ - Cancel order
    """
    queryset = PurchaseOrder.objects.select_related(
        'supplier', 'branch', 'created_by', 'approved_by'
    ).prefetch_related('items__variant__product').all()
    serializer_class = PurchaseOrderSerializer
    filterset_fields = ['status', 'supplier', 'branch']
    search_fields = ['order_number', 'supplier__name', 'notes']
    ordering_fields = ['order_date', 'created_at', 'total_amount']
    ordering = ['-created_at']

    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=PURCHASE_MANAGERS + SUPER_ROLES,
            required_permissions=["view_purchaseorder"]
        )
    ]

    # Branch access configuration
    branch_field = 'branch'
    allow_all_branches_for_roles = SUPER_ROLES + ["InventoryManager"]

    def get_serializer_class(self):
        if self.action == 'create':
            return PurchaseOrderCreateSerializer
        if self.action == 'receive':
            return ReceiveItemsSerializer
        return PurchaseOrderSerializer

    @extend_schema(
        request=PurchaseOrderCreateSerializer,
        responses={201: PurchaseOrderSerializer}
    )
    def create(self, request, *args, **kwargs):
        """Create a new purchase order with items"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        return Response(
            PurchaseOrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        responses={200: PurchaseOrderSerializer},
        description=_("Submit order for approval")
    )
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit the order for approval"""
        order = self.get_object()

        try:
            from apps.products.services.purchase_service import submit_purchase_order
            submit_purchase_order(order)
            return Response(PurchaseOrderSerializer(order).data)
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        responses={200: PurchaseOrderSerializer},
        description=_("Approve the order")
    )
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve the order"""
        order = self.get_object()

        try:
            from apps.products.services.purchase_service import approve_purchase_order
            approve_purchase_order(order, request.user)
            return Response(PurchaseOrderSerializer(order).data)
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        request=ReceiveItemsSerializer,
        responses={200: PurchaseOrderSerializer},
        description=_("Receive items and update stock")
    )
    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        """Receive items from the purchase order"""
        order = self.get_object()
        serializer = ReceiveItemsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Convert to dict format expected by model
        items_received = {
            item['item_id']: item['quantity']
            for item in serializer.validated_data['items']
        }

        try:
            from apps.products.services.purchase_service import receive_purchase_order_items
            receive_purchase_order_items(order, items_received)
            return Response(PurchaseOrderSerializer(order).data)
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        responses={200: PurchaseOrderSerializer},
        description=_("Cancel the order")
    )
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel the order"""
        order = self.get_object()

        try:
            from apps.products.services.purchase_service import cancel_purchase_order
            cancel_purchase_order(order)
            return Response(PurchaseOrderSerializer(order).data)
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
