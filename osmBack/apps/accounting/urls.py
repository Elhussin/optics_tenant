from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.accounting.views import (
    ChartOfAccountsViewSet, GeneralJournalViewSet,
    FinancialPeriodViewSet, TaxViewSet, AccountingCategoryViewSet,
    trial_balance, income_statement, balance_sheet, account_ledger
)

router = DefaultRouter()
# New comprehensive accounting
router.register(r'chart-of-accounts', ChartOfAccountsViewSet,
                basename='chart-of-accounts')
router.register(r'journal-entries', GeneralJournalViewSet,
                basename='journal-entry')
router.register(r'financial-periods', FinancialPeriodViewSet,
                basename='financial-period')
router.register(r'taxes', TaxViewSet, basename='tax')
router.register(r'categories', AccountingCategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),

    # Financial Reports
    path('reports/trial-balance/', trial_balance, name='trial-balance'),
    path('reports/income-statement/', income_statement, name='income-statement'),
    path('reports/balance-sheet/', balance_sheet, name='balance-sheet'),
    path('reports/ledger/<int:account_id>/',
         account_ledger, name='account-ledger'),
]
