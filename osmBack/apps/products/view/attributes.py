from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.products.models import Attributes, AttributeValue
from apps.products.serializers.attributes import AttributesSerializer, AttributeValueSerializer

class AttributesViewSet(viewsets.ModelViewSet):
    queryset = Attributes.objects.all()
    serializer_class = AttributesSerializer
    permission_classes = [IsAuthenticated]

class AttributeValueViewSet(viewsets.ModelViewSet):
    queryset = AttributeValue.objects.all()
    serializer_class = AttributeValueSerializer
    permission_classes = [IsAuthenticated]

