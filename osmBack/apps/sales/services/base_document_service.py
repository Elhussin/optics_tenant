from apps.sales.utils import MoneyHelper


def calculate_document_totals(document):
    """
    Calculate totals for a document (Order/Invoice).
    Applies discount to subtotal before calculating tax.
    Uses MoneyHelper for consistent rounding.
    """
    items = document.items.all()
    subtotal = sum(item.total_price for item in items)
    document.subtotal = MoneyHelper.quantize(subtotal)

    # Apply discount
    discounted_subtotal = document.subtotal - MoneyHelper.quantize(document.discount_amount)
    if discounted_subtotal < 0:
        discounted_subtotal = MoneyHelper.quantize(0)

    tax_amount = discounted_subtotal * document.tax_rate
    document.tax_amount = MoneyHelper.quantize(tax_amount)
    
    total_amount = discounted_subtotal + document.tax_amount
    document.total_amount = MoneyHelper.quantize(total_amount)

    document.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])
