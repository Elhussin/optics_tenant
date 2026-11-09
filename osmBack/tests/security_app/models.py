"""Small test tables for exercising branch filtering SQL independently of ERP setup."""
from django.db import models


class Document(models.Model):
    branch_id = models.IntegerField(null=True)
    order_id = models.IntegerField(null=True)


class Payment(models.Model):
    invoice = models.ForeignKey(Document, null=True, on_delete=models.CASCADE, related_name='+')
    order = models.ForeignKey(Document, null=True, on_delete=models.CASCADE, related_name='+')


class PaymentAllocation(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='allocations')
    invoice = models.ForeignKey(Document, on_delete=models.CASCADE)
