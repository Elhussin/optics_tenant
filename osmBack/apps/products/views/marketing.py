from apps.products.models import ProductVariantMarketing
from apps.products.serializers.marketing import ProductVariantMarketingSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
MARKETING_ROLES = ["InventoryManager", "BranchManager", "CRMSpecialist"]
class ProductVariantMarketingViewSet(BaseViewSet):
    queryset = ProductVariantMarketing.objects.all()
    serializer_class = ProductVariantMarketingSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=MARKETING_ROLES,
            required_permissions=["view_product"]
        )
    ]
