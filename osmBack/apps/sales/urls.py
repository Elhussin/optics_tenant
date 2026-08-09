# urls.py - routing OrderViewSet

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.sales.views import (
    OrderViewSet, InvoiceViewSet, PaymentViewSet, InstallmentViewSet,
    PaymentMethodViewSet, InvoiceTypeViewSet,
    OrderChoicesView, InvoiceChoicesView,
    CreateReturnView, CreateDamageRecordView,
    # Wholesale
    GetWholesalePricingView, ValidateWholesaleOrderView, CreateWholesaleOrderView,
    CustomerStatementView, WholesaleCustomersView, WholesaleDashboardView,
    UpdateCustomerCreditView,
)
from apps.sales.views import (
    SalesSummaryView, SalesByDateView, InventorySummaryView,
    StockMovementsReportView, TopProductsView, BranchComparisonView,
    FinancialDashboardView, ReceivablesAgingView, PendingOrdersView,
    AsyncFinancialDashboardView
)

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'installments', InstallmentViewSet, basename='installment')
router.register(r'payment-methods', PaymentMethodViewSet,
                basename='payment-method')
router.register(r'invoice-types', InvoiceTypeViewSet, basename='invoice-types')

urlpatterns = [
    path('', include(router.urls)),
    path('orders/choices/', OrderChoicesView.as_view(), name='order-choices'),
    path('invoices/choices/', InvoiceChoicesView.as_view(), name='invoice-choices'),

    # Returns
    path('orders/<int:order_id>/return/',
         CreateReturnView.as_view(), name='create-return'),
    path('inventory/damage/', CreateDamageRecordView.as_view(), name='create-damage'),

    # ═══════════════════════════════════════════════════════════════════════
    # Wholesale
    # ═══════════════════════════════════════════════════════════════════════
    path('wholesale/pricing/', GetWholesalePricingView.as_view(),
         name='wholesale-pricing'),
    path('wholesale/validate/', ValidateWholesaleOrderView.as_view(),
         name='wholesale-validate'),
    path('wholesale/create-order/', CreateWholesaleOrderView.as_view(),
         name='wholesale-create-order'),
    path('wholesale/customers/', WholesaleCustomersView.as_view(),
         name='wholesale-customers'),
    path('wholesale/dashboard/', WholesaleDashboardView.as_view(),
         name='wholesale-dashboard'),
    path('wholesale/customer/<int:customer_id>/statement/',
         CustomerStatementView.as_view(), name='customer-statement'),
    path('wholesale/customer/<int:customer_id>/credit/',
         UpdateCustomerCreditView.as_view(), name='update-customer-credit'),

    # Reports - Sales
    path('reports/sales-summary/', SalesSummaryView.as_view(), name='sales-summary'),
    path('reports/sales-by-date/', SalesByDateView.as_view(), name='sales-by-date'),
    path('reports/top-products/', TopProductsView.as_view(), name='top-products'),
    path('reports/branch-comparison/',
         BranchComparisonView.as_view(), name='branch-comparison'),

    # Reports - Inventory
    path('reports/inventory-summary/',
         InventorySummaryView.as_view(), name='inventory-summary'),
    path('reports/stock-movements/', StockMovementsReportView.as_view(),
         name='stock-movements-report'),

    # Reports - Financial (NEW)
    path('reports/financial-dashboard/',
         FinancialDashboardView.as_view(), name='financial-dashboard'),
    path('reports/async-financial-dashboard/',
         AsyncFinancialDashboardView.as_view(), name='async-financial-dashboard'),
    path('reports/receivables-aging/',
         ReceivablesAgingView.as_view(), name='receivables-aging'),
    path('reports/pending-orders/',
         PendingOrdersView.as_view(), name='pending-orders'),
]
