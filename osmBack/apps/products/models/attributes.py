from core.models import BaseModel
from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _


class Attribute(BaseModel):
    """Product attributes"""
    name = models.CharField(max_length=100, unique=True,
                            verbose_name=_("Name"))

    class Meta:
        verbose_name = _("Attribute")
        verbose_name_plural = _("Attributes")

    def __str__(self):
        return self.name


class AttributeValue(BaseModel):
    """Product attribute values"""
    attribute = models.ForeignKey(
        "Attribute",
        related_name='values',
        on_delete=models.CASCADE,
        verbose_name=_("Attribute")
    )
    value = models.CharField(max_length=100, verbose_name=_("Value"))
    label = models.CharField(max_length=100, blank=True,
                             null=True, verbose_name=_("Label"))
    unique_key = models.CharField(
        max_length=255, unique=True, editable=False, verbose_name=_("Unique Key"))

    class Meta:
        unique_together = ('attribute', 'value')
        verbose_name = _("Attribute Value")
        verbose_name_plural = _("Attribute Values")

    def save(self, *args, **kwargs):
        # Generate label automatically if not provided
        if not self.label:
            self.label = self.value

        # Unique key depends only on attribute + value
        # slugify removes spaces and converts text to URL-friendly format
        base_key = f"{self.attribute}_{self.value}"
        self.unique_key = slugify(base_key)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.attribute.name}: {self.label or self.value}"
