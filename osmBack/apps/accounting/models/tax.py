from django.db import models
from core.models import BaseModel
from django.utils.translation import gettext_lazy as _


class TaxRate(BaseModel):
    name = models.CharField(max_length=50, verbose_name=_("Tax Name"))
    rate = models.DecimalField(
        max_digits=5, decimal_places=2, verbose_name=_("Tax Rate %"))
    country = models.CharField(
        max_length=50, blank=True, verbose_name=_("Country"))
    gl_account = models.ForeignKey(
        'accounting.ChartOfAccounts',
        on_delete=models.PROTECT,
        related_name='tax_rates',
        limit_choices_to={'account_type': 'liability'},
        verbose_name=_("GL Account (VAT Payable)")
    )
    is_active = models.BooleanField(default=True, verbose_name=_("Active"))

    class Meta:
        verbose_name = _("Tax Rate")
        verbose_name_plural = _("Tax Rates")

    def __str__(self):
        return f"{self.name} ({self.rate}%)"
