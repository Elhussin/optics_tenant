from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.accounting.views import (
    ChartOfAccountsViewSet, GeneralJournalViewSet,
    FinancialPeriodViewSet, TaxViewSet, AccountingCategoryViewSet,
    TrialBalanceView, IncomeStatementView, BalanceSheetView, AccountLedgerView
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
    path('reports/trial-balance/', TrialBalanceView.as_view(), name='trial-balance'),
    path('reports/income-statement/',
         IncomeStatementView.as_view(), name='income-statement'),
    path('reports/balance-sheet/', BalanceSheetView.as_view(), name='balance-sheet'),
    path('reports/ledger/<int:account_id>/',
         AccountLedgerView.as_view(), name='account-ledger'),
]
