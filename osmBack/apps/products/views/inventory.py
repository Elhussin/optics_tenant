from apps.products.models import Stock, StockMovement, StockTransfer, StockTransferItem
from apps.products.serializers import (
    StockSerializer, StockMovementSerializer, StockMovementCreateSerializer,
    StockTransferSerializer, StockTransferItemSerializer, StockTransferCreateSerializer
)
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
from core.permissions.BranchAccessMixin import BranchAccessMixin, TransferBranchAccessMixin
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from rest_framework import serializers

INVENTORY_MANAGERS = ["InventoryManager", "BranchManager"]
SUPER_ROLES = ["TenantOwner", "TenantAdmin"]


class InventoryBaseViewSet(BranchAccessMixin, BaseViewSet):
    """
    Base ViewSet for inventory with branch-level access control.
    Users only see data from their assigned branches unless they are admin/owner.
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=INVENTORY_MANAGERS,
            required_permissions=["view_inventory"]
        )
    ]

    # Branch access configuration
    branch_field = 'branch'
    allow_all_branches_for_roles = SUPER_ROLES + ["InventoryManager"]


class StocksViewSet(InventoryBaseViewSet):
    """
    ViewSet for Inventory Management

    Endpoints:
    - GET /stocks/ - List stock
    - GET /stocks/{id}/ - Stock details
    - POST /stocks/ - Add new stock (Warehouses only)
    - GET /stocks/low_stock/ - Low stock products
    - GET /stocks/out_of_stock/ - Out of stock products
    - GET /stocks/by_branch/{branch_id}/ - Stock for specific branch
    """
    queryset = Stock.objects.select_related('branch', 'variant__product').all()
    serializer_class = StockSerializer
    filterset_fields = ['branch', 'variant', 'is_active']
    search_fields = ['variant__sku', 'variant__product__name', 'branch__name']
    ordering_fields = ['quantity_in_stock', 'created_at', 'last_restocked']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status')

        if status_param == 'in_stock':
            queryset = queryset.in_stock()
        elif status_param == 'low':
            queryset = queryset.low_stock()
        elif status_param == 'out':
            queryset = queryset.out_of_stock()

        return queryset

    @extend_schema(responses=StockSerializer(many=True))
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Low stock products"""
        queryset = self.filter_queryset(self.get_queryset()).low_stock().select_related('branch', 'variant__product')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(responses=StockSerializer(many=True))
    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """Out of stock products"""
        queryset = self.filter_queryset(self.get_queryset()).out_of_stock().select_related('branch', 'variant__product')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        parameters=[OpenApiParameter(
            name='branch_id', required=True, type=int)],
        responses=StockSerializer(many=True)
    )
    @action(detail=False, methods=['get'], url_path='by-branch/(?P<branch_id>[^/.]+)')
    def by_branch(self, request, branch_id=None):
        """Stock for specific branch"""
        queryset = self.filter_queryset(self.get_queryset()).filter(branch_id=branch_id).select_related(
            'branch', 'variant__product')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(responses=inline_serializer(name='StoreBranch', fields={'id': serializers.IntegerField(), 'name': serializers.CharField()}, many=True))
    @action(detail=False, methods=['get'])
    def stores_only(self, request):
        """Warehouses only (Branches that can add stock)"""
        from apps.branches.models import Branch
        from apps.branches.serializers import BranchSerializer
        stores = Branch.objects.filter(branch_type='store', is_active=True)
        serializer = BranchSerializer(stores, many=True)
        return Response(serializer.data)


class StockMovementsViewSet(InventoryBaseViewSet):
    """
    ViewSet for Stock Movements

    Endpoints:
    - GET /stock-movements/ - List movements
    - POST /stock-movements/ - Add new movement (purchase, sale, adjustment, etc.)
    - GET /stock-movements/by_stock/{stock_id}/ - Movements for specific stock
    """
    queryset = StockMovement.objects.select_related(
        'stock__branch', 'stock__variant__product'
    ).all()
    serializer_class = StockMovementSerializer
    filterset_fields = ['stock', 'movement_type']
    search_fields = ['reference_number', 'notes']
    ordering = ['-created_at']

    # Override branch field for nested relationship
    branch_field = 'stock__branch'

    def get_serializer_class(self):
        if self.action == 'create':
            return StockMovementCreateSerializer
        return StockMovementSerializer

    def create(self, request, *args, **kwargs):
        """Create new stock movement with user logging"""
        serializer = StockMovementCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            movement = serializer.save()
            return Response(
                StockMovementSerializer(movement).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        parameters=[OpenApiParameter(
            name='stock_id', required=True, type=int)],
        responses=StockMovementSerializer(many=True)
    )
    @action(detail=False, methods=['get'], url_path='by-stock/(?P<stock_id>[^/.]+)')
    def by_stock(self, request, stock_id=None):
        """Movements for specific stock"""
        queryset = self.queryset.filter(stock_id=stock_id)
        serializer = StockMovementSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        request=StockMovementCreateSerializer,
        responses={201: StockMovementSerializer, 400: None}
    )
    @action(detail=False, methods=['post'])
    def purchase(self, request):
        """Add purchase (Restock)"""
        data = request.data.copy()
        data['movement_type'] = 'purchase'

        serializer = StockMovementCreateSerializer(
            data=data, context={'request': request})
        if serializer.is_valid():
            movement = serializer.save()
            return Response(
                StockMovementSerializer(movement).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=StockMovementCreateSerializer,
        responses={201: StockMovementSerializer, 400: None}
    )
    @action(detail=False, methods=['post'])
    def adjustment(self, request):
        """Stock adjustment (Increase or Decrease)"""
        data = request.data.copy()
        data['movement_type'] = 'adjustment'

        serializer = StockMovementCreateSerializer(
            data=data, context={'request': request})
        if serializer.is_valid():
            movement = serializer.save()
            return Response(
                StockMovementSerializer(movement).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StockTransferViewSet(TransferBranchAccessMixin, BaseViewSet):
    """
    ViewSet for Inter-Branch Transfers

    Uses TransferBranchAccessMixin to show transfers relevant to the user's branch
    (either as sender or receiver).

    Endpoints:
    - GET /stock-transfers/ - List transfers
    - POST /stock-transfers/ - Create transfer
    - POST /stock-transfers/{id}/submit/ - Submit transfer for approval
    - POST /stock-transfers/{id}/approve/ - Approve transfer
    - POST /stock-transfers/{id}/ship/ - Ship transfer
    - POST /stock-transfers/{id}/receive/ - Receive transfer
    - POST /stock-transfers/{id}/cancel/ - Cancel transfer
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=INVENTORY_MANAGERS,
            required_permissions=["view_inventory"]
        )
    ]
    allow_all_branches_for_roles = SUPER_ROLES + ['InventoryManager']
    queryset = StockTransfer.objects.select_related(
        'from_branch', 'to_branch'
    ).prefetch_related('items__variant__product').all()
    serializer_class = StockTransferSerializer
    filterset_fields = ['from_branch', 'to_branch', 'status']
    search_fields = ['transfer_number', 'notes']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return StockTransferCreateSerializer
        return StockTransferSerializer

    def create(self, request, *args, **kwargs):
        serializer = StockTransferCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            transfer = serializer.save()
            return Response(
                StockTransferSerializer(transfer).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(responses=StockTransferSerializer)
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit transfer for approval"""
        transfer = self.get_object()

        if transfer.status != 'pending':
            return Response(
                {'detail': _('Only pending transfers can be submitted.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not transfer.items.exists():
            return Response(
                {'detail': _('Must add items to transfer first.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        transfer.status = 'submitted'
        transfer.save()

        return Response(StockTransferSerializer(transfer).data)

    @extend_schema(responses=StockTransferSerializer)
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve transfer"""
        transfer = self.get_object()

        if transfer.status != 'submitted':
            return Response(
                {'detail': _('Only submitted transfers can be approved.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        transfer.approved_by = request.user.get_full_name() or request.user.username
        transfer.approved_date = timezone.now()
        # الآن جاهز للشحن (يمكن إضافة حالة approved إذا لزم الأمر)
        transfer.save()

        return Response(StockTransferSerializer(transfer).data)

    @extend_schema(responses=StockTransferSerializer)
    @action(detail=True, methods=['post'])
    def ship(self, request, pk=None):
        """Ship transfer - Deducts from sending branch"""
        transfer = self.get_object()

        try:
            from apps.products.services.inventory_service import execute_transfer_shipment
            execute_transfer_shipment(transfer)
            return Response(StockTransferSerializer(transfer).data)
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(responses=StockTransferSerializer)
    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        """Receive transfer - Adds to receiving branch"""
        transfer = self.get_object()

        try:
            from apps.products.services.inventory_service import execute_transfer_receiving
            execute_transfer_receiving(transfer)
            # Mark as completed
            transfer.status = 'completed'
            transfer.save()
            return Response(StockTransferSerializer(transfer).data)
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(responses=StockTransferSerializer)
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel transfer"""
        transfer = self.get_object()

        if transfer.status in ['shipped', 'received', 'completed']:
            return Response(
                {'detail': _('Cannot cancel a shipped or received transfer.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        transfer.status = 'cancelled'
        transfer.save()

        return Response(StockTransferSerializer(transfer).data)

    @extend_schema(responses=StockTransferSerializer(many=True))
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Pending transfers"""
        queryset = self.filter_queryset(self.get_queryset()).filter(status='pending')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        parameters=[OpenApiParameter(
            name='branch_id', required=True, type=int)],
        responses=StockTransferSerializer(many=True)
    )
    @action(detail=False, methods=['get'])
    def incoming(self, request):
        """Incoming transfers to current branch"""
        branch_id = request.query_params.get('branch_id')
        if not branch_id:
            return Response(
                {'detail': _('Branch must be specified.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        queryset = self.filter_queryset(self.get_queryset()).filter(
            to_branch_id=branch_id, status='shipped')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        parameters=[OpenApiParameter(
            name='branch_id', required=True, type=int)],
        responses=StockTransferSerializer(many=True)
    )
    @action(detail=False, methods=['get'])
    def outgoing(self, request):
        """Outgoing transfers from current branch"""
        branch_id = request.query_params.get('branch_id')
        if not branch_id:
            return Response(
                {'detail': _('Branch must be specified.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        queryset = self.filter_queryset(self.get_queryset()).filter(
            from_branch_id=branch_id).exclude(status='cancelled')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class StockTransferItemViewSet(InventoryBaseViewSet):
    """
    ViewSet for Transfer Items
    """
    queryset = StockTransferItem.objects.select_related(
        'transfer', 'variant__product'
    ).all()
    serializer_class = StockTransferItemSerializer
    filterset_fields = ['transfer']
