# cms/pages.py
from django.db import models
from wagtail.models import Page
from wagtail.fields import StreamField, RichTextField
from wagtail.admin.edit_handlers import FieldPanel, StreamFieldPanel, MultiFieldPanel
from wagtail import blocks
from wagtail.api import APIField
from wagtail.images.blocks import ImageChooserBlock

class FeatureBlock(blocks.StructBlock):
    key = blocks.CharBlock()
    text = blocks.TextBlock()

class AboutPage(Page):
    intro = RichTextField(blank=True)
    features = StreamField([
        ('feature', FeatureBlock()),
    ], blank=True)
    tech_title = models.CharField(max_length=255, blank=True)
    tech_description = RichTextField(blank=True)

    api_fields = [
        APIField('intro'),
        APIField('features'),
        APIField('tech_title'),
        APIField('tech_description'),
    ]

    content_panels = Page.content_panels + [
        FieldPanel('intro'),
        StreamFieldPanel('features'),
        FieldPanel('tech_title'),
        FieldPanel('tech_description'),
    ]
