from products.models import ProductVariantMarketing
from products.serializers.marketing import ProductVariantMarketingSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class ProductVariantMarketingViewSet(viewsets.ModelViewSet):
    queryset = ProductVariantMarketing.objects.all()
    serializer_class = ProductVariantMarketingSerializer
    permission_classes = [IsAuthenticated]