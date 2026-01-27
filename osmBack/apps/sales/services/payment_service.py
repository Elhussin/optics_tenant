def apply_payment(invoice, amount):
    """
    Apply payment to invoice and update status.
    """
    if amount <= 0:
        return

    invoice.paid_amount += amount

    # Update status
    if invoice.paid_amount >= invoice.total_amount:
        invoice.status = 'paid'
    elif invoice.paid_amount > 0:
        invoice.status = 'partially_paid'

    invoice.save(update_fields=['paid_amount', 'status'])
