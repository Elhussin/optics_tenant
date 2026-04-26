from decimal import Decimal
from django.utils.translation import gettext_lazy as _

def update_customer_balance(customer, amount, is_payment=False):
    """تحديث رصيد العميل"""
    amount = Decimal(str(amount))

    if is_payment:
        customer.current_balance -= amount
    else:
        customer.current_balance += amount

    customer.save(update_fields=['current_balance'])

def check_customer_credit_available(customer, amount):
    """التحقق من توفر الائتمان للمبلغ المطلوب"""
    if customer.credit_status != 'approved':
        return False, str(_('You do not have approved credit'))

    if customer.available_credit < amount:
        return False, str(_('Available credit ({available}) is less than requested amount ({amount})').format(
            available=customer.available_credit,
            amount=amount
        ))

    return True, str(_('Credit available'))

def get_applicable_customer_price(customer, product_variant):
    """الحصول على السعر المناسب للعميل"""
    from apps.products.models import FlexiblePrice

    # سعر خاص للعميل
    special_price = FlexiblePrice.objects.filter(
        variant=product_variant,
        customer=customer,
        is_active=True
    ).first()

    if special_price:
        return special_price.price

    # سعر المستوى (tier)
    tier_price = FlexiblePrice.objects.filter(
        variant=product_variant,
        pricing_tier=customer.pricing_tier,
        is_active=True
    ).first()

    if tier_price:
        return tier_price.price

    # السعر الافتراضي
    return product_variant.price
