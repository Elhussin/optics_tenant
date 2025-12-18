from rest_framework import viewsets, permissions
from apps.accounting.models import  (FinancialPeriod,
 Account,Transaction,JournalEntry,
Tax,AccountingCategory,RecurringTransaction)

from apps.accounting.serializers import (FinancialPeriodSerializer,
 AccountSerializer,TransactionSerializer,JournalEntrySerializer,
TaxSerializer,AccountingCategorySerializer,RecurringTransactionSerializer)
from core.views import BaseViewSet

# Helper for standard user filtering
class AccountingBaseViewSet(BaseViewSet):
    def get_queryset(self):
        # Assumes multitenancy handles DB isolation OR we filter by user
        # Since Account has 'user', we can filter. 
        # For other models, we filter by relation to user-owned models (like Account).
        return self.queryset

class FinancialPeriodViewSet(AccountingBaseViewSet):
    queryset = FinancialPeriod.objects.all()
    serializer_class = FinancialPeriodSerializer
    # Periods might be global or tenant specific. Keeping global for now unless tenant model exists.

class AccountViewSet(AccountingBaseViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def get_queryset(self):
        return Account.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionViewSet(AccountingBaseViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(account__user=self.request.user)

class JournalEntryViewSet(AccountingBaseViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer

    def get_queryset(self):
        return JournalEntry.objects.filter(account__user=self.request.user)

class TaxViewSet(viewsets.ModelViewSet):
    # Taxes might be system wide or per tenant
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer

class AccountingCategoryViewSet(viewsets.ModelViewSet):
    # Categories might be system wide
    queryset = AccountingCategory.objects.all()
    serializer_class = AccountingCategorySerializer

class RecurringTransactionViewSet(AccountingBaseViewSet):
    queryset = RecurringTransaction.objects.all()
    serializer_class = RecurringTransactionSerializer

    def get_queryset(self):
        return RecurringTransaction.objects.filter(account__user=self.request.user)
