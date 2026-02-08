from django.utils import timezone
from django.db.models import Q
from apps.products.models import FlexiblePrice


def calculate_price(variant, customer=None, branch=None, group=None, quantity=1, pricing_policy=None):
    """
    Calculates the best price for a variant based on context and pricing policy.
    Hierarchy:
    1. Special Price in FlexiblePrice (if valid)
    2. Base Price in FlexiblePrice (if valid)
    3. Variant Base Price
    """
    base_price = variant.price_sale

    if not pricing_policy:
        return base_price

    # Query Flexible Prices linked to Policy and Variant
    queryset = FlexiblePrice.objects.filter(
        pricing_policy=pricing_policy,
        product_variant=variant,
        is_active=True
    )

    # Filter by Date
    now = timezone.now()
    queryset = queryset.filter(
        Q(date_start__lte=now) | Q(date_start__isnull=True),
        Q(date_end__gte=now) | Q(date_end__isnull=True)
    )

    # Filter by Quantity
    queryset = queryset.filter(min_quantity__lte=quantity)

    # Filter by Context (Customer > Group > Branch > Global)
    # We want to find the most specific match.
    # Logic:
    # - If customer is set, match customer OR null (but prefer customer)
    # - If group is set, match group OR null
    # - If branch is set, match branch OR null

    # This is complex to do in one query with proper precedence.
    # Simplified approach: Fetch potential matches and sort in Python or use specific queries.

    # Let's try to find exact customer match first
    if customer:
        match = queryset.filter(customer=customer).order_by(
            '-priority', '-id').first()
        if match:
            return match.special_price if match.special_price else match.price

    # Then Group
    if group:
        match = queryset.filter(group=group).order_by(
            '-priority', '-id').first()
        if match:
            return match.special_price if match.special_price else match.price

    # Then Branch
    if branch:
        match = queryset.filter(branch=branch).order_by(
            '-priority', '-id').first()
        if match:
            return match.special_price if match.special_price else match.price

    # Then Global (no specific context)
    match = queryset.filter(
        customer__isnull=True,
        group__isnull=True,
        branch__isnull=True
    ).order_by('-priority', '-id').first()

    if match:
        return match.special_price if match.special_price else match.price

    return base_price
