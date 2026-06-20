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
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from rest_framework import serializers

from apps.accounting.models import (
    ChartOfAccounts, GeneralJournal, JournalLine
)
from apps.accounting.serializers import (
    ChartOfAccountsSerializer, ChartOfAccountsTreeSerializer,
    GeneralJournalSerializer, GeneralJournalCreateSerializer, GeneralJournalListSerializer,
    JournalLineSerializer
)
from apps.accounting.services import AutoJournalService
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

# Allowed Roles
ACCOUNTING_ROLES = ["FinanceOfficer", "BranchManager"]


class ChartOfAccountsViewSet(BaseViewSet):
    """
    ViewSet for Chart of Accounts
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

    @extend_schema(responses=ChartOfAccountsTreeSerializer(many=True))
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Display Chart of Accounts as a tree structure"""
        root_accounts = self.get_queryset().filter(
            parent__isnull=True,
            is_active=True
        )
        serializer = ChartOfAccountsTreeSerializer(root_accounts, many=True)
        return Response(serializer.data)

    @extend_schema(
        parameters=[OpenApiParameter(name='type', required=True, type=str)],
        responses=ChartOfAccountsSerializer(many=True)
    )
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Filter accounts by type"""
        account_type = request.query_params.get('type')
        if not account_type:
            return Response(
                {'detail': str(_('Account type is required'))},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate account type
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

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='SetupDefaultsResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=False, methods=['post'])
    def setup_defaults(self, request):
        """Setup default accounts"""
        AutoJournalService.setup_default_accounts()
        return Response({
            'status': 'success',
            'message': str(_('Default accounts have been set up successfully'))
        })

    @extend_schema(
        responses={
            200: inline_serializer(
                name='ChartOfAccountsChoices',
                fields={
                    'account_types': serializers.DictField(),
                    'account_subtypes': serializers.DictField(),
                }
            )
        }
    )
    @action(detail=False, methods=['get'])
    def choices(self, request):
        """Available choices"""
        return Response({
            'account_types': ChartOfAccounts.ACCOUNT_TYPES,
            'account_subtypes': ChartOfAccounts.ACCOUNT_SUBTYPES,
        })


class GeneralJournalViewSet(BaseViewSet):
    """
    ViewSet for General Journal Entries
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

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='PostEntryResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def post_entry(self, request, pk=None):
        """Post the journal entry"""
        journal = self.get_object()

        try:
            journal.post(request.user)
            return Response({
                'status': 'success',
                'message': str(_('Journal entry {entry_number} has been posted').format(entry_number=journal.entry_number))
            })
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='ReverseEntryResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                    'reversal_id': serializers.IntegerField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def reverse_entry(self, request, pk=None):
        """Reverse the journal entry"""
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
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(responses=GeneralJournalListSerializer(many=True))
    @action(detail=False, methods=['get'])
    def unposted(self, request):
        """Get unposted journals"""
        journals = self.get_queryset().filter(is_posted=False)
        serializer = GeneralJournalListSerializer(journals, many=True)
        return Response(serializer.data)

    @extend_schema(
        parameters=[
            OpenApiParameter(name='source_type', required=False, type=str),
            OpenApiParameter(name='source_id', required=False, type=int),
        ],
        responses=GeneralJournalListSerializer(many=True)
    )
    @action(detail=False, methods=['get'])
    def by_source(self, request):
        """Get journals by source"""
        source_type = request.query_params.get('source_type')
        source_id = request.query_params.get('source_id')

        if not source_type and not source_id:
            return Response(
                {'detail': str(
                    _('At least source_type or source_id is required'))},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate source type
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

    @extend_schema(
        responses={
            200: inline_serializer(
                name='GeneralJournalChoices',
                fields={
                    'entry_types': serializers.DictField(),
                    'source_types': serializers.DictField(),
                }
            )
        }
    )
    @action(detail=False, methods=['get'])
    def choices(self, request):
        """Available choices"""
        return Response({
            'entry_types': GeneralJournal.ENTRY_TYPES,
            'source_types': GeneralJournal.SOURCE_TYPES,
        })



# ═══════════════════════════════════════════════════════════════════════════════
# Financial Reports
# ═══════════════════════════════════════════════════════════════════════════════

class TrialBalanceView(APIView):
    """
    Get Trial Balance Report
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=ACCOUNTING_ROLES,
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='as_of_date',
                description='Report date',
                required=False,
                type=str  # Date string
            )
        ],
        responses={
            200: inline_serializer(
                name='TrialBalanceResponse',
                fields={
                    'as_of_date': serializers.DateField(),
                    'accounts': inline_serializer(
                        name='TrialBalanceAccount',
                        fields={
                            'account_code': serializers.CharField(),
                            'account_name': serializers.CharField(),
                            'account_type': serializers.CharField(),
                            'debit': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'credit': serializers.DecimalField(max_digits=20, decimal_places=2),
                        },
                        many=True
                    ),
                    'totals': inline_serializer(
                        name='TrialBalanceTotals',
                        fields={
                            'debit': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'credit': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'is_balanced': serializers.BooleanField(),
                        }
                    )
                }
            )
        }
    )
    def get(self, request):
        as_of_date = request.query_params.get(
            'as_of_date', timezone.now().date())

        accounts = ChartOfAccounts.objects.filter(
            is_active=True,
            is_header=False
        ).order_by('code')

        trial_balance_data = []
        total_debit = Decimal('0')
        total_credit = Decimal('0')

        for account in accounts:
            balance = account.get_balance_for_period(end_date=as_of_date)

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


class IncomeStatementView(APIView):
    """
    Get Income Statement Report
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=ACCOUNTING_ROLES
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='start_date', description='Start Date', required=False, type=str),
            OpenApiParameter(
                name='end_date', description='End Date', required=False, type=str),
        ],
        responses={
            200: inline_serializer(
                name='IncomeStatementResponse',
                fields={
                    'period': inline_serializer(
                        name='IncomeStatementPeriod',
                        fields={'start_date': serializers.DateField(
                            allow_null=True), 'end_date': serializers.DateField()}
                    ),
                    'revenue': inline_serializer(
                        name='IncomeStatementSection',
                        fields={
                            'total': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'items': inline_serializer(name='IncomeItem', fields={'code': serializers.CharField(), 'name': serializers.CharField(), 'amount': serializers.DecimalField(max_digits=20, decimal_places=2)}, many=True)
                        }
                    ),
                    'cogs': inline_serializer(
                        name='IncomeStatementSectionCOGS',
                        fields={
                            'total': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'items': inline_serializer(name='IncomeItemCOGS', fields={'code': serializers.CharField(), 'name': serializers.CharField(), 'amount': serializers.DecimalField(max_digits=20, decimal_places=2)}, many=True)
                        }
                    ),
                    'gross_profit': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'expenses': inline_serializer(
                        name='IncomeStatementSectionExpenses',
                        fields={
                            'total': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'items': inline_serializer(name='IncomeItemExpenses', fields={'code': serializers.CharField(), 'name': serializers.CharField(), 'amount': serializers.DecimalField(max_digits=20, decimal_places=2)}, many=True)
                        }
                    ),
                    'net_income': serializers.DecimalField(max_digits=20, decimal_places=2),
                }
            )
        }
    )
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date', timezone.now().date())

        # Revenue
        revenue_accounts = ChartOfAccounts.objects.filter(
            account_type='revenue',
            is_active=True,
            is_header=False
        )

        total_revenue = Decimal('0')
        revenue_items = []
        for acc in revenue_accounts:
            bal = acc.get_balance_for_period(start_date=start_date, end_date=end_date)
            if bal != 0:
                revenue_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'amount': abs(bal)
                })
                total_revenue += abs(bal)

        # COGS
        cogs_accounts = ChartOfAccounts.objects.filter(
            account_type='cogs',
            is_active=True,
            is_header=False
        )

        total_cogs = Decimal('0')
        cogs_items = []
        for acc in cogs_accounts:
            bal = acc.get_balance_for_period(start_date=start_date, end_date=end_date)
            if bal != 0:
                cogs_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'amount': bal
                })
                total_cogs += bal

        # Gross Profit
        gross_profit = total_revenue - total_cogs

        # Expenses
        expense_accounts = ChartOfAccounts.objects.filter(
            account_type='expense',
            is_active=True,
            is_header=False
        )

        total_expenses = Decimal('0')
        expense_items = []
        for acc in expense_accounts:
            bal = acc.get_balance_for_period(start_date=start_date, end_date=end_date)
            if bal != 0:
                expense_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'amount': bal
                })
                total_expenses += bal

        # Net Income
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


class BalanceSheetView(APIView):
    """
    Get Balance Sheet Report
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=ACCOUNTING_ROLES,
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='as_of_date', description='Report date', required=False, type=str),
        ],
        responses={
            200: inline_serializer(
                name='BalanceSheetResponse',
                fields={
                    'as_of_date': serializers.DateField(),
                    'assets': inline_serializer(
                        name='BalanceSheetSectionAssets',
                        fields={
                            'total': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'items': inline_serializer(name='BSItemAssets', fields={'code': serializers.CharField(), 'name': serializers.CharField(), 'balance': serializers.DecimalField(max_digits=20, decimal_places=2)}, many=True)
                        }
                    ),
                    'liabilities': inline_serializer(
                        name='BalanceSheetSectionLiabilities',
                        fields={
                            'total': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'items': inline_serializer(name='BSItemLiabilities', fields={'code': serializers.CharField(), 'name': serializers.CharField(), 'balance': serializers.DecimalField(max_digits=20, decimal_places=2)}, many=True)
                        }
                    ),
                    'equity': inline_serializer(
                        name='BalanceSheetSectionEquity',
                        fields={
                            'total': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'items': inline_serializer(name='BSItemEquity', fields={'code': serializers.CharField(), 'name': serializers.CharField(), 'balance': serializers.DecimalField(max_digits=20, decimal_places=2)}, many=True)
                        }
                    ),
                    'total_liabilities_and_equity': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'is_balanced': serializers.BooleanField(),
                }
            )
        }
    )
    def get(self, request):
        as_of_date = request.query_params.get(
            'as_of_date', timezone.now().date())

        # Assets
        asset_accounts = ChartOfAccounts.objects.filter(
            account_type='asset',
            is_active=True,
            is_header=False
        )

        total_assets = Decimal('0')
        asset_items = []
        for acc in asset_accounts:
            bal = acc.get_balance_for_period(end_date=as_of_date)
            if bal != 0:
                asset_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'balance': bal
                })
                total_assets += bal

        # Liabilities
        liability_accounts = ChartOfAccounts.objects.filter(
            account_type='liability',
            is_active=True,
            is_header=False
        )

        total_liabilities = Decimal('0')
        liability_items = []
        for acc in liability_accounts:
            bal = acc.get_balance_for_period(end_date=as_of_date)
            if bal != 0:
                liability_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'balance': bal
                })
                total_liabilities += bal

        # Equity
        equity_accounts = ChartOfAccounts.objects.filter(
            account_type='equity',
            is_active=True,
            is_header=False
        )

        total_equity = Decimal('0')
        equity_items = []
        for acc in equity_accounts:
            bal = acc.get_balance_for_period(end_date=as_of_date)
            if bal != 0:
                equity_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'balance': bal
                })
                total_equity += bal

        # Calculate Net Income to add to Equity (Retained Earnings)
        revenue_accounts = ChartOfAccounts.objects.filter(account_type='revenue', is_active=True, is_header=False)
        cogs_accounts = ChartOfAccounts.objects.filter(account_type='cogs', is_active=True, is_header=False)
        expense_accounts = ChartOfAccounts.objects.filter(account_type='expense', is_active=True, is_header=False)

        total_revenue = sum(acc.get_balance_for_period(end_date=as_of_date) for acc in revenue_accounts)
        total_cogs = sum(acc.get_balance_for_period(end_date=as_of_date) for acc in cogs_accounts)
        total_expenses = sum(acc.get_balance_for_period(end_date=as_of_date) for acc in expense_accounts)

        net_income = total_revenue - total_cogs - total_expenses
        
        if net_income != 0:
            equity_items.append({
                'code': 'NET_INCOME',
                'name': str(_('Net Income / (Loss)')),
                'balance': net_income
            })
            total_equity += net_income

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


class AccountLedgerView(APIView):
    """
    Get Ledger for a specific account
    """
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=ACCOUNTING_ROLES,
        )
    ]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='start_date', description='Start Date', required=False, type=str),
            OpenApiParameter(
                name='end_date', description='End Date', required=False, type=str),
        ],
        responses={
            200: inline_serializer(
                name='AccountLedgerResponse',
                fields={
                    'account': inline_serializer(name='LedgerAccountInfo', fields={'code': serializers.CharField(), 'name': serializers.CharField()}),
                    'opening_balance': serializers.DecimalField(max_digits=20, decimal_places=2),
                    'entries': inline_serializer(
                        name='LedgerEntry',
                        fields={
                            'date': serializers.DateField(),
                            'entry_number': serializers.CharField(),
                            'description': serializers.CharField(),
                            'debit': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'credit': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'balance': serializers.DecimalField(max_digits=20, decimal_places=2),
                        },
                        many=True
                    ),
                    'closing_balance': serializers.DecimalField(max_digits=20, decimal_places=2),
                }
            )
        }
    )
    def get(self, request, account_id):
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
