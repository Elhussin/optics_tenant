from django.db import models

# Create your models here.
from django.db import models
from django.utils.translation import gettext_lazy as _

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created at"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated at"))
    is_active = models.BooleanField(default=True, verbose_name=_("Active"))
    is_deleted = models.BooleanField(default=False, verbose_name=_("Deleted"))

    class Meta:
        abstract = True  # without this line, it will create a table in the database

    # def delete(self, using=None, keep_parents=False):
    #     """soft delete"""
    #     self.is_deleted = True
    #     self.save()

    # def __str__(self):
    #     return f"{self.__class__.__name__} #{self.pk}"
