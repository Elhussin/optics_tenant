from rest_framework import serializers
from products.models import (
    ProductVariantReview, ProductVariantQuestion, ProductVariantAnswer, ProductVariantOffer
)
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from products.serializers.product_support import (
    ProductVariantReviewSerializer, ProductVariantQuestionSerializer,
    ProductVariantAnswerSerializer, ProductVariantOfferSerializer
)

class ProductVariantReviewViewSet(viewsets.ModelViewSet):
    queryset = ProductVariantReview.objects.all()
    serializer_class = ProductVariantReviewSerializer
    permission_classes = [IsAuthenticated]

class ProductVariantQuestionViewSet(viewsets.ModelViewSet):
    queryset = ProductVariantQuestion.objects.all()
    serializer_class = ProductVariantQuestionSerializer
    permission_classes = [IsAuthenticated]

class ProductVariantAnswerViewSet(viewsets.ModelViewSet):
    queryset = ProductVariantAnswer.objects.all()
    serializer_class = ProductVariantAnswerSerializer
    permission_classes = [IsAuthenticated]

class ProductVariantOfferViewSet(viewsets.ModelViewSet):
    queryset = ProductVariantOffer.objects.all()
    serializer_class = ProductVariantOfferSerializer
    permission_classes = [IsAuthenticated]

