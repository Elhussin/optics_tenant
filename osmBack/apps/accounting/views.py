from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
from apps.accounting.models import (FinancialPeriod,
                                    Account, Transaction, JournalEntry,
                                    Tax, AccountingCategory, RecurringTransaction)

from apps.accounting.serializers import (FinancialPeriodSerializer,
                                         AccountSerializer, TransactionSerializer, JournalEntrySerializer,
                                         TaxSerializer, AccountingCategorySerializer, RecurringTransactionSerializer)
from core.views import BaseViewSet

# accounting/views.py


class AccountingBaseViewSet(BaseViewSet):
    """
    Base ViewSet for Accounting app.
    Enforces authentication and role-based access.
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=["accountant"],  # Accountant role
            super_roles=["admin", "owner"]  # Admins/Owners always have access
        )
    ]

    def get_queryset(self):
        # Assumes multitenancy handles DB isolation OR we filter by user
        # Since Account has 'user', we can filter.
        # For other models, we filter by relation to user-owned models (like Account).
        return self.queryset


class FinancialPeriodViewSet(AccountingBaseViewSet):
    queryset = FinancialPeriod.objects.all()
    serializer_class = FinancialPeriodSerializer


class AccountViewSet(AccountingBaseViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def perform_create(self, serializer):
        # We save the creator, but filtering is tenant-wide
        serializer.save(user=self.request.user)


class TransactionViewSet(AccountingBaseViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer


class JournalEntryViewSet(AccountingBaseViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer


class TaxViewSet(AccountingBaseViewSet):
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer


class AccountingCategoryViewSet(AccountingBaseViewSet):
    queryset = AccountingCategory.objects.all()
    serializer_class = AccountingCategorySerializer


class RecurringTransactionViewSet(AccountingBaseViewSet):
    queryset = RecurringTransaction.objects.all()
    serializer_class = RecurringTransactionSerializer
