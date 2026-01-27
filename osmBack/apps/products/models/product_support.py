from django.db import models
from .product import ProductVariant
from apps.crm.models import Customer
from core.models import BaseModel
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class ProductVariantReview(BaseModel):
    ProductVariant_id = models.ForeignKey(
        ProductVariant, on_delete=models.CASCADE, related_name='reviews', verbose_name=_("Product Variant"))
    rating = models.PositiveSmallIntegerField(verbose_name=_("Rating"))
    review = models.TextField(verbose_name=_("Review"))
    reviewed_by = models.ForeignKey(
        Customer, on_delete=models.CASCADE, verbose_name=_("Reviewed By"))

    def __str__(self):
        return f"Review for {self.ProductVariant_id.product.model} by {self.reviewed_by.user.username}"

    class Meta:
        verbose_name = _("Product Variant Review")
        verbose_name_plural = _("Product Variant Reviews")


class ProductVariantQuestion(BaseModel):
    ProductVariant_id = models.ForeignKey(
        ProductVariant, on_delete=models.CASCADE, related_name='questions', verbose_name=_("Product Variant"))
    question = models.TextField(verbose_name=_("Question"))
    asked_by = models.ForeignKey(
        Customer, on_delete=models.CASCADE, verbose_name=_("Asked By"))

    def __str__(self):
        return f"Question about {self.ProductVariant_id.product.model} by {self.asked_by.user.username}"

    class Meta:
        verbose_name = _("Product Variant Question")
        verbose_name_plural = _("Product Variant Questions")


class ProductVariantAnswer(BaseModel):
    question_id = models.OneToOneField(
        ProductVariantQuestion, on_delete=models.CASCADE, related_name='answer', verbose_name=_("Question"))
    answer = models.TextField(verbose_name=_("Answer"))
    answered_by = models.ForeignKey(
        User, on_delete=models.CASCADE, verbose_name=_("Answered By"))

    def __str__(self):
        return f"Answer for {self.question_id.ProductVariant_id.product.model} question by {self.answered_by.username}"

    class Meta:
        verbose_name = _("Product Variant Answer")
        verbose_name_plural = _("Product Variant Answers")


class ProductVariantOffer(BaseModel):
    ProductVariant_id = models.ForeignKey(
        ProductVariant, on_delete=models.CASCADE, related_name='offers', verbose_name=_("Product Variant"))
    offer = models.CharField(max_length=100, verbose_name=_("Offer"))
    start_date = models.DateField(verbose_name=_("Start Date"))
    end_date = models.DateField(verbose_name=_("End Date"))

    def __str__(self):
        return f"{self.offer} on {self.ProductVariant_id.product.model}"

    class Meta:
        verbose_name = _("Product Variant Offer")
        verbose_name_plural = _("Product Variant Offers")
