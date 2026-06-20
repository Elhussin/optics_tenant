import logging
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.hrm.models import Payroll
from apps.accounting.models.chart_of_accounts import ChartOfAccounts
from apps.accounting.models.journal_entry import JournalEntry, JournalEntryLine

logger = logging.getLogger(__name__)

@transaction.atomic
def approve_payroll(payroll: Payroll, user):
    """
    Approve payroll and automatically generate a journal entry.
    """
    if payroll.status != 'draft':
        raise ValidationError(_("Only draft payroll can be approved"))
        
    payroll.status = 'approved'
    
    # Attempt to generate Journal Entry
    # Debit: Salary Expense Account
    # Credit: Accrued Salaries (Payable) Account
    
    # Note: These account codes should ideally be configurable via settings or enums.
    # We are using placeholder query logic assuming standard chart of accounts exists.
    expense_account = ChartOfAccounts.objects.filter(account_type='expense', name__icontains='salary').first()
    payable_account = ChartOfAccounts.objects.filter(account_type='liability', name__icontains='payable').first()
    
    if expense_account and payable_account and payroll.net_salary > 0:
        entry = JournalEntry.objects.create(
            branch=payroll.employee.department.branch if hasattr(payroll.employee.department, 'branch') else None,
            date=timezone.now().date(),
            reference=f"PAYROLL-{payroll.id}-{payroll.month}",
            description=f"Payroll approval for {payroll.employee.user.username} - {payroll.month}",
            created_by=user,
            status='posted'
        )
        
        # Debit Expense
        JournalEntryLine.objects.create(
            entry=entry,
            account=expense_account,
            description=f"Salary Expense - {payroll.employee.user.username}",
            debit=payroll.net_salary,
            credit=0
        )
        
        # Credit Payable
        JournalEntryLine.objects.create(
            entry=entry,
            account=payable_account,
            description=f"Accrued Salary - {payroll.employee.user.username}",
            debit=0,
            credit=payroll.net_salary
        )
        
        payroll.journal_entry = entry
    else:
        logger.warning(f"Could not generate Journal Entry for Payroll {payroll.id}. Missing accounts or zero salary.")
        
    payroll.save()
    return payroll
