from decimal import Decimal
from django.utils.translation import gettext_lazy as _

def update_partner_balance(partner, amount, is_payment=False):
    """تحديث رصيد الشريك"""
    amount = Decimal(str(amount))

    if is_payment:
        partner.current_balance -= amount
    else:
        partner.current_balance += amount

    partner.save(update_fields=['current_balance'])

def check_partner_credit_available(partner, amount):
    """التحقق من توفر الائتمان للمبلغ المطلوب"""
    if partner.credit_status != 'approved':
        return False, str(_('You do not have approved credit'))

    if partner.available_credit < amount:
        return False, str(_('Available credit ({available}) is less than requested amount ({amount})').format(
            available=partner.available_credit,
            amount=amount
        ))

    return True, str(_('Credit available'))

def get_applicable_partner_price(partner, product_variant):
    """الحصول على السعر المناسب للشريك"""
    from apps.products.models import FlexiblePrice

    # سعر خاص للشريك
    special_price = FlexiblePrice.objects.filter(
        variant=product_variant,
        partner=partner,
        is_active=True
    ).first()

    if special_price:
        return special_price.price

    # سعر المستوى (tier)
    tier_price = FlexiblePrice.objects.filter(
        variant=product_variant,
        pricing_tier=partner.pricing_tier,
        is_active=True
    ).first()

    if tier_price:
        return tier_price.price

    # السعر الافتراضي
    return product_variant.price
