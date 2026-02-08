# apps/crm/models/__init__.py
"""
CRM Models Package
"""

from apps.crm.models.customer import (
    Customer,
    Interaction,
    Complaint,
    Opportunity,
    Task,
    Campaign,
    Document,
    Subscription,
    CustomerGroup,
    Contact,
)

from apps.crm.models.partner import (
    Partner,
    PartnerBranch,
    CustomerPartnerLink,
)

from apps.crm.models.insurance import (
    InsuranceClaim,
    ClaimItem,
    ClaimDocument,
    PartnerSettlement,
)

__all__ = [
    # Customer models
    'Customer',
    'Interaction',
    'Complaint',
    'Opportunity',
    'Task',
    'Campaign',
    'Document',
    'Subscription',
    'CustomerGroup',
    'Contact',

    # Partner models
    'Partner',
    'PartnerBranch',
    'CustomerPartnerLink',

    # Insurance models
    'InsuranceClaim',
    'ClaimItem',
    'ClaimDocument',
    'PartnerSettlement',
]
