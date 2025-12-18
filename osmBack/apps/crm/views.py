from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .filters import CustomerFilter
from rest_framework.permissions import AllowAny
from .models import (
    Customer, CustomerGroup, Opportunity, Interaction, 
    Complaint, Subscription, Task, Campaign, Document, Contact
)
from .serializers import (
    CustomerSerializer, CustomerGroupSerializer, OpportunitySerializer, InteractionSerializer, 
    ComplaintSerializer, SubscriptionSerializer, TaskSerializer, CampaignSerializer, DocumentSerializer, ContactSerializer
)
from core.views import BaseViewSet


class CustomerViewSet(BaseViewSet):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = CustomerFilter
 
    def get_queryset(self):
        # Enforce ownership: only return customers created by the current user
        return Customer.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        

class OwnedResourceViewSet(BaseViewSet):
    """
    Base ViewSet for resources attached to a Customer.
    Restricts access to objects where the related customer is owned by the user.
    """
    def get_queryset(self):
        # Filter objects where the related 'customer' was created by the current user
        return self.queryset.filter(customer__created_by=self.request.user)


class CustomerGroupViewSet(BaseViewSet):
    queryset = CustomerGroup.objects.all()
    serializer_class = CustomerGroupSerializer

    def get_queryset(self):
         # Assuming groups should also be private to the user/tenant context
        return super().get_queryset()

# OpportunityViewSet: get all Opportunities related to user's customers
class OpportunityViewSet(OwnedResourceViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    
# InteractionViewSet: get all Interactions related to user's customers
class InteractionViewSet(OwnedResourceViewSet):
    queryset = Interaction.objects.all()
    serializer_class = InteractionSerializer
    
# ComplaintViewSet: get all Complaints related to user's customers
class ComplaintViewSet(OwnedResourceViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    
# SubscriptionViewSet: get all Subscriptions related to user's customers
class SubscriptionViewSet(OwnedResourceViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    
# TaskViewSet: get all Tasks related to user's customers
class TaskViewSet(OwnedResourceViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    
# CampaignViewSet
class CampaignViewSet(BaseViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer

    def get_queryset(self):
        # Campaigns related to customers owned by this user
        return Campaign.objects.filter(customers__created_by=self.request.user).distinct()
    
# DocumentViewSet: get all Documents related to user's customers
class DocumentViewSet(OwnedResourceViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    
class ContactViewSet(BaseViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

    def get_permissions(self):
        # 🔒 Security: Allow SUBMITTING (POST) anonymously, but reading (GET) requires auth
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
