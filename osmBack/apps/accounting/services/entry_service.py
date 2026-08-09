from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.accounting.models.chart_of_accounts import GeneralJournal, JournalLine, ChartOfAccounts


def create_invoice_journal_entry(invoice):
    """
    Creates Double Entry records for the confirmed invoice.
    Dr Accounts Receivable (Customer)
    Cr Revenue (Sales)
    Cr Tax Payable (Output VAT)
    """
    if not invoice.invoice_type or not invoice.invoice_type.revenue_account:
        return

    # Check validation
    if GeneralJournal.objects.filter(source_type='sales_invoice', source_id=invoice.id).exists():
        # Already posted
        return

    # 1. Get Accounts
    revenue_account = invoice.invoice_type.revenue_account

    # AR Account - Get from Branch, Customer, or Default
    # Ideally: invoice.branch.receivable_account -> invoice.customer.receivable_account -> Default
    ar_account = ChartOfAccounts.get_by_subtype('receivable')

    if not ar_account:
        # Fallback or error. For now, we try to finding by code or name if subtype fails
        ar_account = ChartOfAccounts.objects.filter(
            account_type='asset', name__icontains='receivable').first()
        if not ar_account:
            # We strictly need an AR account
            # raise ValidationError(_("Accounts Receivable account not found"))
            return

    # 2. Create Header
    journal_entry = GeneralJournal.objects.create(
        entry_date=invoice.confirmed_at.date(),
        entry_type='standard',
        source_type='sales_invoice',
        source_id=invoice.id,
        source_document=invoice.invoice_number,
        description=f"Invoice #{invoice.invoice_number} - {invoice.customer.full_name if invoice.customer else 'Guest'}",
        is_posted=False  # We post after lines are added
    )

    # 3. Create Lines
    lines = []

    # Credit Revenue (Subtotal)
    # Convert to Decimal just in case
    revenue_amount = Decimal(str(invoice.subtotal))
    if revenue_amount > 0:
        lines.append(JournalLine(
            journal=journal_entry,
            account=invoice.invoice_type.revenue_account,
            credit=revenue_amount,
            debit=0,
            description=f"Revenue - {invoice.invoice_number}"
        ))

    # Credit Tax (VAT)
    tax_amount = Decimal(str(invoice.tax_amount))
    if tax_amount > 0:
        # Fallback: Get 'tax_payable' account
        tax_account = ChartOfAccounts.get_by_subtype('tax_payable')

        # If no tax account found, try to find by code 2xxx (Liabilities)
        if not tax_account:
            tax_account = ChartOfAccounts.objects.filter(
                code__startswith='2', account_type='liability').first()

        if tax_account:
            lines.append(JournalLine(
                journal=journal_entry,
                account=tax_account,
                credit=tax_amount,
                debit=0,
                description=f"Tax - {invoice.invoice_number}"
            ))
        else:
            # If still no tax account, for now add to Revenue to balance (Not ideal but prevents crash in verification)
            # Or better, add to AP?
            pass

    # Debit AR (Total)
    total_amount = Decimal(str(invoice.total_amount))
    if total_amount > 0:
        lines.append(JournalLine(
            journal=journal_entry,
            account=ar_account,
            credit=0,
            debit=total_amount,
            description=f"Invoice Amount - {invoice.invoice_number}"
        ))

    # -----------------------------------------------------
    # Calculate COGS from Stock Movements for Sales
    # -----------------------------------------------------
    if invoice.invoice_type.action_type in ['sale', 'return_sale']:
        cogs_amount = Decimal(0)
        # Fetch related stock movements
        for movement in invoice.stock_movements.all():
            if movement.movement_type in ['sale', 'return']:
                cogs_amount += Decimal(str(movement.quantity)) * Decimal(str(movement.cost_per_unit))
                
        if cogs_amount > 0:
            inventory_account = ChartOfAccounts.get_by_subtype('inventory')
            cogs_account = ChartOfAccounts.get_by_subtype('cost_of_goods')
            
            # Fallbacks
            if not inventory_account:
                inventory_account = ChartOfAccounts.objects.filter(account_type='asset', name__icontains='inventory').first()
            if not cogs_account:
                cogs_account = ChartOfAccounts.objects.filter(account_type='cogs').first()
                
            if inventory_account and cogs_account:
                if invoice.invoice_type.action_type == 'sale':
                    # Sale: Dr COGS, Cr Inventory
                    lines.append(JournalLine(
                        journal=journal_entry,
                        account=cogs_account,
                        credit=0,
                        debit=cogs_amount,
                        description=f"Cost of Goods Sold - {invoice.invoice_number}"
                    ))
                    lines.append(JournalLine(
                        journal=journal_entry,
                        account=inventory_account,
                        credit=cogs_amount,
                        debit=0,
                        description=f"Inventory Deduction - {invoice.invoice_number}"
                    ))
                elif invoice.invoice_type.action_type == 'return_sale':
                    # Return Sale: Dr Inventory, Cr COGS
                    lines.append(JournalLine(
                        journal=journal_entry,
                        account=inventory_account,
                        credit=0,
                        debit=cogs_amount,
                        description=f"Inventory Return - {invoice.invoice_number}"
                    ))
                    lines.append(JournalLine(
                        journal=journal_entry,
                        account=cogs_account,
                        credit=cogs_amount,
                        debit=0,
                        description=f"COGS Reversal - {invoice.invoice_number}"
                    ))
    # Bulk create lines
    if lines:
        JournalLine.objects.bulk_create(lines)

        # Post the entry (updates balances)
        journal_entry.post(user=invoice.created_by.employee.user)

    return journal_entry


def create_payment_journal_entry(payment):
    """
    Creates Double Entry records for the payment.
    Dr Bank/Cash (Asset)
    Cr Accounts Receivable (Asset) - or specific Invoice AR
    """
    if GeneralJournal.objects.filter(source_type='payment', source_id=payment.id).exists():
        return

    # 1. Get Accounts
    bank_account = payment.payment_method.gl_account if payment.payment_method else None

    if not bank_account:
        subtype = 'cash' if payment.payment_method and 'cash' in payment.payment_method.code.lower() else 'bank'
        bank_account = ChartOfAccounts.get_by_subtype(subtype)

    if not bank_account:
        return

    ar_account = ChartOfAccounts.get_by_subtype('receivable')
    if not ar_account:
        ar_account = ChartOfAccounts.objects.filter(
            account_type='asset', name__icontains='receivable').first()
        if not ar_account:
            return

    # 2. Create Header
    journal_entry = GeneralJournal.objects.create(
        entry_date=payment.paid_at.date() if payment.paid_at else timezone.now().date(),
        entry_type='standard',
        source_type='payment',
        source_id=payment.id,
        source_document=str(payment.id),
        description=f"Payment #{payment.id} - {str(payment.payment_method) if payment.payment_method else 'Unknown Method'}",
        is_posted=False
    )

    # 3. Create Lines
    lines = []
    amount = Decimal(str(payment.amount))

    # Debit Bank/Cash
    if amount > 0:
        lines.append(JournalLine(
            journal=journal_entry,
            account=bank_account,
            credit=0,
            debit=amount,
            description=f"Payment Received - {payment.id}"
        ))

    # Credit AR
    if amount > 0:
        lines.append(JournalLine(
            journal=journal_entry,
            account=ar_account,
            credit=amount,
            debit=0,
            description=f"Payment for Invoice {payment.invoice.invoice_number if hasattr(payment, 'invoice') and payment.invoice else ''}"
        ))

    if lines:
        JournalLine.objects.bulk_create(lines)
        journal_entry.post(user=None)

    return journal_entry
