from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.products.models import Attribute, AttributeValue
from apps.products.serializers.attributes import AttributeSerializer, AttributeValueSerializer
from core.views import BaseViewSet

from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired


ATTRIBUTES_RELATED_FIELDS = [
    "attribute__name",
]
ATTRIBUTES_FIELD_LABELS = {
    "attribute__name": "Attribute Name",
    "value": "Value",
}


ATTRIBUTES_FILTER_FIELDS = {
    "attribute__name": ["icontains"],
    "value": ["icontains"],
}
INVENTORY_ROLES = ["InventoryManager", "BranchManager", "SalesClerk"]

class AttributesViewSet(BaseViewSet):
    queryset = Attribute.objects.all()
    serializer_class = AttributeSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
           allowed_roles=INVENTORY_ROLES,
           required_permissions=["view_product"] 

        )
    ]
class AttributeValueViewSet(BaseViewSet):
    queryset = AttributeValue.objects.all()
    serializer_class = AttributeValueSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
           allowed_roles=INVENTORY_ROLES,
           required_permissions=["view_product"] 

        )
    ]
    search_fields = ATTRIBUTES_RELATED_FIELDS
    field_labels = ATTRIBUTES_FIELD_LABELS
    filter_fields = ATTRIBUTES_FILTER_FIELDS
