# apps/crm/views/__init__.py
"""
CRM Views Package
"""

# Legacy/Customer views
from apps.crm.views.customer import (
    CRMBaseViewSet,
    CustomerViewSet,
    CustomerGroupViewSet,
    OpportunityViewSet,
    InteractionViewSet,
    ComplaintViewSet,
    SubscriptionViewSet,
    TaskViewSet,
    CampaignViewSet,
    DocumentViewSet,
    ContactViewSet,
)

# Partner and Insurance views
from apps.crm.views.partner import (
    PartnerViewSet,
    PartnerBranchViewSet,
    PartnerPriceListViewSet,
    PartnerPriceListItemViewSet,
    CustomerPartnerLinkViewSet,
    InsuranceClaimViewSet,
    ClaimItemViewSet,
    ClaimDocumentViewSet,
    PartnerSettlementViewSet,
)

__all__ = [
    # Customer views
    'CRMBaseViewSet',
    'CustomerViewSet',
    'CustomerGroupViewSet',
    'OpportunityViewSet',
    'InteractionViewSet',
    'ComplaintViewSet',
    'SubscriptionViewSet',
    'TaskViewSet',
    'CampaignViewSet',
    'DocumentViewSet',
    'ContactViewSet',

    # Partner views
    'PartnerViewSet',
    'PartnerBranchViewSet',
    'PartnerPriceListViewSet',
    'PartnerPriceListItemViewSet',
    'CustomerPartnerLinkViewSet',
    'InsuranceClaimViewSet',
    'ClaimItemViewSet',
    'ClaimDocumentViewSet',
    'PartnerSettlementViewSet',
]
