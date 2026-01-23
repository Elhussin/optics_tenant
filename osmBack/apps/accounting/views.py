# apps/accounting/views.py
"""
Accounting Views
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Q
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from decimal import Decimal

from apps.accounting.models import (
    ChartOfAccounts, GeneralJournal, JournalLine,
    FinancialPeriod, Tax, AccountingCategory
)
from apps.accounting.serializers import (
    ChartOfAccountsSerializer, ChartOfAccountsTreeSerializer,
    GeneralJournalSerializer, GeneralJournalCreateSerializer, GeneralJournalListSerializer,
    JournalLineSerializer, FinancialPeriodSerializer, TaxSerializer, AccountingCategorySerializer
)
from apps.accounting.services import AutoJournalService
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

# الأدوار المسموحة
ACCOUNTING_ROLES = ["FinanceOfficer", "BranchManager"]


class ChartOfAccountsViewSet(BaseViewSet):
    """
    ViewSet لدليل الحسابات
    """
    queryset = ChartOfAccounts.objects.select_related('parent').all()
    serializer_class = ChartOfAccountsSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=ACCOUNTING_ROLES,
            required_permissions=["view_accounting"]
        )
    ]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['account_type',
                        'account_subtype', 'is_header', 'is_active']
    search_fields = ['code', 'name', 'name_en']
    ordering_fields = ['code', 'name', 'current_balance']
    ordering = ['code']

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """عرض دليل الحسابات كشجرة هرمية"""
        root_accounts = self.get_queryset().filter(
            parent__isnull=True,
            is_active=True
        )
        serializer = ChartOfAccountsTreeSerializer(root_accounts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """الحسابات حسب النوع"""
        account_type = request.query_params.get('type')
        if not account_type:
            return Response(
                {'detail': str(_('Account type is required'))},
                status=status.HTTP_400_BAD_REQUEST
            )

        # التحقق من صحة نوع الحساب
        valid_types = [t[0] for t in ChartOfAccounts.ACCOUNT_TYPES]
        if account_type not in valid_types:
            return Response(
                {'detail': str(_('Invalid account type: {type}').format(
                    type=account_type))},
                status=status.HTTP_400_BAD_REQUEST
            )

        accounts = self.get_queryset().filter(
            account_type=account_type,
            is_active=True,
            is_header=False
        )
        serializer = self.get_serializer(accounts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def setup_defaults(self, request):
        """إعداد الحسابات الافتراضية"""
        AutoJournalService.setup_default_accounts()
        return Response({
            'status': 'success',
            'message': str(_('Default accounts have been set up successfully'))
        })

    @action(detail=False, methods=['get'])
    def choices(self, request):
        """الخيارات المتاحة"""
        return Response({
            'account_types': ChartOfAccounts.ACCOUNT_TYPES,
            'account_subtypes': ChartOfAccounts.ACCOUNT_SUBTYPES,
        })


class GeneralJournalViewSet(BaseViewSet):
    """
    ViewSet لقيود اليومية
    """
    queryset = GeneralJournal.objects.prefetch_related('lines__account').all()
    serializer_class = GeneralJournalSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=ACCOUNTING_ROLES,
            required_permissions=["view_accounting"]
        )
    ]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['entry_type', 'source_type', 'is_posted', 'entry_date']
    search_fields = ['entry_number', 'description', 'source_document']
    ordering_fields = ['entry_date', 'entry_number', 'total_debit']
    ordering = ['-entry_date', '-entry_number']

    def get_serializer_class(self):
        if self.action == 'create':
            return GeneralJournalCreateSerializer
        if self.action == 'list':
            return GeneralJournalListSerializer
        return GeneralJournalSerializer

    @action(detail=True, methods=['post'])
    def post_entry(self, request, pk=None):
        """ترحيل القيد"""
        journal = self.get_object()

        try:
            journal.post(request.user)
            return Response({
                'status': 'success',
                'message': str(_('Journal entry {entry_number} has been posted').format(entry_number=journal.entry_number))
            })
        except Exception as e:
            return Response(
                {'status': 'error', 'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def reverse_entry(self, request, pk=None):
        """عكس القيد"""
        journal = self.get_object()

        try:
            reversal = journal.reverse(request.user)
            return Response({
                'status': 'success',
                'message': str(_('Reversal entry {entry_number} has been created').format(entry_number=reversal.entry_number)),
                'reversal_id': reversal.id,
            })
        except Exception as e:
            return Response(
                {'status': 'error', 'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def unposted(self, request):
        """القيود غير المرحّلة"""
        journals = self.get_queryset().filter(is_posted=False)
        serializer = GeneralJournalListSerializer(journals, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_source(self, request):
        """القيود حسب المصدر"""
        source_type = request.query_params.get('source_type')
        source_id = request.query_params.get('source_id')

        if not source_type and not source_id:
            return Response(
                {'detail': str(
                    _('At least source_type or source_id is required'))},
                status=status.HTTP_400_BAD_REQUEST
            )

        # التحقق من صحة نوع المصدر
        if source_type:
            valid_types = [t[0] for t in GeneralJournal.SOURCE_TYPES]
            if source_type not in valid_types:
                return Response(
                    {'detail': str(
                        _('Invalid source type: {type}').format(type=source_type))},
                    status=status.HTTP_400_BAD_REQUEST
                )

        journals = self.get_queryset()
        if source_type:
            journals = journals.filter(source_type=source_type)
        if source_id:
            journals = journals.filter(source_id=source_id)

        serializer = GeneralJournalListSerializer(journals, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def choices(self, request):
        """الخيارات المتاحة"""
        return Response({
            'entry_types': GeneralJournal.ENTRY_TYPES,
            'source_types': GeneralJournal.SOURCE_TYPES,
        })


class FinancialPeriodViewSet(BaseViewSet):
    """ViewSet للفترات المالية"""
    queryset = FinancialPeriod.objects.all()
    serializer_class = FinancialPeriodSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=ACCOUNTING_ROLES,
            required_permissions=["view_accounting"]
        )
    ]

    @action(detail=False, methods=['get'])
    def current(self, request):
        """الفترة المالية الحالية"""
        today = timezone.now().date()
        period = FinancialPeriod.objects.filter(
            start_date__lte=today,
            end_date__gte=today,
            is_closed=False
        ).first()

        if period:
            serializer = self.get_serializer(period)
            return Response(serializer.data)
        return Response({'detail': str(_('No active financial period found'))}, status=404)


class TaxViewSet(BaseViewSet):
    """ViewSet للضرائب"""
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=ACCOUNTING_ROLES + ['SalesClerk']
        )
    ]
    filterset_fields = ['is_active']


class AccountingCategoryViewSet(BaseViewSet):
    """ViewSet للفئات المحاسبية"""
    queryset = AccountingCategory.objects.all()
    serializer_class = AccountingCategorySerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=ACCOUNTING_ROLES,
            required_permissions=["view_accounting"]
        )
    ]
    filterset_fields = ['category_type']


# ═══════════════════════════════════════════════════════════════════════════════
# Financial Reports
# ═══════════════════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=ACCOUNTING_ROLES,
    )
])
def trial_balance(request):
    """
    ميزان المراجعة
    """
    as_of_date = request.query_params.get('as_of_date', timezone.now().date())

    accounts = ChartOfAccounts.objects.filter(
        is_active=True,
        is_header=False
    ).order_by('code')

    trial_balance_data = []
    total_debit = Decimal('0')
    total_credit = Decimal('0')

    for account in accounts:
        balance = account.current_balance

        if balance != 0:
            if account.normal_balance == 'debit':
                debit = balance if balance > 0 else 0
                credit = abs(balance) if balance < 0 else 0
            else:
                credit = balance if balance > 0 else 0
                debit = abs(balance) if balance < 0 else 0

            trial_balance_data.append({
                'account_code': account.code,
                'account_name': account.name,
                'account_type': account.get_account_type_display(),
                'debit': debit,
                'credit': credit,
            })

            total_debit += debit
            total_credit += credit

    return Response({
        'as_of_date': as_of_date,
        'accounts': trial_balance_data,
        'totals': {
            'debit': total_debit,
            'credit': total_credit,
            'is_balanced': total_debit == total_credit,
        }
    })


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=ACCOUNTING_ROLES
    )
])
def income_statement(request):
    """
    قائمة الدخل
    """
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date', timezone.now().date())

    # الإيرادات
    revenue_accounts = ChartOfAccounts.objects.filter(
        account_type='revenue',
        is_active=True,
        is_header=False
    )

    total_revenue = sum(
        abs(acc.current_balance) for acc in revenue_accounts
    )

    revenue_items = [
        {
            'code': acc.code,
            'name': acc.name,
            'amount': abs(acc.current_balance)
        }
        for acc in revenue_accounts if acc.current_balance != 0
    ]

    # تكلفة البضاعة المباعة
    cogs_accounts = ChartOfAccounts.objects.filter(
        account_type='cogs',
        is_active=True,
        is_header=False
    )

    total_cogs = sum(
        acc.current_balance for acc in cogs_accounts
    )

    cogs_items = [
        {
            'code': acc.code,
            'name': acc.name,
            'amount': acc.current_balance
        }
        for acc in cogs_accounts if acc.current_balance != 0
    ]

    # إجمالي الربح
    gross_profit = total_revenue - total_cogs

    # المصروفات
    expense_accounts = ChartOfAccounts.objects.filter(
        account_type='expense',
        is_active=True,
        is_header=False
    )

    total_expenses = sum(
        acc.current_balance for acc in expense_accounts
    )

    expense_items = [
        {
            'code': acc.code,
            'name': acc.name,
            'amount': acc.current_balance
        }
        for acc in expense_accounts if acc.current_balance != 0
    ]

    # صافي الربح
    net_income = gross_profit - total_expenses

    return Response({
        'period': {
            'start_date': start_date,
            'end_date': end_date,
        },
        'revenue': {
            'total': total_revenue,
            'items': revenue_items,
        },
        'cogs': {
            'total': total_cogs,
            'items': cogs_items,
        },
        'gross_profit': gross_profit,
        'expenses': {
            'total': total_expenses,
            'items': expense_items,
        },
        'net_income': net_income,
    })


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=ACCOUNTING_ROLES,
    )
])
def balance_sheet(request):
    """
    الميزانية العمومية
    """
    as_of_date = request.query_params.get('as_of_date', timezone.now().date())

    # الأصول
    asset_accounts = ChartOfAccounts.objects.filter(
        account_type='asset',
        is_active=True,
        is_header=False
    )

    total_assets = sum(acc.current_balance for acc in asset_accounts)

    asset_items = [
        {
            'code': acc.code,
            'name': acc.name,
            'balance': acc.current_balance
        }
        for acc in asset_accounts if acc.current_balance != 0
    ]

    # الالتزامات
    liability_accounts = ChartOfAccounts.objects.filter(
        account_type='liability',
        is_active=True,
        is_header=False
    )

    total_liabilities = sum(abs(acc.current_balance)
                            for acc in liability_accounts)

    liability_items = [
        {
            'code': acc.code,
            'name': acc.name,
            'balance': abs(acc.current_balance)
        }
        for acc in liability_accounts if acc.current_balance != 0
    ]

    # حقوق الملكية
    equity_accounts = ChartOfAccounts.objects.filter(
        account_type='equity',
        is_active=True,
        is_header=False
    )

    total_equity = sum(abs(acc.current_balance) for acc in equity_accounts)

    equity_items = [
        {
            'code': acc.code,
            'name': acc.name,
            'balance': abs(acc.current_balance)
        }
        for acc in equity_accounts if acc.current_balance != 0
    ]

    return Response({
        'as_of_date': as_of_date,
        'assets': {
            'total': total_assets,
            'items': asset_items,
        },
        'liabilities': {
            'total': total_liabilities,
            'items': liability_items,
        },
        'equity': {
            'total': total_equity,
            'items': equity_items,
        },
        'total_liabilities_and_equity': total_liabilities + total_equity,
        'is_balanced': total_assets == (total_liabilities + total_equity),
    })


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    RoleOrPermissionRequired.with_requirements(
        allowed_roles=ACCOUNTING_ROLES,
    )
])
def account_ledger(request, account_id):
    """
    دفتر الأستاذ لحساب معين
    """
    try:
        account = ChartOfAccounts.objects.get(id=account_id)
    except ChartOfAccounts.DoesNotExist:
        return Response({'detail': str(_('Account not found'))}, status=404)

    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    lines = JournalLine.objects.filter(
        account=account,
        journal__is_posted=True
    ).select_related('journal').order_by('journal__entry_date')

    if start_date:
        lines = lines.filter(journal__entry_date__gte=start_date)
    if end_date:
        lines = lines.filter(journal__entry_date__lte=end_date)

    ledger_entries = []
    running_balance = account.opening_balance

    for line in lines:
        if line.debit > 0:
            if account.normal_balance == 'debit':
                running_balance += line.debit
            else:
                running_balance -= line.debit

        if line.credit > 0:
            if account.normal_balance == 'credit':
                running_balance += line.credit
            else:
                running_balance -= line.credit

        ledger_entries.append({
            'date': line.journal.entry_date,
            'entry_number': line.journal.entry_number,
            'description': line.description or line.journal.description,
            'debit': line.debit,
            'credit': line.credit,
            'balance': running_balance,
        })

    return Response({
        'account': {
            'code': account.code,
            'name': account.name,
        },
        'opening_balance': account.opening_balance,
        'entries': ledger_entries,
        'closing_balance': running_balance,
    })
