from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.products.models import ProductVariantMarketing


class ProductVariantMarketingSerializer(serializers.ModelSerializer):
    variant_name = serializers.CharField(source='variant.name', read_only=True)

    class Meta:
        model = ProductVariantMarketing
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate_title(self, value):
        return value.strip()

    def validate_slug(self, value):
        return value.strip()

    def validate(self, data):
        """Ensure SEO best practices."""
        seo_image = data.get('seo_image')
        seo_image_alt = data.get('seo_image_alt')

        # Warning: Require Alt text if Image is provided (Best Practice)
        if seo_image and not seo_image_alt:
            raise serializers.ValidationError({
                'seo_image_alt': _("SEO Image Alt Text is required when an SEO Image is provided.")
            })

        return data
