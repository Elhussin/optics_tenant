# apps/sales/views/__init__.py
"""
Sales Views Package
"""

from apps.sales.views.sales import (
    BaseSalesViewSet,
    OrderViewSet,
    InvoiceViewSet,
    OrderChoicesView,
    InvoiceChoicesView,
    CreateReturnView,
    CreateDamageRecordView,
)

from apps.sales.views.invoice_type import InvoiceTypeViewSet

from apps.sales.views.payment import (
    PaymentViewSet,
    InstallmentViewSet,
)

from apps.sales.views.payment_method import PaymentMethodViewSet

from apps.sales.views.wholesale import (
    GetWholesalePricingView,
    ValidateWholesaleOrderView,
    CreateWholesaleOrderView,
    CustomerStatementView,
    WholesaleCustomersView,
    WholesaleDashboardView,
    UpdateCustomerCreditView,
)

from apps.sales.views.reports import (
    SalesSummaryView,
    SalesByDateView,
    InventorySummaryView,
    StockMovementsReportView,
    TopProductsView,
    BranchComparisonView,
    FinancialDashboardView,
    ReceivablesAgingView,
    PendingOrdersView,
)

__all__ = [
    # Sales
    'BaseSalesViewSet',
    'OrderViewSet',
    'InvoiceViewSet',
    'OrderChoicesView',
    'InvoiceChoicesView',
    'CreateReturnView',
    'CreateDamageRecordView',

    # Payment
    'PaymentViewSet',
    'InstallmentViewSet',
    'PaymentMethodViewSet',

    # Wholesale
    'GetWholesalePricingView',
    'ValidateWholesaleOrderView',
    'CreateWholesaleOrderView',
    'CustomerStatementView',
    'WholesaleCustomersView',
    'WholesaleDashboardView',
    'CreateWholesaleOrderView',
    'CustomerStatementView',
    'WholesaleCustomersView',
    'WholesaleDashboardView',
    'UpdateCustomerCreditView',
    'InvoiceTypeViewSet',
]
