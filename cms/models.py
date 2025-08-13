
# cms/pages.py
from django.db import models
from wagtail.models import Page
from wagtail.fields import StreamField, RichTextField
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
# from wagtail.admin.edit_handlers import StreamFieldPanel
from wagtail import blocks
from wagtail.api import APIField
from wagtail.images.blocks import ImageChooserBlock
from wagtail.models import Page
from wagtail.fields import RichTextField
# from wagtail.admin.panels import FieldPanel
class FeatureBlock(blocks.StructBlock):
    key = blocks.CharBlock()
    text = blocks.TextBlock()
class GenericPage(Page):
    body = RichTextField(blank=True)
    main_image = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+"
    )

    api_fields = [
        APIField("body"),
        APIField("main_image"),  # لو عايز كل بيانات الصورة
        # أو لو عايز مقاسات جاهزة:
        # APIField("main_image", serializer=ImageRenditionField("fill-800x600")),
    ]

    content_panels = Page.content_panels + [
        FieldPanel("body"),
        FieldPanel("main_image"),
    ]

class BasePage(Page):
    banner_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True, blank=True, on_delete=models.SET_NULL, related_name='+'
    )

    content_panels = Page.content_panels + [
        FieldPanel('seo_title'),
        FieldPanel('banner_image'),
    ]

    class Meta:
        abstract = True


class AboutPage(BasePage):
    intro = RichTextField(blank=True)
    features = StreamField([
        ('feature', FeatureBlock()),
    ], blank=True)

    api_fields = [
        APIField('intro'),
        APIField('features'),
    ]

    content_panels = BasePage.content_panels + [
        FieldPanel('intro'),
        FieldPanel('features'),
    ]


class ContactPage(BasePage):
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    api_fields = [
        APIField('email'),
        APIField('phone'),
    ]

    content_panels = BasePage.content_panels + [
        FieldPanel('email'),
        FieldPanel('phone'),
    ]

# class ContactPage(Page):
    body = RichTextField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    api_fields = [
        APIField('email'),
        APIField('phone'),
    ]

    content_panels = Page.content_panels + [
        FieldPanel('body'),
        FieldPanel('email'),
        FieldPanel('phone'),
    ]