from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.sales.models import Payment, PaymentAllocation
from apps.accounting.services.entry_service import create_payment_journal_entry


@transaction.atomic
def register_payment(invoice, amount, payment_method, user=None, **kwargs):
    """
    Register a payment for an invoice.
    1. Create Payment record.
    2. Create Allocation.
    3. Update Invoice status.
    4. Create Accounting Entry.
    """

    # 1. Create Payment
    payment = Payment.objects.create(
        invoice=invoice,
        amount=amount,
        currency=invoice.currency,  # Simplified: assume same currency for now
        payment_method=payment_method,
        status='paid',  # Instant payment
        paid_at=timezone.now(),
        created_by=user,
        **kwargs
    )

    # 2. Create Allocation
    PaymentAllocation.objects.create(
        payment=payment,
        invoice=invoice,
        amount=amount
    )

    # 3. Update Invoice Status
    # Recalculate paid amount from allocations
    total_paid = sum(
        alloc.amount for alloc in invoice.payment_allocations.all())

    # We shouldn't rely on 'paid_amount' field if we want strict normalization,
    # but for performance/legacy we might keep it.
    # Let's assume we update it.
    if hasattr(invoice, 'paid_amount'):
        invoice.paid_amount = total_paid

    if total_paid >= invoice.total_amount:
        invoice.status = 'paid'
    elif total_paid > 0:
        invoice.status = 'partially_paid'

    invoice.save()

    # 4. Accounting
    create_payment_journal_entry(payment)

    return payment
