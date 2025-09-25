
from rest_framework import viewsets
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .filters import CustomerFilter
from rest_framework.permissions import AllowAny
from .models import (
    Customer, CustomerGroup, Opportunity, Interaction, 
    Complaint, Subscription, Task,Campaign,Document,Contact
)
from .serializers import (
    CustomerSerializer, CustomerGroupSerializer, OpportunitySerializer, InteractionSerializer, 
    ComplaintSerializer, SubscriptionSerializer, TaskSerializer,CampaignSerializer,DocumentSerializer,ContactSerializer
)


class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CustomerFilter
 
    def get_queryset(self):
        return Customer.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        

class CustomerGroupViewSet(viewsets.ModelViewSet):
    queryset = CustomerGroup.objects.all()
    serializer_class = CustomerGroupSerializer

    # def get_permissions(self):
    #     return get_default_permissions()

# OpportunityViewSet: get all ``Opportunity`` objects

class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer

    # def get_permissions(self):
    #     return super().get_default_permissions()
    
# InteractionViewSet: get all ``Interaction`` objects

class InteractionViewSet(viewsets.ModelViewSet):
    queryset = Interaction.objects.all()
    serializer_class = InteractionSerializer

    # def get_permissions(self):
    #     return super().get_default_permissions()
    
# ComplaintViewSet: get all ``Complaint`` objects

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer

    # def get_permissions(self):
    #     return super().get_default_permissions()
    
# SubscriptionViewSet: get all ``Subscription`` objects

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

    # def get_permissions(self):
    #     return super().get_default_permissions()
    
# TaskViewSet: get all ``Task`` objects

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    # def get_permissions(self):
    #     return super().get_default_permissions()
    
# CampaignViewSet: get all ``Campaign`` objects

class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer

    # def get_permissions(self):
    #     return super().get_default_permissions()
    
# DocumentViewSet: get all ``Document`` objects

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    # def get_permissions(self):
    #     return super().get_default_permissions()
    
class ContactViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    
