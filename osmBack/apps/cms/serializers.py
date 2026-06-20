from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from core.utils.ReusableFields import ReusableFields
from core.utils.check_unique_field import check_unique_field
from .models import Page, PageContent, ContactUs

class PageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageContent
        fields = [
            'language', 'title', 'content',
            'seo_title', 'meta_description', 'meta_keywords'
        ]

class PageSerializer(serializers.ModelSerializer):
    translations = PageContentSerializer(many=True)
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())
    client = serializers.HiddenField(
        default=ReusableFields.CurrentUserClientDefault())

    class Meta:
        model = Page
        fields = [
            'id', 'default_language', 'is_published', 'slug', 'is_deleted', 'is_active',
            'created_at', 'updated_at', 'translations', 'author', 'client'
        ]

    def validate_slug(self, value):
        return check_unique_field(Page, 'slug', value, self.instance)

    def create(self, validated_data):
        translations_data = validated_data.pop('translations')
        page = Page.objects.create(**validated_data)

        for translation_data in translations_data:
            PageContent.objects.create(page=page, **translation_data)

        return page

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if translations_data:
            new_languages = {t.get('language')
                             for t in translations_data if t.get('language')}

            instance.translations.exclude(language__in=new_languages).delete()

            for translation_data in translations_data:
                language = translation_data.get('language')
                if language:
                    PageContent.objects.update_or_create(
                        page=instance,
                        language=language,
                        defaults=translation_data
                    )

        instance.refresh_from_db()
        return instance

class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = '__all__'

    def validate_message(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError(
                _('Message must be at least 10 characters long')
            )
        return value

    def validate_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError(
                _('Name must be at least 2 characters long')
            )
        return value

    def validate_phone(self, value):
        import re
        if value and not re.match(r'^\+?[\d\s\-\(\)]{10,20}$', value):
            raise serializers.ValidationError(
                _('Please enter a valid phone number')
            )
        return value
