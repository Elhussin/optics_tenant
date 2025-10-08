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

    class Meta:
        unique_together = ('attribute_id', 'value')
    def __str__(self):
        return f"{self.attribute_id.name}: {self.value}"


# class Attributes(BaseModel):
#     name = models.CharField(max_length=100, unique=True)
#     values = models.ManyToManyField("AttributeValue", through="AttributesAttributeValue", related_name="attributes")

#     def __str__(self):
#         return self.name

# class AttributeValue(BaseModel):
#     value = models.CharField(max_length=100, unique=True)

#     def __str__(self):
#         return self.value

# class AttributesAttributeValue(BaseModel):
#     attribute = models.ForeignKey(Attributes, on_delete=models.CASCADE)
#     value = models.ForeignKey(AttributeValue, on_delete=models.CASCADE)

#     class Meta:
#         unique_together = ('attribute', 'value')
