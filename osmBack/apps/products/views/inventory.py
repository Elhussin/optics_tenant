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
    ViewSet لإدارة المخزون

    Endpoints:
    - GET /stocks/ - قائمة المخزون
    - GET /stocks/{id}/ - تفاصيل مخزون
    - POST /stocks/ - إضافة مخزون جديد (فقط للمستودعات)
    - GET /stocks/low_stock/ - المنتجات منخفضة المخزون
    - GET /stocks/out_of_stock/ - المنتجات نفدت من المخزون
    - GET /stocks/by_branch/{branch_id}/ - مخزون فرع معين
    """
    queryset = Stock.objects.select_related('branch', 'variant__product').all()
    serializer_class = StockSerializer
    filterset_fields = ['branch', 'variant', 'is_active']
    search_fields = ['variant__sku', 'variant__product__name', 'branch__name']
    ordering_fields = ['quantity_in_stock', 'created_at', 'last_restocked']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """المنتجات منخفضة المخزون"""
        queryset = Stock.objects.low_stock().select_related('branch', 'variant__product')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """المنتجات نفدت من المخزون"""
        queryset = Stock.objects.out_of_stock().select_related('branch', 'variant__product')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-branch/(?P<branch_id>[^/.]+)')
    def by_branch(self, request, branch_id=None):
        """مخزون فرع معين"""
        queryset = Stock.objects.filter(branch_id=branch_id).select_related(
            'branch', 'variant__product')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stores_only(self, request):
        """المستودعات فقط (الفروع التي يمكن إضافة المخزون لها)"""
        from apps.branches.models import Branch
        from apps.branches.serializers import BranchSerializer
        stores = Branch.objects.filter(branch_type='store', is_active=True)
        serializer = BranchSerializer(stores, many=True)
        return Response(serializer.data)


class StockMovementsViewSet(InventoryBaseViewSet):
    """
    ViewSet لإدارة حركات المخزون

    Endpoints:
    - GET /stock-movements/ - قائمة الحركات
    - POST /stock-movements/ - إضافة حركة جديدة (شراء، بيع، تعديل، إلخ)
    - GET /stock-movements/by_stock/{stock_id}/ - حركات مخزون معين
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
        """إنشاء حركة مخزون جديدة مع تسجيل المستخدم"""
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

    @action(detail=False, methods=['get'], url_path='by-stock/(?P<stock_id>[^/.]+)')
    def by_stock(self, request, stock_id=None):
        """حركات مخزون معين"""
        queryset = self.queryset.filter(stock_id=stock_id)
        serializer = StockMovementSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def purchase(self, request):
        """إضافة عملية شراء جديدة (إضافة للمخزون)"""
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

    @action(detail=False, methods=['post'])
    def adjustment(self, request):
        """تعديل المخزون (زيادة أو نقصان)"""
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
    ViewSet لإدارة التحويلات بين الفروع

    يستخدم TransferBranchAccessMixin لعرض التحويلات التي ينتمي لها المستخدم
    (سواء كفرع مرسل أو مستلم).

    Endpoints:
    - GET /stock-transfers/ - قائمة التحويلات
    - POST /stock-transfers/ - إنشاء تحويل جديد
    - POST /stock-transfers/{id}/submit/ - تقديم التحويل للموافقة
    - POST /stock-transfers/{id}/approve/ - الموافقة على التحويل
    - POST /stock-transfers/{id}/ship/ - شحن التحويل
    - POST /stock-transfers/{id}/receive/ - استلام التحويل
    - POST /stock-transfers/{id}/cancel/ - إلغاء التحويل
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

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """تقديم التحويل للموافقة"""
        transfer = self.get_object()

        if transfer.status != 'pending':
            return Response(
                {'error': 'يمكن تقديم التحويلات المعلقة فقط.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not transfer.items.exists():
            return Response(
                {'error': 'يجب إضافة منتجات للتحويل أولاً.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        transfer.status = 'submitted'
        transfer.save()

        return Response(StockTransferSerializer(transfer).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """الموافقة على التحويل"""
        transfer = self.get_object()

        if transfer.status != 'submitted':
            return Response(
                {'error': 'يمكن الموافقة على التحويلات المقدمة فقط.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        transfer.approved_by = request.user.get_full_name() or request.user.username
        transfer.approved_date = timezone.now()
        # الآن جاهز للشحن (يمكن إضافة حالة approved إذا لزم الأمر)
        transfer.save()

        return Response(StockTransferSerializer(transfer).data)

    @action(detail=True, methods=['post'])
    def ship(self, request, pk=None):
        """شحن التحويل - يخصم من الفرع المرسل"""
        transfer = self.get_object()

        try:
            transfer.execute_shipment()
            return Response(StockTransferSerializer(transfer).data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        """استلام التحويل - يضيف للفرع المستلم"""
        transfer = self.get_object()

        try:
            transfer.execute_receiving()
            # Mark as completed
            transfer.status = 'completed'
            transfer.save()
            return Response(StockTransferSerializer(transfer).data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """إلغاء التحويل"""
        transfer = self.get_object()

        if transfer.status in ['shipped', 'received', 'completed']:
            return Response(
                {'error': 'لا يمكن إلغاء تحويل تم شحنه أو استلامه.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        transfer.status = 'cancelled'
        transfer.save()

        return Response(StockTransferSerializer(transfer).data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """التحويلات المعلقة"""
        queryset = self.queryset.filter(status='pending')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def incoming(self, request):
        """التحويلات الواردة للفرع الحالي"""
        branch_id = request.query_params.get('branch_id')
        if not branch_id:
            return Response(
                {'error': 'يجب تحديد الفرع.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        queryset = self.queryset.filter(
            to_branch_id=branch_id, status='shipped')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def outgoing(self, request):
        """التحويلات الصادرة من الفرع الحالي"""
        branch_id = request.query_params.get('branch_id')
        if not branch_id:
            return Response(
                {'error': 'يجب تحديد الفرع.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        queryset = self.queryset.filter(
            from_branch_id=branch_id).exclude(status='cancelled')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class StockTransferItemViewSet(InventoryBaseViewSet):
    """
    ViewSet لإدارة عناصر التحويل
    """
    queryset = StockTransferItem.objects.select_related(
        'transfer', 'variant__product'
    ).all()
    serializer_class = StockTransferItemSerializer
    filterset_fields = ['transfer']
