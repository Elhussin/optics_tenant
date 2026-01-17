# apps/sales/views/__init__.py
"""
Sales Views Package
"""

from apps.sales.views.sales import (
    BaseSalesViewSet,
    OrderViewSet,
    InvoiceViewSet,
    order_choices,
    invoice_choices,
    create_return,
    create_damage_record,
)

from apps.sales.views.payment import (
    PaymentViewSet,
    InstallmentViewSet,
)

from apps.sales.views.wholesale import (
    get_wholesale_pricing,
    validate_wholesale_order,
    create_wholesale_order,
    customer_statement,
    wholesale_customers,
    wholesale_dashboard,
    update_customer_credit,
)

__all__ = [
    # Sales
    'BaseSalesViewSet',
    'OrderViewSet',
    'InvoiceViewSet',
    'order_choices',
    'invoice_choices',
    'create_return',
    'create_damage_record',

    # Payment
    'PaymentViewSet',
    'InstallmentViewSet',

    # Wholesale
    'get_wholesale_pricing',
    'validate_wholesale_order',
    'create_wholesale_order',
    'customer_statement',
    'wholesale_customers',
    'wholesale_dashboard',
    'update_customer_credit',
]
