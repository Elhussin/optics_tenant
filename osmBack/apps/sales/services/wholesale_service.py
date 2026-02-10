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
    def get_order_pricing(cls, customer, order_items, branch=None):
        """
        Get pricing for customer orders

        Args:
            customer: Customer
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
                variant, customer, quantity, branch
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

        # Apply additional customer level discount
        customer_discount = Decimal('0')
        if customer.default_discount_percentage > 0:
            customer_discount = subtotal * \
                (customer.default_discount_percentage / Decimal('100'))

        return {
            'items': priced_items,
            'subtotal': subtotal,
            'line_discounts': total_discount,
            'customer_discount': customer_discount,
            'total_discount': total_discount + customer_discount,
            'final_total': subtotal - customer_discount,
        }

    @classmethod
    def get_variant_price(cls, variant, customer=None, quantity=1, branch=None):
        """
        Get appropriate price for a variant using unified PriceCalculator
        """
        from apps.products.services.pricing_service import PriceCalculator

        # Determine Partner from customer link if not explicitly passed
        partner = None
        if customer:
            partner_link = customer.get_active_partner_link()
            if partner_link:
                partner = partner_link.partner

        context = {
            'customer': customer,
            'quantity': quantity,
            'branch': branch,
            'partner': partner,
            # 'policy': None  # Wholesale service typically doesn't know policy yet, unless passed
        }

        result = PriceCalculator.calculate_price(variant, context)

        return {
            'price': result['price'],
            'discount_type': result['source_type'],
            'source': result['source_name'],
        }

    @classmethod
    def validate_wholesale_order(cls, customer, order_items, use_credit=False):
        """
        Validate wholesale order

        Returns:
            tuple: (is_valid, errors)
        """
        errors = []

        # Check minimum order amount
        if customer.minimum_order_amount > 0:
            pricing = cls.get_order_pricing(customer, order_items)
            if pricing['final_total'] < customer.minimum_order_amount:
                errors.append(
                    _("Minimum order amount is {0} SAR, current amount: {1} SAR").format(
                        customer.minimum_order_amount, pricing['final_total']
                    )
                )

        # Check credit if payment is deferred
        if use_credit:
            pricing = cls.get_order_pricing(customer, order_items)
            is_available, message = customer.check_credit_available(
                pricing['final_total'])
            if not is_available:
                errors.append(message)

        # Check contract validity
        if customer.contract_end_date:
            today = timezone.now().date()
            if customer.contract_end_date < today:
                errors.append(_("Contract with this customer has expired"))

        return len(errors) == 0, errors

    @classmethod
    @transaction.atomic
    def create_wholesale_order(cls, customer, items, branch, user, payment_method='credit', notes=''):
        """
        Create wholesale order
        """
        from apps.sales.models import Order, OrderItem

        # Validate order
        use_credit = payment_method == 'credit'
        is_valid, errors = cls.validate_wholesale_order(
            customer, items, use_credit)

        if not is_valid:
            raise ValueError('\n'.join(errors))

        # Get pricing
        pricing = cls.get_order_pricing(customer, items, branch)

        # Create order
        order = Order.objects.create(
            branch=branch,
            customer=customer,
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

        # Update customer balance if credit
        if payment_method == 'credit':
            customer.update_balance(pricing['final_total'], is_payment=False)

        logger.info(
            f"Wholesale order {order.order_number} created for customer {customer}")
        return order

    @classmethod
    def get_customer_statement(cls, customer, start_date=None, end_date=None):
        """
        Customer Statement
        """
        from apps.sales.models import Order, Invoice, Payment

        filters = {'customer': customer}
        if start_date:
            filters['created_at__date__gte'] = start_date
        if end_date:
            filters['created_at__date__lte'] = end_date

        # Invoices
        invoices = Invoice.objects.filter(**filters).values(
            'invoice_number', 'created_at', 'total_amount', 'status'
        )

        # Payments
        payment_filters = filters.copy()
        payment_filters.pop('customer', None)
        payment_filters['invoice__customer'] = customer

        payments = Payment.objects.filter(**payment_filters).values(
            'id', 'created_at', 'amount', 'payment_method', 'status'
        )

        # Merge and sort
        transactions = []
        running_balance = customer.opening_balance if hasattr(
            customer, 'opening_balance') else Decimal('0')

        for inv in invoices:
            running_balance += inv['total_amount']
            transactions.append({
                'date': inv['created_at'],
                'type': 'invoice',
                'reference': inv['invoice_number'],
                'debit': inv['total_amount'],
                'credit': Decimal('0'),
                'balance': running_balance,
            })

        for pay in payments:
            if pay['status'] == 'completed':
                running_balance -= pay['amount']
                transactions.append({
                    'date': pay['created_at'],
                    'type': 'payment',
                    'reference': f"PAY-{pay['id']}",
                    'debit': Decimal('0'),
                    'credit': pay['amount'],
                    'balance': running_balance,
                })

        # Sort by date
        transactions.sort(key=lambda x: x['date'])

        return {
            'customer': customer,
            'opening_balance': Decimal('0'),
            'transactions': transactions,
            'closing_balance': running_balance,
            'total_invoices': sum(t['debit'] for t in transactions),
            'total_payments': sum(t['credit'] for t in transactions),
        }


# Fix: Import models for Q objects
