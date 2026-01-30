from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.crm.filters import CustomerFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
from apps.crm.models import (
    Customer, CustomerGroup, Opportunity, Interaction,
    Complaint, Subscription, Task, Campaign, Document, Contact
)
from apps.crm.serializers import (
    CustomerSerializer, CustomerGroupSerializer, OpportunitySerializer, InteractionSerializer,
    ComplaintSerializer, SubscriptionSerializer, TaskSerializer, CampaignSerializer, DocumentSerializer, ContactSerializer
)
from core.views import BaseViewSet

# Helper for CRM permissions
# Sales, Customer Support, Admin, Owner
CRM_ROLES = ["SalesClerk", "CustomerServiceRep",
             "CRMSpecialist", "BranchManager"]
# SUPER_ROLES = ["admin", "owner"]


class CRMBaseViewSet(BaseViewSet):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=CRM_ROLES,
            required_permissions=["view_customer"]
        )
    ]

    def perform_create(self, serializer):
        # Assign creator if the model supports it and user is authenticated
        if hasattr(serializer.Meta.model, 'created_by'):
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()


class CustomerViewSet(CRMBaseViewSet):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = CustomerFilter


class CustomerGroupViewSet(CRMBaseViewSet):
    queryset = CustomerGroup.objects.all()
    serializer_class = CustomerGroupSerializer


class OpportunityViewSet(CRMBaseViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer


class InteractionViewSet(CRMBaseViewSet):
    queryset = Interaction.objects.all()
    serializer_class = InteractionSerializer


class ComplaintViewSet(CRMBaseViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer


class SubscriptionViewSet(CRMBaseViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer


class TaskViewSet(CRMBaseViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class CampaignViewSet(CRMBaseViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer


class DocumentViewSet(CRMBaseViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class ContactViewSet(BaseViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

    def get_permissions(self):
        # 🔒 Security: Allow SUBMITTING (POST) anonymously (e.g. contact form), but reading (GET) requires auth
        if self.action == 'create':
            return [AllowAny()]
        # Standard RoleOrPermissionRequired for other actions
        return [
            IsAuthenticated(),
            RoleOrPermissionRequired(
                allowed_roles=CRM_ROLES)
        ]
