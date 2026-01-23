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

from apps.crm.serializers.crm_serializers import (
    CustomerSerializer,
    InteractionSerializer,
    ComplaintSerializer,
    OpportunitySerializer,
    TaskSerializer,
    CampaignSerializer,
    DocumentSerializer,
    SubscriptionSerializer,
    CustomerGroupSerializer,
    ContactSerializer,
)

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
