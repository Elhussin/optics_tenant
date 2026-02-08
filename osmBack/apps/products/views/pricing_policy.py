from rest_framework import viewsets, permissions
from apps.products.models.pricing_policy import PricingPolicy
from apps.products.serializers.pricing_policy import PricingPolicySerializer


class PricingPolicyViewSet(viewsets.ModelViewSet):
    queryset = PricingPolicy.objects.all()
    serializer_class = PricingPolicySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PricingPolicy.objects.all().order_by('name')
