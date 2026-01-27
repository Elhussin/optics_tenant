from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.products.models import (
    ProductVariantReview, ProductVariantQuestion, ProductVariantAnswer, ProductVariantOffer
)


class ProductVariantReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariantReview
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError(
                _("Rating must be between 1 and 5."))
        return value


class ProductVariantQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariantQuestion
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ProductVariantAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariantAnswer
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ProductVariantOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariantOffer
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': _("End date cannot be before start date.")
            })
        return data
