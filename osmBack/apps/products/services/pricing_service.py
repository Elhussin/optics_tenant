from django.utils import timezone
from django.db.models import Q
from apps.products.models import FlexiblePrice


class PriceCalculator:
    """
    Unified service for calculating product prices based on context.

    Hierarchy (Precedence):
    1. Policy-Specific Overrides (if Invoice implies a policy)
        a. Specific Customer in Policy
        b. Specific Partner in Policy
        c. Specific Tier in Policy
        d. Policy Base
    2. Customer Specific (Direct Link)
    3. Partner Specific (Direct Link)
    4. Group/Tier Specific (Customer Group, Pricing Tier)
    5. Context Specific (Branch, Quantity)
    6. Global/Base Selection
    """

    @classmethod
    def calculate_price(cls, variant, context=None):
        """
        Calculate the best price for a variant given the context.

        Args:
            variant: ProductVariant instance
            context: dict containing keys like:
                - customer: Customer instance
                - partner: Partner instance
                - policy: PricingPolicy instance
                - branch: Branch instance
                - quantity: int (default 1)
                - date: date (default today)

        Returns:
            dict with keys:
                - price: Decimal
                - source_type: str (e.g., 'policy', 'customer', 'tier')
                - source_name: str (description)
                - rule: FlexiblePrice instance (optional)
        """
        context = context or {}
        quantity = context.get('quantity', 1)
        date = context.get('date', timezone.now().date())
        customer = context.get('customer')
        partner = context.get('partner')
        policy = context.get('policy')
        branch = context.get('branch')

        base_resp = {
            'price': variant.price_sale,
            'source_type': 'base',
            'source_name': 'Base Price',
            'rule': None
        }

        # 0. Fetch all potentially applicable rules for this variant
        # We filter by basics (Active, Date, Quantity) to reduce memory set
        rules = FlexiblePrice.objects.filter(
            variant=variant,
            is_active=True,
            min_quantity__lte=quantity
        ).filter(
            Q(start_date__isnull=True) | Q(start_date__lte=date),
            Q(end_date__isnull=True) | Q(end_date__gte=date),
            Q(max_quantity__isnull=True) | Q(max_quantity__gte=quantity)
        ).select_related('pricing_policy', 'customer', 'partner', 'branch', 'customer_group')

        # Convert to list for Python-side filtering (often faster for complex priority logic than valid SQL)
        # Sort by priority desc (higher number = higher priority defined by user manual override)
        rules = sorted(rules, key=lambda x: x.priority, reverse=True)

        # Helper to find first match in a subset
        def find_match(candidates, check_fn):
            for rule in candidates:
                if check_fn(rule):
                    return rule
            return None

        # ---------------------------------------------------------
        # 1. PRICING POLICY SCOPE (Highest Priority if Policy exists)
        # ---------------------------------------------------------
        if policy:
            policy_rules = [
                r for r in rules if r.pricing_policy_id == policy.id]

            # 1.a Customer in Policy
            if customer:
                match = find_match(
                    policy_rules, lambda r: r.customer_id == customer.id)
                if match:
                    return cls._format_response(match, variant, 'policy_customer')

            # 1.b Partner in Policy
            if partner:
                match = find_match(
                    policy_rules, lambda r: r.partner_id == partner.id)
                if match:
                    return cls._format_response(match, variant, 'policy_partner')

            # 1.c Tier/Group in Policy
            if customer:
                groups = list(
                    customer.groups.all().values_list('id', flat=True))
                match = find_match(policy_rules, lambda r: (
                    (r.pricing_tier and r.pricing_tier == customer.pricing_tier) or
                    (r.customer_group_id and r.customer_group_id in groups)
                ))
                if match:
                    return cls._format_response(match, variant, 'policy_tier')

            # 1.d Policy General (No specific target)
            match = find_match(policy_rules, lambda r: (
                r.customer is None and
                r.partner is None and
                r.pricing_tier is None and
                r.customer_group is None
            ))
            if match:
                return cls._format_response(match, variant, 'policy_base')

        # ---------------------------------------------------------
        # 2. SPECIFIC ENTITY SCOPE (No Policy)
        # ---------------------------------------------------------
        # Exclude rules that belong to *other* policies (if we are here, we are looking for non-policy prices)
        # NOTE: A rule with pricing_policy=None is a "General Rule"
        general_rules = [r for r in rules if r.pricing_policy is None]

        # 2.a Specific Customer
        if customer:
            match = find_match(
                general_rules, lambda r: r.customer_id == customer.id)
            if match:
                return cls._format_response(match, variant, 'customer')

        # 2.b Specific Partner
        if partner:
            match = find_match(
                general_rules, lambda r: r.partner_id == partner.id)
            if match:
                return cls._format_response(match, variant, 'partner')

        # ---------------------------------------------------------
        # 3. SEGMENT / GROUP SCOPE
        # ---------------------------------------------------------
        if customer:
            # 3.a Pricing Tier
            if customer.pricing_tier and customer.pricing_tier != 'retail':
                match = find_match(
                    general_rules, lambda r: r.pricing_tier == customer.pricing_tier)
                if match:
                    return cls._format_response(match, variant, 'tier')

            # 3.b Customer Group
            groups = list(customer.groups.all().values_list('id', flat=True))
            if groups:
                match = find_match(
                    general_rules, lambda r: r.customer_group_id in groups)
                if match:
                    return cls._format_response(match, variant, 'group')

        # ---------------------------------------------------------
        # 4. CONTEXT SCOPE
        # ---------------------------------------------------------
        # 4.a Branch
        if branch:
            match = find_match(
                general_rules, lambda r: r.branch_id == branch.id)
            if match:
                return cls._format_response(match, variant, 'branch')

        # 4.b Quantity (Implicitly handled by sorting if a rule exists just for Quantity > X)
        # We look for a rule that has NO specific entity targets but fits the quantity
        match = find_match(general_rules, lambda r: (
            r.customer is None and
            r.partner is None and
            r.pricing_tier is None and
            r.customer_group is None and
            r.branch is None
        ))
        if match:
            return cls._format_response(match, variant, 'quantity')

        return base_resp

    @staticmethod
    def _format_response(rule, variant, source_type):
        price = rule.get_final_price(variant.price_sale)
        return {
            'price': price,
            'source_type': source_type,
            'source_name': str(rule),
            'rule': rule
        }


# Backwards compatibility wrapper (optional)
def calculate_price(variant, customer=None, branch=None, group=None, quantity=1, pricing_policy=None):
    context = {
        'customer': customer,
        'branch': branch,
        'quantity': quantity,
        'policy': pricing_policy
    }
    # group is handled via customer.groups if customer is passed.
    # If only group is passed without customer, we might need ad-hoc handling,
    # but usually customer is the key.

    result = PriceCalculator.calculate_price(variant, context)
    return result['price']
