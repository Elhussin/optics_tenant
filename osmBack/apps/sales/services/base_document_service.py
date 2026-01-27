from decimal import Decimal


def calculate_document_totals(document):
    """
    Calculate totals for a document (Order/Invoice).
    Applies discount to subtotal before calculating tax.
    """
    items = document.items.all()
    document.subtotal = sum(item.total_price for item in items)

    # Apply discount
    discounted_subtotal = document.subtotal - document.discount_amount
    if discounted_subtotal < 0:
        discounted_subtotal = Decimal('0')

    document.tax_amount = discounted_subtotal * document.tax_rate
    document.total_amount = discounted_subtotal + document.tax_amount

    document.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])
