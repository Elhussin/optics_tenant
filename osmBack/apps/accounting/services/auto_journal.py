# apps/accounting/services/auto_journal.py
"""
Service for creating automatic accounting journals
"""

from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import logging

logger = logging.getLogger(__name__)


class AutoJournalService:
    """
    Service for creating automatic accounting journal entries from documents
    """

    # Default Account Codes
    DEFAULT_ACCOUNTS = {
        # Assets
        'cash': '1100',
        'bank': '1110',
        'receivables': '1200',
        'insurance_receivables': '1210',
        'bnpl_receivables': '1220',
        'inventory': '1300',

        # Liabilities
        'payables': '2100',
        'vat_payable': '2200',
        'customer_deposits': '2300',

        # Equity
        'capital': '3100',
        'retained_earnings': '3200',

        # Revenue
        'sales_revenue': '4100',
        'service_revenue': '4200',
        'discount_given': '4900',

        # COGS
        'cogs': '5100',

        # Expenses
        'salaries': '6100',
        'rent': '6200',
        'utilities': '6300',
    }

    @classmethod
    def get_or_create_account(cls, code, name, account_type, subtype=''):
        """Get or create the account"""
        from apps.accounting.models import ChartOfAccounts

        account, created = ChartOfAccounts.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'account_type': account_type,
                'account_subtype': subtype,
            }
        )

        if created:
            logger.info(f"Created new account: {code} - {name}")

        return account

    @classmethod
    def setup_default_accounts(cls):
        """Setup default accounts"""
        accounts_setup = [
            # Assets
            ('1000', _('Current Assets'), 'asset', '', True),
            ('1100', _('Cash'), 'asset', 'cash', False),
            ('1110', _('Bank'), 'asset', 'bank', False),
            ('1200', _('Accounts Receivable'), 'asset', 'receivable', False),
            ('1210', _('Insurance Receivables'), 'asset', 'receivable', False),
            ('1220', _('BNPL Receivables'), 'asset', 'receivable', False),
            ('1300', _('Inventory'), 'asset', 'inventory', False),

            # Liabilities
            ('2000', _('Current Liabilities'), 'liability', '', True),
            ('2100', _('Accounts Payable'), 'liability', 'payable', False),
            ('2200', _('VAT Payable'), 'liability', 'tax_payable', False),
            ('2300', _('Customer Deposits'), 'liability', 'deferred', False),

            # Equity
            ('3000', _('Equity'), 'equity', '', True),
            ('3100', _('Capital'), 'equity', 'capital', False),
            ('3200', _('Retained Earnings'), 'equity', 'retained', False),

            # Revenue
            ('4000', _('Revenue'), 'revenue', '', True),
            ('4100', _('Sales Revenue'), 'revenue', 'sales', False),
            ('4200', _('Service Revenue'), 'revenue', 'service', False),
            ('4900', _('Discount Allowed'), 'revenue', 'other_income', False),

            # COGS
            ('5000', _('Cost of Goods Sold'), 'cogs', '', True),
            ('5100', _('Cost of Goods'), 'cogs', 'cost_of_goods', False),

            # Expenses
            ('6000', _('Operating Expenses'), 'expense', '', True),
            ('6100', _('Salaries and Wages'), 'expense', 'salary', False),
            ('6200', _('Rent Expense'), 'expense', 'rent', False),
            ('6300', _('Utilities Expense'), 'expense', 'utilities', False),
        ]

        from apps.accounting.models import ChartOfAccounts

        for code, name, acc_type, subtype, is_header in accounts_setup:
            ChartOfAccounts.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'account_type': acc_type,
                    'account_subtype': subtype,
                    'is_header': is_header,
                }
            )

        logger.info("Default accounts setup complete")

    @classmethod
    @transaction.atomic
    def create_sales_invoice_journal(cls, invoice):
        """
        Create journal entry from sales invoice

        Entry:
        Debit: Receivables / Cash    = Total Amount
        Credit: Sales Revenue        = Subtotal (before tax)
        Credit: VAT Payable          = Tax Amount
        Credit: Discount Allowed     = Discount (if any) - not strictly separate usually nets against revenue, but implementation depends.
        Here: Revenue is credited with Net Sales (Subtotal - Discount).
        """
        from apps.accounting.models import GeneralJournal, JournalLine, ChartOfAccounts

        # Determine debit account (Cash or Receivables)
        if invoice.status == 'paid':
            debit_account_code = cls.DEFAULT_ACCOUNTS['cash']
        else:
            # Determine receivable type based on Order
            order = invoice.order
            if order and order.partner:
                if order.partner.partner_type == 'insurance':
                    debit_account_code = cls.DEFAULT_ACCOUNTS['insurance_receivables']
                elif order.partner.partner_type == 'bnpl':
                    debit_account_code = cls.DEFAULT_ACCOUNTS['bnpl_receivables']
                else:
                    debit_account_code = cls.DEFAULT_ACCOUNTS['receivables']
            else:
                debit_account_code = cls.DEFAULT_ACCOUNTS['receivables']

        # Get accounts
        debit_account = ChartOfAccounts.objects.filter(
            code=debit_account_code).first()
        sales_account = ChartOfAccounts.objects.filter(
            code=cls.DEFAULT_ACCOUNTS['sales_revenue']).first()
        vat_account = ChartOfAccounts.objects.filter(
            code=cls.DEFAULT_ACCOUNTS['vat_payable']).first()

        if not all([debit_account, sales_account, vat_account]):
            logger.warning(
                "Default accounts missing - running setup_default_accounts")
            cls.setup_default_accounts()
            # Fetch again
            debit_account = ChartOfAccounts.objects.get(
                code=debit_account_code)
            sales_account = ChartOfAccounts.objects.get(
                code=cls.DEFAULT_ACCOUNTS['sales_revenue'])
            vat_account = ChartOfAccounts.objects.get(
                code=cls.DEFAULT_ACCOUNTS['vat_payable'])

        # Create Journal
        journal = GeneralJournal.objects.create(
            entry_date=invoice.created_at.date() if invoice.created_at else timezone.now().date(),
            entry_type='standard',
            source_type='sales_invoice',
            source_document=invoice.invoice_number,
            source_id=invoice.id,
            description=str(_('Sales invoice #{number} - {customer}').format(
                number=invoice.invoice_number,
                customer=invoice.customer.full_name if invoice.customer else _(
                    'Customer')
            )),
        )

        # Debit Line (Customer/Cash)
        JournalLine.objects.create(
            journal=journal,
            account=debit_account,
            debit=invoice.total_amount,
            credit=0,
            description=str(
                _('Customer receivable - Invoice #{number}').format(number=invoice.invoice_number)),
        )

        # Credit Line (Sales Revenue)
        net_sales = invoice.subtotal - (invoice.discount_amount or 0)
        JournalLine.objects.create(
            journal=journal,
            account=sales_account,
            debit=0,
            credit=net_sales,
            description=str(_('Sales revenue')),
        )

        # Credit Line (VAT)
        if invoice.tax_amount and invoice.tax_amount > 0:
            JournalLine.objects.create(
                journal=journal,
                account=vat_account,
                debit=0,
                credit=invoice.tax_amount,
                description=str(_('Value Added Tax')),
            )

        # Validate and Save
        journal.validate_balance()
        journal.save()

        logger.info(f"Sales journal created: {journal.entry_number}")
        return journal

    @classmethod
    @transaction.atomic
    def create_payment_journal(cls, payment):
        """
        Create journal entry from payment

        Entry:
        Debit: Cash/Bank       = Payment Amount
        Credit: Receivables    = Payment Amount
        """
        from apps.accounting.models import GeneralJournal, JournalLine, ChartOfAccounts

        # Determine debit account based on payment method
        # It is safer to use payment_method.type or code key checks
        # Assuming payment_method is an object; checking code or name_en
        method_code = payment.payment_method.code if payment.payment_method else 'cash'

        if method_code == 'cash':
            debit_account_code = cls.DEFAULT_ACCOUNTS['cash']
        elif method_code in ['card', 'mada', 'visa', 'mastercard', 'apple_pay', 'stc_pay', 'transfer']:
            debit_account_code = cls.DEFAULT_ACCOUNTS['bank']
        elif method_code in ['tabby', 'tamara']:
            debit_account_code = cls.DEFAULT_ACCOUNTS['bnpl_receivables']
        elif method_code == 'insurance':
            debit_account_code = cls.DEFAULT_ACCOUNTS['insurance_receivables']
        else:
            debit_account_code = cls.DEFAULT_ACCOUNTS['bank']

        # Credit Account
        credit_account_code = cls.DEFAULT_ACCOUNTS['receivables']

        debit_account = ChartOfAccounts.objects.get(code=debit_account_code)
        credit_account = ChartOfAccounts.objects.get(code=credit_account_code)

        # Description
        invoice = payment.invoice
        order = payment.order
        source_doc = invoice.invoice_number if invoice else (
            order.order_number if order else 'N/A')

        journal = GeneralJournal.objects.create(
            entry_date=payment.paid_at.date() if payment.paid_at else timezone.now().date(),
            entry_type='standard',
            source_type='receipt',
            source_document=source_doc,
            source_id=payment.id,
            description=str(_("Payment {method} - {doc}").format(
                method=payment.get_payment_method_display() if hasattr(
                    payment, 'get_payment_method_display') else method_code,
                doc=source_doc
            )),
        )

        # Debit Line
        JournalLine.objects.create(
            journal=journal,
            account=debit_account,
            debit=payment.amount,
            credit=0,
            description=str(_('Payment received via {method}').format(
                method=payment.get_payment_method_display())),
        )

        # Credit Line
        JournalLine.objects.create(
            journal=journal,
            account=credit_account,
            debit=0,
            credit=payment.amount,
            description=str(_('Customer receivable settlement')),
        )

        journal.validate_balance()
        journal.save()

        logger.info(f"Payment journal created: {journal.entry_number}")
        return journal

    @classmethod
    @transaction.atomic
    def create_return_journal(cls, invoice):
        """
        Create sales return journal

        Entry (Reverse of Sales):
        Debit: Sales Revenue        = Net Amount
        Debit: VAT Payable          = Tax Amount
        Credit: Receivables / Cash  = Total Amount
        """
        from apps.accounting.models import GeneralJournal, JournalLine, ChartOfAccounts

        sales_account = ChartOfAccounts.objects.get(
            code=cls.DEFAULT_ACCOUNTS['sales_revenue'])
        vat_account = ChartOfAccounts.objects.get(
            code=cls.DEFAULT_ACCOUNTS['vat_payable'])
        receivables_account = ChartOfAccounts.objects.get(
            code=cls.DEFAULT_ACCOUNTS['receivables'])

        journal = GeneralJournal.objects.create(
            entry_date=invoice.created_at.date() if invoice.created_at else timezone.now().date(),
            entry_type='standard',
            source_type='return',
            source_document=invoice.invoice_number,
            source_id=invoice.id,
            description=str(_("Sales Return - Invoice {0}").format(
                invoice.invoice_number)),
        )

        # Reverse Sales Revenue (Debit)
        net_amount = invoice.subtotal - (invoice.discount_amount or 0)
        JournalLine.objects.create(
            journal=journal,
            account=sales_account,
            debit=abs(net_amount),
            credit=0,
            description=str(_('Cancel sales revenue')),
        )

        # Reverse VAT (Debit)
        if invoice.tax_amount and invoice.tax_amount > 0:
            JournalLine.objects.create(
                journal=journal,
                account=vat_account,
                debit=abs(invoice.tax_amount),
                credit=0,
                description=str(_('Cancel Value Added Tax')),
            )

        # Reduce Receivables (Credit)
        JournalLine.objects.create(
            journal=journal,
            account=receivables_account,
            debit=0,
            credit=abs(invoice.total_amount),
            description=str(_('Reduce customer receivable')),
        )

        journal.validate_balance()
        journal.save()

        logger.info(f"Return journal created: {journal.entry_number}")
        return journal

    @classmethod
    @transaction.atomic
    def create_cogs_journal(cls, invoice):
        """
        Create COGS journal entry

        Entry:
        Debit: Cost of Goods Sold   = Total Cost
        Credit: Inventory           = Total Cost
        """
        from apps.accounting.models import GeneralJournal, JournalLine, ChartOfAccounts

        cogs_account = ChartOfAccounts.objects.get(
            code=cls.DEFAULT_ACCOUNTS['cogs'])
        inventory_account = ChartOfAccounts.objects.get(
            code=cls.DEFAULT_ACCOUNTS['inventory'])

        # Calculate Total Cost
        total_cost = Decimal('0')
        for item in invoice.items.all():
            variant = item.product_variant
            if variant and hasattr(variant, 'cost_price') and variant.cost_price:
                total_cost += Decimal(str(variant.cost_price)) * item.quantity

        if total_cost <= 0:
            logger.info("No COGS calculated - skipping journal")
            return None

        journal = GeneralJournal.objects.create(
            entry_date=invoice.created_at.date() if invoice.created_at else timezone.now().date(),
            entry_type='standard',
            source_type='sales_invoice',
            source_document=invoice.invoice_number,
            source_id=invoice.id,
            description=str(_("Cost of Goods Sold - Invoice {0}").format(
                invoice.invoice_number)),
        )

        JournalLine.objects.create(
            journal=journal,
            account=cogs_account,
            debit=total_cost,
            credit=0,
            description=str(_('Cost of goods sold')),
        )

        JournalLine.objects.create(
            journal=journal,
            account=inventory_account,
            debit=0,
            credit=total_cost,
            description=str(_('Reduce inventory')),
        )

        journal.validate_balance()
        journal.save()

        logger.info(f"COGS journal created: {journal.entry_number}")
        return journal
