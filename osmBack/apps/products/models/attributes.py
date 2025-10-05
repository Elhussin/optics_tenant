from core.models import BaseModel
from django.db import models

class Attributes(BaseModel):
    """Product attributes"""
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name

class AttributeValue(BaseModel):
    """Product attribute values"""
    attribute_id = models.ForeignKey("Attributes", related_name='values', on_delete=models.CASCADE)
    value = models.CharField(max_length=100)

    unique_together = ('attribute_id', 'value')
    def __str__(self):
        return f"{self.attribute_id.name}: {self.value}"
