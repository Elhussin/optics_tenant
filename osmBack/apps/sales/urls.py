# urls.py - routing OrderViewSet

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.sales.views import (
    OrderViewSet, InvoiceViewSet, PaymentViewSet, InstallmentViewSet,
    order_choices, invoice_choices,
    create_return, create_damage_record,
    # Wholesale
    get_wholesale_pricing, validate_wholesale_order, create_wholesale_order,
    customer_statement, wholesale_customers, wholesale_dashboard,
    update_customer_credit,
)
from apps.sales.views_reports import (
    sales_summary, sales_by_date, inventory_summary,
    stock_movements_report, top_products, branch_comparison,
    financial_dashboard, receivables_aging, pending_orders
)

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'installments', InstallmentViewSet, basename='installment')

urlpatterns = [
    path('', include(router.urls)),
    path('orders/choices/', order_choices, name='order-choices'),
    path('invoices/choices/', invoice_choices, name='invoice-choices'),

    # Returns (المرتجعات)
    path('orders/<int:order_id>/return/', create_return, name='create-return'),
    path('inventory/damage/', create_damage_record, name='create-damage'),

    # ═══════════════════════════════════════════════════════════════════════
    # Wholesale (البيع بالجملة)
    # ═══════════════════════════════════════════════════════════════════════
    path('wholesale/pricing/', get_wholesale_pricing, name='wholesale-pricing'),
    path('wholesale/validate/', validate_wholesale_order,
         name='wholesale-validate'),
    path('wholesale/create-order/', create_wholesale_order,
         name='wholesale-create-order'),
    path('wholesale/customers/', wholesale_customers, name='wholesale-customers'),
    path('wholesale/dashboard/', wholesale_dashboard, name='wholesale-dashboard'),
    path('wholesale/customer/<int:customer_id>/statement/',
         customer_statement, name='customer-statement'),
    path('wholesale/customer/<int:customer_id>/credit/',
         update_customer_credit, name='update-customer-credit'),

    # Reports - Sales
    path('reports/sales-summary/', sales_summary, name='sales-summary'),
    path('reports/sales-by-date/', sales_by_date, name='sales-by-date'),
    path('reports/top-products/', top_products, name='top-products'),
    path('reports/branch-comparison/',
         branch_comparison, name='branch-comparison'),

    # Reports - Inventory
    path('reports/inventory-summary/',
         inventory_summary, name='inventory-summary'),
    path('reports/stock-movements/', stock_movements_report,
         name='stock-movements-report'),

    # Reports - Financial (NEW)
    path('reports/financial-dashboard/',
         financial_dashboard, name='financial-dashboard'),
    path('reports/receivables-aging/',
         receivables_aging, name='receivables-aging'),
    path('reports/pending-orders/', pending_orders, name='pending-orders'),
]
