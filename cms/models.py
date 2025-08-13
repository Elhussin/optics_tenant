# from django.db import models

# # Create your models here.
# from wagtail.models import Page
# from wagtail.fields import RichTextField
# from wagtail.admin.panels import FieldPanel

# class HomePage(Page):
#     body = RichTextField(blank=True)

#     content_panels = Page.content_panels + [
#         FieldPanel('body'),
#     ]

# class AboutPage(Page):
#     body = RichTextField(blank=True)
#     content_panels = Page.content_panels + [
#         FieldPanel('body'),
#     ]

# class BlogPage(Page):
#     intro = RichTextField(blank=True)
#     content_panels = Page.content_panels + [
#         FieldPanel('intro'),
#     ]

# class CareersPage(Page):
#     body = RichTextField(blank=True)
#     content_panels = Page.content_panels + [
#         FieldPanel('body'),
#     ]


# class FAQPage(Page):
#     body = RichTextField(blank=True)
#     content_panels = Page.content_panels + [
#         FieldPanel('body'),
#     ]

# class PrivacyPage(Page):
#     body = RichTextField(blank=True)
#     content_panels = Page.content_panels + [
#         FieldPanel('body'),
#     ]

# class SupportPage(Page):
#     body = RichTextField(blank=True)
#     content_panels = Page.content_panels + [
#         FieldPanel('body'),
#     ]

# class TermsPage(Page):
#     body = RichTextField(blank=True)
#     content_panels = Page.content_panels + [
#         FieldPanel('body'),
#     ]
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
        FieldPanel('features'),
        FieldPanel('tech_title'),
        FieldPanel('tech_description'),
    ]

class GenericPage(Page):
    body = RichTextField(blank=True)

    content_panels = Page.content_panels + [
        FieldPanel("body"),
    ]

class ContactPage(Page):
    body = RichTextField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    content_panels = Page.content_panels + [
        FieldPanel('body'),
        FieldPanel('email'),
        FieldPanel('phone'),
    ]
