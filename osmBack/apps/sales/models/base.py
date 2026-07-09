from decimal import Decimal
from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel
from apps.crm.models import Customer
from apps.branches.models import Branch

class BaseDocument(BaseModel):
    branch = models.ForeignKey(
        Branch, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='%(class)s_branch',
        verbose_name=_("Branch")
    )
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE,
        related_name='%(class)s_customer',
        verbose_name=_("Customer"),
        null=True, blank=True
    )
    partner = models.ForeignKey(
        'crm.Partner', on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='%(class)s_partner',
        verbose_name=_("Partner (B2B/Insurance)")
    )

    subtotal = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Subtotal")
    )
    tax_rate = models.DecimalField(
        max_digits=5, decimal_places=4, default=Decimal('0.15'),
        verbose_name=_("Tax Rate")
    )
    tax_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Tax Amount")
    )
    discount_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Discount Amount")
    )
    total_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Total Amount")
    )
    paid_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Paid Amount")
    )
    patient_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Patient Amount (Copay/Cash)")
    )
    partner_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_("Partner Amount (Insurance/B2B)")
    )

    class Meta:
        abstract = True

    @property
    def remaining_amount(self):
        return self.total_amount - self.paid_amount

    @property
    def is_fully_paid(self):
        return self.paid_amount >= self.total_amount


class BaseItem(BaseModel):
    from apps.products.models import ProductVariant
    product_variant = models.ForeignKey(
        ProductVariant, on_delete=models.SET_NULL, null=True,
        related_name='%(class)s_variant',
        verbose_name=_("Product")
    )
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Quantity")
    )
    unit_price = models.DecimalField(
        max_digits=12, decimal_places=4,
        verbose_name=_("Unit Price")
    )
    discount_amount = models.DecimalField(
        max_digits=12, decimal_places=4, default=0,
        verbose_name=_("Discount Amount")
    )
    tax_percent = models.DecimalField(
        max_digits=5, decimal_places=4, default=Decimal('0.15'),
        verbose_name=_("Tax Percent")
    )
    tax_amount = models.DecimalField(
        max_digits=12, decimal_places=4, default=0, editable=False,
        verbose_name=_("Tax Amount")
    )
    subtotal = models.DecimalField(
        max_digits=12, decimal_places=4, default=0, editable=False,
        verbose_name=_("Subtotal (Before Tax)")
    )
    total_price = models.DecimalField(
        max_digits=12, decimal_places=4, editable=False,
        verbose_name=_("Total Price")
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        quantity_decimal = Decimal(str(self.quantity))
        self.subtotal = (quantity_decimal * self.unit_price) - self.discount_amount
        if self.subtotal < 0:
            self.subtotal = Decimal('0')
            
        self.tax_amount = self.subtotal * self.tax_percent
        self.total_price = self.subtotal + self.tax_amount
        
        super().save(*args, **kwargs)
