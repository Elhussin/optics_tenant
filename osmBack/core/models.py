from django.db import models
from django.utils.translation import gettext_lazy as _


class SoftDeleteQuerySet(models.QuerySet):
    """
    QuerySet that handles soft deletion.
    """

    def delete(self):
        """Soft delete all objects in the queryset."""
        return super().update(is_deleted=True)

    def hard_delete(self):
        """Permanently delete all objects in the queryset."""
        return super().delete()

    def active(self):
        """Return only active (non-deleted) objects."""
        return self.filter(is_deleted=False)

    def deleted(self):
        """Return only deleted objects."""
        return self.filter(is_deleted=True)


class SoftDeleteMixin:
    """
    Mixin for Managers to implement soft deletion.
    """

    def get_queryset(self):
        """Return only non-deleted objects by default."""
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_deleted=False)

    def all_objects(self):
        """Return all objects including deleted ones."""
        return SoftDeleteQuerySet(self.model, using=self._db)


class SoftDeleteManager(SoftDeleteMixin, models.Manager):
    """
    Manager that implements soft deletion.
    """
    pass


class BaseModel(models.Model):
    """
    Abstract base model that provides:
    - Timestamp fields (created_at, updated_at)
    - Status field (is_active)
    - Soft deletion (is_deleted)
    """
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name=_("Created at"))
    updated_at = models.DateTimeField(
        auto_now=True, verbose_name=_("Updated at"))
    is_active = models.BooleanField(default=True, verbose_name=_("Active"))
    is_deleted = models.BooleanField(default=False, verbose_name=_("Deleted"))

    objects = SoftDeleteManager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        """Soft delete the object."""
        self.is_deleted = True
        self.save()

    def hard_delete(self, using=None, keep_parents=False):
        """Permanently delete the object."""
        super().delete(using=using, keep_parents=keep_parents)
