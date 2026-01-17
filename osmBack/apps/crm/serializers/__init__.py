# apps/crm/serializers/__init__.py
"""
CRM Serializers Package
"""

# Legacy serializers (from old serializers.py - now inline for backwards compatibility)
from apps.crm.serializers.partner import (
    PartnerSerializer,
    PartnerListSerializer,
    PartnerBranchSerializer,
    PartnerPriceListSerializer,
    PartnerPriceListItemSerializer,
    CustomerPartnerLinkSerializer,
    InsuranceClaimSerializer,
    InsuranceClaimCreateSerializer,
    InsuranceClaimListSerializer,
    ClaimItemSerializer,
    ClaimDocumentSerializer,
    PartnerSettlementSerializer,
)
from rest_framework import serializers
from apps.crm.models import (
    Customer, CustomerGroup, Opportunity, Interaction,
    Complaint, Subscription, Task, Campaign, Document, Contact
)


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id', 'phone', 'identification_number',
            'first_name', 'last_name', 'email',
            'customer_type', 'is_vip',
            'accepts_marketing', 'registration_number',
            'tax_number', 'preferred_contact', 'website',
            'description',
            'address_line1', 'address_line2',
            'city', 'postal_code', 'is_active', 'is_deleted'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class InteractionSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Interaction
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ComplaintSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Complaint
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class OpportunitySerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Opportunity
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaskSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Task
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CampaignSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Campaign
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Document
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Subscription
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerGroupSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.StringRelatedField(
        many=True, source='customers', read_only=True)

    class Meta:
        model = CustomerGroup
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


# New Partner serializers

__all__ = [
    # Legacy
    'CustomerSerializer',
    'InteractionSerializer',
    'ComplaintSerializer',
    'OpportunitySerializer',
    'TaskSerializer',
    'CampaignSerializer',
    'DocumentSerializer',
    'SubscriptionSerializer',
    'CustomerGroupSerializer',
    'ContactSerializer',

    # New Partner serializers
    'PartnerSerializer',
    'PartnerListSerializer',
    'PartnerBranchSerializer',
    'PartnerPriceListSerializer',
    'PartnerPriceListItemSerializer',
    'CustomerPartnerLinkSerializer',
    'InsuranceClaimSerializer',
    'InsuranceClaimCreateSerializer',
    'InsuranceClaimListSerializer',
    'ClaimItemSerializer',
    'ClaimDocumentSerializer',
    'PartnerSettlementSerializer',
]
