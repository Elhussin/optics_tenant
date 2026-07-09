from decimal import Decimal
from django.utils import timezone
from apps.accounting.models.chart_of_accounts import ChartOfAccounts, JournalLine
from django.db import models
from django.db.models import Sum
from django.utils.translation import gettext_lazy as _

class AccountingService:
    """
    Service layer handling optimized financial report calculations.
    Consolidates data querying to prevent N+1 issues by grouping aggregations via SQL.
    """

    @staticmethod
    def get_balances_for_accounts(accounts, start_date=None, end_date=None):
        """
        Retrieves the net balance for a collection of accounts in a single optimized query.
        """
        lines = JournalLine.objects.filter(
            account__in=accounts,
            journal__is_posted=True
        )
        if start_date:
            lines = lines.filter(journal__entry_date__gte=start_date)
        if end_date:
            lines = lines.filter(journal__entry_date__lte=end_date)

        balances = lines.values('account_id').annotate(
            total_debit=Sum('debit'),
            total_credit=Sum('credit')
        )

        balances_dict = {
            b['account_id']: (b['total_debit'] or Decimal('0'), b['total_credit'] or Decimal('0'))
            for b in balances
        }

        result = {}
        for acc in accounts:
            debit, credit = balances_dict.get(acc.id, (Decimal('0'), Decimal('0')))
            if acc.normal_balance == 'debit':
                bal = debit - credit
            else:
                bal = credit - debit
            result[acc.id] = bal

        return result

    @classmethod
    def get_trial_balance(cls, as_of_date=None):
        """
        Calculates and compiles the Trial Balance Report.
        """
        if not as_of_date:
            as_of_date = timezone.now().date()

        accounts = ChartOfAccounts.objects.filter(
            is_active=True,
            is_header=False
        ).order_by('code')

        # Single optimized aggregation query
        balances = cls.get_balances_for_accounts(accounts, end_date=as_of_date)

        trial_balance_data = []
        total_debit = Decimal('0')
        total_credit = Decimal('0')

        for account in accounts:
            balance = balances.get(account.id, Decimal('0'))

            if balance != 0:
                if account.normal_balance == 'debit':
                    debit = balance if balance > 0 else Decimal('0')
                    credit = abs(balance) if balance < 0 else Decimal('0')
                else:
                    credit = balance if balance > 0 else Decimal('0')
                    debit = abs(balance) if balance < 0 else Decimal('0')

                trial_balance_data.append({
                    'account_code': account.code,
                    'account_name': account.name,
                    'account_type': account.get_account_type_display(),
                    'debit': debit,
                    'credit': credit,
                })

                total_debit += debit
                total_credit += credit

        return {
            'as_of_date': as_of_date,
            'accounts': trial_balance_data,
            'totals': {
                'debit': total_debit,
                'credit': total_credit,
                'is_balanced': total_debit == total_credit,
            }
        }

    @classmethod
    def get_income_statement(cls, start_date=None, end_date=None):
        """
        Calculates and compiles the Income Statement Report.
        """
        if not end_date:
            end_date = timezone.now().date()

        # Query all account types needed in a single query
        all_accounts = ChartOfAccounts.objects.filter(
            account_type__in=['revenue', 'cogs', 'expense'],
            is_active=True,
            is_header=False
        )

        balances = cls.get_balances_for_accounts(all_accounts, start_date=start_date, end_date=end_date)

        # Revenue
        total_revenue = Decimal('0')
        revenue_items = []
        for acc in all_accounts.filter(account_type='revenue'):
            bal = balances.get(acc.id, Decimal('0'))
            if bal != 0:
                revenue_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'amount': abs(bal)
                })
                total_revenue += abs(bal)

        # COGS
        total_cogs = Decimal('0')
        cogs_items = []
        for acc in all_accounts.filter(account_type='cogs'):
            bal = balances.get(acc.id, Decimal('0'))
            if bal != 0:
                cogs_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'amount': bal
                })
                total_cogs += bal

        gross_profit = total_revenue - total_cogs

        # Expenses
        total_expenses = Decimal('0')
        expense_items = []
        for acc in all_accounts.filter(account_type='expense'):
            bal = balances.get(acc.id, Decimal('0'))
            if bal != 0:
                expense_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'amount': bal
                })
                total_expenses += bal

        net_income = gross_profit - total_expenses

        return {
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
        }

    @classmethod
    def get_balance_sheet(cls, as_of_date=None):
        """
        Calculates and compiles the Balance Sheet Report in a single database lookup.
        """
        if not as_of_date:
            as_of_date = timezone.now().date()

        all_accounts = ChartOfAccounts.objects.filter(
            account_type__in=['asset', 'liability', 'equity', 'revenue', 'cogs', 'expense'],
            is_active=True,
            is_header=False
        )

        balances = cls.get_balances_for_accounts(all_accounts, end_date=as_of_date)

        # Assets
        total_assets = Decimal('0')
        asset_items = []
        for acc in all_accounts.filter(account_type='asset'):
            bal = balances.get(acc.id, Decimal('0'))
            if bal != 0:
                asset_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'balance': bal
                })
                total_assets += bal

        # Liabilities
        total_liabilities = Decimal('0')
        liability_items = []
        for acc in all_accounts.filter(account_type='liability'):
            bal = balances.get(acc.id, Decimal('0'))
            if bal != 0:
                liability_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'balance': bal
                })
                total_liabilities += bal

        # Equity (excluding net income first)
        total_equity = Decimal('0')
        equity_items = []
        for acc in all_accounts.filter(account_type='equity'):
            bal = balances.get(acc.id, Decimal('0'))
            if bal != 0:
                equity_items.append({
                    'code': acc.code,
                    'name': acc.name,
                    'balance': bal
                })
                total_equity += bal

        # Net Income Calculation from balances dict
        total_revenue = sum(balances.get(acc.id, Decimal('0')) for acc in all_accounts.filter(account_type='revenue'))
        total_cogs = sum(balances.get(acc.id, Decimal('0')) for acc in all_accounts.filter(account_type='cogs'))
        total_expenses = sum(balances.get(acc.id, Decimal('0')) for acc in all_accounts.filter(account_type='expense'))

        net_income = total_revenue - total_cogs - total_expenses

        if net_income != 0:
            equity_items.append({
                'code': 'NET_INCOME',
                'name': str(_('Net Income / (Loss)')),
                'balance': net_income
            })
            total_equity += net_income

        return {
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
        }
