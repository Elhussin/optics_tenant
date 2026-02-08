from .views import (
    # Customer views
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
    # Partner views
    PartnerViewSet, PartnerBranchViewSet, CustomerPartnerLinkViewSet,
    InsuranceClaimViewSet, ClaimItemViewSet, ClaimDocumentViewSet,
    PartnerSettlementViewSet
)
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
# router.register(r'owned-resources', OwnedResourceViewSet, basename='owned-resource')
router.register(r'customer-groups', CustomerGroupViewSet,
                basename='customer-group')
router.register(r'opportunities', OpportunityViewSet, basename='opportunity')
router.register(r'interactions', InteractionViewSet, basename='interaction')
router.register(r'complaints', ComplaintViewSet, basename='complaint')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'contact-us', ContactViewSet, basename='contact-us')

# Partners & Insurance
router.register(r'partners', PartnerViewSet, basename='partner')
router.register(r'partner-branches', PartnerBranchViewSet,
                basename='partner-branch')

router.register(r'customer-partner-links',
                CustomerPartnerLinkViewSet, basename='customer-partner-link')
router.register(r'insurance-claims', InsuranceClaimViewSet,
                basename='insurance-claim')
router.register(r'claim-items', ClaimItemViewSet, basename='claim-item')
router.register(r'claim-documents', ClaimDocumentViewSet,
                basename='claim-document')
router.register(r'partner-settlements', PartnerSettlementViewSet,
                basename='partner-settlement')

urlpatterns = [
    path('', include(router.urls)),
]
