from core.models import BaseModel
from django.db import models
from django.utils.translation import gettext_lazy as _


class PricingPolicy(BaseModel):
    name = models.CharField(max_length=100, verbose_name=_("Policy Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    is_active = models.BooleanField(default=True, verbose_name=_("Active"))

    class Meta:
        verbose_name = _("Pricing Policy")
        verbose_name_plural = _("Pricing Policies")

    def __str__(self):
        return self.name
