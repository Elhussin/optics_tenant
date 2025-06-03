from .base import BaseModel
from django.db import models

class Attributes(BaseModel):
    """Product attributes"""
    TYPE_CHOICES = [
        ('text', 'Text'),
        ('json', 'JSON'),
    ]
    name = models.CharField(max_length=100, unique=True)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='text')
    def __str__(self):
        return self.name

class AttributeValue(BaseModel):
    """Product attribute values"""
    attribute = models.ForeignKey(Attributes, related_name='values', on_delete=models.CASCADE)
    value_text = models.CharField(max_length=100)
    value_json = models.JSONField(default=dict)

    def __str__(self):
        if self.attribute.type == 'text':
            return self.value_text
        return str(self.value_json)
