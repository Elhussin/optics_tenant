from rest_framework.permissions import IsAuthenticated
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

from apps.products.models import (
    ProductVariantReview, ProductVariantQuestion, ProductVariantAnswer, ProductVariantOffer
)
from apps.products.serializers.product_support import (
    ProductVariantReviewSerializer, ProductVariantQuestionSerializer,
    ProductVariantAnswerSerializer, ProductVariantOfferSerializer
)

SUPPORT_ROLES = ["CustomerServiceRep", "CRMSpecialist", "BranchManager"]


class ProductVariantReviewViewSet(BaseViewSet):
    """
    ViewSet for managing customer reviews on product variants.
    """
    queryset = ProductVariantReview.objects.all()
    serializer_class = ProductVariantReviewSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=SUPPORT_ROLES,
            required_permissions=["view_product"]
        )
    ]


class ProductVariantQuestionViewSet(BaseViewSet):
    """
    ViewSet for managing customer questions about product variants.
    """
    queryset = ProductVariantQuestion.objects.all()
    serializer_class = ProductVariantQuestionSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=SUPPORT_ROLES,
            required_permissions=["view_product"]
        )
    ]


class ProductVariantAnswerViewSet(BaseViewSet):
    """
    ViewSet for managing answers to customer questions.
    """
    queryset = ProductVariantAnswer.objects.all()
    serializer_class = ProductVariantAnswerSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=SUPPORT_ROLES,
            required_permissions=["view_product"]
        )
    ]


class ProductVariantOfferViewSet(BaseViewSet):
    """
    ViewSet for managing special offers on product variants.
    """
    queryset = ProductVariantOffer.objects.all()
    serializer_class = ProductVariantOfferSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=SUPPORT_ROLES,
            required_permissions=["view_product"]
        )
    ]
