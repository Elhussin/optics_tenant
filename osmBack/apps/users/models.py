from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.conf import settings
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
import django.utils.timezone as timezone
from core.models import BaseModel, SoftDeleteManager, SoftDeleteMixin


class Role(BaseModel):
    name = models.CharField(max_length=50, unique=True, verbose_name=_('Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    permissions = models.ManyToManyField(
        'Permission',
        through='RolePermission',
        related_name='roles',
        verbose_name=_('Permissions')
    )

    class Meta:
        verbose_name = _('Role')
        verbose_name_plural = _('Roles')
        ordering = ['name']

    def __str__(self):
        return self.name


class Permission(BaseModel):
    code = models.CharField(max_length=100, unique=True,
                            verbose_name=_('Code'))  # create_prescription
    description = models.TextField(blank=True, verbose_name=_('Description'))

    class Meta:
        verbose_name = _('Permission')
        verbose_name_plural = _('Permissions')
        ordering = ['code']

    def __str__(self):
        return self.code


class RolePermission(BaseModel):
    role = models.ForeignKey(
        Role, on_delete=models.CASCADE, verbose_name=_('Role'))
    permission = models.ForeignKey(
        Permission, on_delete=models.CASCADE, verbose_name=_('Permission'))

    class Meta:
        verbose_name = _('Role Permission')
        verbose_name_plural = _('Role Permissions')
        unique_together = ('role', 'permission')


class SoftDeleteUserManager(SoftDeleteMixin, UserManager):
    pass


class User(AbstractUser):
    roles = models.ManyToManyField(
        "Role", related_name="users_list", blank=True, verbose_name=_('Roles'))
    is_deleted = models.BooleanField(
        default=False, verbose_name=_('Is Deleted'))
    deleted_at = models.DateTimeField(
        null=True, blank=True, verbose_name=_('Deleted At'))
    phone = models.CharField(max_length=20, null=True,
                             blank=True, verbose_name=_('Phone'))
    client = models.ForeignKey(
        'tenants.Client', on_delete=models.CASCADE, null=True, blank=True, verbose_name=_('Client'))

    objects = SoftDeleteUserManager()

    def delete(self, using=None, keep_parents=False):
        # CHANGED: Soft delete now also deactivates the user to prevent login
        self.is_deleted = True
        self.is_active = False
        self.deleted_at = timezone.now()
        self.save()

    def save(self, *args, **kwargs):
        # If is_deleted set to True for first time
        if self.is_deleted and not self.deleted_at:
            self.deleted_at = timezone.now()
            self.is_active = False  # Ensure deactivation

        # If restoring
        elif not self.is_deleted and self.deleted_at:
            self.deleted_at = None
            # Do NOT auto-activate. Admin should manually reactivate if needed, or decide policy.
            # But usually restore implies active. Let's keep is_active as is or restore it?
            # Safer to leave is_active control to admin unless explicit restore action.

        super().save(*args, **kwargs)



