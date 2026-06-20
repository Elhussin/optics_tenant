# apps/sales/services/wholesale_service.py
"""
Wholesale Service
"""

from django.db import models
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import logging

logger = logging.getLogger(__name__)


class WholesaleService:
    """
    Service for managing wholesale operations
    """

    @classmethod
    def get_order_pricing(cls, partner, order_items, branch=None):
        """
        Get pricing for wholesale orders

        Args:
            partner: Partner
            order_items: List of items [{variant, quantity}]
            branch: Branch (optional)

        Returns:
            dict: {items: [...], subtotal, discount, total}
        """
        from apps.products.models import FlexiblePrice

        priced_items = []
        subtotal = Decimal('0')
        total_discount = Decimal('0')

        for item in order_items:
            variant = item['variant']
            quantity = item.get('quantity', 1)

            # Find appropriate price
            price_info = cls.get_variant_price(
                variant, partner, quantity, branch
            )

            line_total = price_info['price'] * quantity
            line_discount = (
                variant.price - price_info['price']) * quantity if price_info['price'] < variant.price else Decimal('0')

            priced_items.append({
                'variant': variant,
                'quantity': quantity,
                'original_price': variant.price,
                'unit_price': price_info['price'],
                'discount_type': price_info['discount_type'],
                'discount_source': price_info['source'],
                'line_discount': line_discount,
                'line_total': line_total,
            })

            subtotal += line_total
            total_discount += line_discount

        # Apply additional partner level discount
        partner_discount = Decimal('0')
        if partner.default_discount > 0:
            partner_discount = subtotal * \
                (partner.default_discount / Decimal('100'))

        return {
            'items': priced_items,
            'subtotal': subtotal,
            'line_discounts': total_discount,
            'partner_discount': partner_discount,
            'total_discount': total_discount + partner_discount,
            'final_total': subtotal - partner_discount,
        }

    @classmethod
    def get_variant_price(cls, variant, partner=None, quantity=1, branch=None):
        """
        Get appropriate price for a variant using unified PriceCalculator
        """
        from apps.products.services.pricing_service import PriceCalculator

        context = {
            'partner': partner,
            'quantity': quantity,
            'branch': branch,
            # 'policy': None  # Wholesale service typically doesn't know policy yet, unless passed
        }

        result = PriceCalculator.calculate_price(variant, context)

        return {
            'price': result['price'],
            'discount_type': result['source_type'],
            'source': result['source_name'],
        }

    @classmethod
    def validate_wholesale_order(cls, partner, order_items, use_credit=False):
        """
        Validate wholesale order

        Returns:
            tuple: (is_valid, errors)
        """
        errors = []

        # Check minimum order amount
        if partner.minimum_order_amount > 0:
            pricing = cls.get_order_pricing(partner, order_items)
            if pricing['final_total'] < partner.minimum_order_amount:
                errors.append(
                    _("Minimum order amount is {0} SAR, current amount: {1} SAR").format(
                        partner.minimum_order_amount, pricing['final_total']
                    )
                )

        # Check credit if payment is deferred
        if use_credit:
            from apps.crm.services.partner_service import check_partner_credit_available
            pricing = cls.get_order_pricing(partner, order_items)
            is_available, message = check_partner_credit_available(
                partner, pricing['final_total'])
            if not is_available:
                errors.append(message)

        # Check contract validity
        if partner.contract_end:
            today = timezone.now().date()
            if partner.contract_end < today:
                errors.append(_("Contract with this partner has expired"))

        return len(errors) == 0, errors

    @classmethod
    @transaction.atomic
    def create_wholesale_order(cls, partner, items, branch, user, payment_method='credit', notes=''):
        """
        Create wholesale order
        """
        from apps.sales.models import Order, OrderItem

        # Validate order
        use_credit = payment_method == 'credit'
        is_valid, errors = cls.validate_wholesale_order(
            partner, items, use_credit)

        if not is_valid:
            raise ValueError('\n'.join(errors))

        # Get pricing
        pricing = cls.get_order_pricing(partner, items, branch)

        # Create order
        order = Order.objects.create(
            branch=branch,
            partner=partner,
            order_type='wholesale',
            payment_method=payment_method,
            subtotal=pricing['subtotal'],
            discount_amount=pricing['total_discount'],
            total_amount=pricing['final_total'],
            notes=notes,
            sales_person=user.sales_profile if hasattr(
                user, 'sales_profile') else None,
        )

        # Create order items
        for item_data in pricing['items']:
            OrderItem.objects.create(
                order=order,
                product_variant=item_data['variant'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                original_price=item_data['original_price'],
                discount_amount=item_data['line_discount'],
                total_price=item_data['line_total'],
            )

        # Update partner balance if credit
        if payment_method == 'credit':
            from apps.crm.services.partner_service import update_partner_balance
            update_partner_balance(partner, pricing['final_total'], is_payment=False)

        logger.info(
            f"Wholesale order {order.order_number} created for partner {partner}")
        return order

    @classmethod
    def get_partner_statement(cls, partner, start_date=None, end_date=None):
        """
        Get statement of account for a partner
        """
        from apps.sales.models import Order, Payment

        filters = {'partner': partner}
        if start_date:
            filters['created_at__date__gte'] = start_date
        if end_date:
            filters['created_at__date__lte'] = end_date

        # Get orders (invoices)
        orders = Order.objects.filter(
            **filters, order_type='wholesale').order_by('created_at')

        # Get payments
        payment_filters = filters.copy()
        payment_filters.pop('partner', None)
        payment_filters['invoice__partner'] = partner
        payments = Payment.objects.filter(
            **payment_filters).order_by('created_at')

        # Combine and sort transactions
        transactions = []
        running_balance = partner.opening_balance if hasattr(
            partner, 'opening_balance') else Decimal('0')

        for order in orders:
            running_balance += order.final_total
            transactions.append({
                'date': order.created_at,
                'type': 'invoice',
                'reference': order.order_number,
                'debit': order.final_total,
                'credit': Decimal('0'),
                'balance': running_balance,
            })

        for payment in payments:
            running_balance -= payment.amount
            transactions.append({
                'date': payment.created_at,
                'type': 'payment',
                'reference': payment.receipt_number,
                'debit': Decimal('0'),
                'credit': payment.amount,
                'balance': running_balance,
            })

        # Sort by date
        transactions.sort(key=lambda x: x['date'])

        return {
            'partner': partner,
            'statement_date': timezone.now(),
            'period': {'start': start_date, 'end': end_date},
            'opening_balance': partner.opening_balance if hasattr(partner, 'opening_balance') else Decimal('0'),
            'closing_balance': running_balance,
            'transactions': transactions
        }


# Fix: Import models for Q objects
