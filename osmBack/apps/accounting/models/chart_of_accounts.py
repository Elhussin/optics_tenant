# apps/accounting/models/chart_of_accounts.py
"""
دليل الحسابات - Chart of Accounts
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel


class ChartOfAccounts(BaseModel):
    """
    دليل الحسابات - الهيكل الأساسي للحسابات المحاسبية
    """
    ACCOUNT_TYPES = [
        ('asset', _('Asset')),              # 1xxxx
        ('liability', _('Liability')),      # 2xxxx
        ('equity', _('Equity')),            # 3xxxx
        ('revenue', _('Revenue')),          # 4xxxx
        ('expense', _('Expense')),          # 5xxxx
        ('cogs', _('Cost of Goods Sold')),  # 6xxxx
    ]

    ACCOUNT_SUBTYPES = [
        # Assets
        ('cash', _('Cash')),
        ('bank', _('Bank')),
        ('receivable', _('Accounts Receivable')),
        ('inventory', _('Inventory')),
        ('prepaid', _('Prepaid Expenses')),
        ('fixed_asset', _('Fixed Assets')),

        # Liabilities
        ('payable', _('Accounts Payable')),
        ('accrued', _('Accrued Expenses')),
        ('tax_payable', _('Taxes Payable')),
        ('deferred', _('Deferred Revenue')),
        ('loan', _('Loans')),

        # Equity
        ('capital', _('Capital')),
        ('retained', _('Retained Earnings')),
        ('reserves', _('Reserves')),

        # Revenue
        ('sales', _('Sales')),
        ('service', _('Services')),
        ('other_income', _('Other Income')),

        # Expenses
        ('salary', _('Salaries')),
        ('rent', _('Rent')),
        ('utilities', _('Utilities')),
        ('supplies', _('Supplies')),
        ('marketing', _('Marketing')),
        ('other_expense', _('Other Expenses')),

        # COGS
        ('cost_of_goods', _('Cost of Goods Sold')),
    ]

    code = models.CharField(
        max_length=10,
        unique=True,
        verbose_name=_('Account Code'),
        help_text=_('Example: 1100 for Cash')
    )
    name = models.CharField(max_length=200, verbose_name=_('Account Name'))
    name_en = models.CharField(
        max_length=200, blank=True, verbose_name=_('English Name'))

    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPES,
        verbose_name=_('Account Type')
    )
    account_subtype = models.CharField(
        max_length=20,
        choices=ACCOUNT_SUBTYPES,
        blank=True,
        verbose_name=_('Account Subtype')
    )

    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('Parent Account')
    )

    description = models.TextField(blank=True, verbose_name=_('Description'))

    # Opening Balance
    opening_balance = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name=_('Opening Balance')
    )
    current_balance = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name=_('Current Balance')
    )

    # Header Account
    is_header = models.BooleanField(
        default=False,
        verbose_name=_('Is Header Account'),
        help_text=_('Header accounts are not used for journal entries')
    )

    # Normal Balance
    normal_balance = models.CharField(
        max_length=10,
        choices=[('debit', _('Debit')), ('credit', _('Credit'))],
        default='debit',
        verbose_name=_('Normal Balance')
    )

    class Meta:
        verbose_name = _('Chart of Accounts')
        verbose_name_plural = _('Chart of Accounts')
        ordering = ['code']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['account_type']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

    def save(self, *args, **kwargs):
        # تحديد الطبيعة تلقائياً بناءً على نوع الحساب
        if not self.pk:
            if self.account_type in ['asset', 'expense', 'cogs']:
                self.normal_balance = 'debit'
            else:
                self.normal_balance = 'credit'

        super().save(*args, **kwargs)

    def get_full_path(self):
        """الحصول على المسار الكامل للحساب"""
        path = [self.name]
        parent = self.parent
        while parent:
            path.insert(0, parent.name)
            parent = parent.parent
        return ' > '.join(path)

    @classmethod
    def get_by_code(cls, code):
        """البحث عن حساب بالرمز"""
        return cls.objects.filter(code=code, is_active=True).first()

    @classmethod
    def get_by_subtype(cls, subtype):
        """البحث عن حساب بالنوع الفرعي"""
        return cls.objects.filter(account_subtype=subtype, is_active=True, is_header=False).first()

    def update_balance(self, amount, is_debit=True):
        """تحديث الرصيد"""
        from decimal import Decimal
        amount = Decimal(str(amount))

        if is_debit:
            if self.normal_balance == 'debit':
                self.current_balance += amount
            else:
                self.current_balance -= amount
        else:
            if self.normal_balance == 'credit':
                self.current_balance += amount
            else:
                self.current_balance -= amount

        self.save(update_fields=['current_balance'])


class GeneralJournal(BaseModel):
    """
    دفتر اليومية العام
    """
    ENTRY_TYPES = [
        ('standard', _('Standard Entry')),
        ('adjustment', _('Adjustment Entry')),
        ('closing', _('Closing Entry')),
        ('opening', _('Opening Entry')),
        ('reversal', _('Reversal Entry')),
    ]

    SOURCE_TYPES = [
        ('manual', _('Manual')),
        ('sales_invoice', _('Sales Invoice')),
        ('purchase_invoice', _('Purchase Invoice')),
        ('payment', _('Payment')),
        ('receipt', _('Receipt')),
        ('return', _('Return')),
        ('adjustment', _('Inventory Adjustment')),
        ('payroll', _('Payroll')),
    ]

    entry_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        verbose_name=_('Entry Number')
    )
    entry_date = models.DateField(verbose_name=_('Entry Date'))

    entry_type = models.CharField(
        max_length=20,
        choices=ENTRY_TYPES,
        default='standard',
        verbose_name=_('Entry Type')
    )
    source_type = models.CharField(
        max_length=20,
        choices=SOURCE_TYPES,
        default='manual',
        verbose_name=_('Source Type')
    )

    # Source Document Reference
    source_document = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Source Document Number')
    )
    source_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_('Source Document ID')
    )

    description = models.TextField(verbose_name=_('Description'))

    # Totals
    total_debit = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name=_('Total Debit')
    )
    total_credit = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name=_('Total Credit')
    )

    # Status
    is_posted = models.BooleanField(
        default=False,
        verbose_name=_('Is Posted')
    )
    posted_at = models.DateTimeField(
        null=True, blank=True, verbose_name=_('Posted At'))
    posted_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='posted_journals',
        verbose_name=_('Posted By')
    )

    # Reversal Entry
    reversed_entry = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reversal_entries',
        verbose_name=_('Reversed Entry')
    )

    notes = models.TextField(blank=True, verbose_name=_('Notes'))

    class Meta:
        verbose_name = _('Journal Entry')
        verbose_name_plural = _('Journal Entries')
        ordering = ['-entry_date', '-entry_number']
        indexes = [
            models.Index(fields=['entry_date']),
            models.Index(fields=['source_type', 'source_id']),
        ]

    def __str__(self):
        return f"قيد {self.entry_number} - {self.entry_date}"

    def save(self, *args, **kwargs):
        if not self.entry_number:
            self.entry_number = self._generate_entry_number()
        super().save(*args, **kwargs)

    def _generate_entry_number(self):
        """توليد رقم قيد تلقائي"""
        from django.utils import timezone
        import time

        today = timezone.now()
        prefix = f"JV{today.strftime('%Y%m')}"

        last_entry = GeneralJournal.objects.filter(
            entry_number__startswith=prefix
        ).order_by('-entry_number').first()

        if last_entry:
            last_num = int(last_entry.entry_number[-4:])
            new_num = last_num + 1
        else:
            new_num = 1

        return f"{prefix}{new_num:04d}"

    def validate_balance(self):
        """التحقق من توازن القيد"""
        total_debit = sum(line.debit for line in self.lines.all())
        total_credit = sum(line.credit for line in self.lines.all())

        if total_debit != total_credit:
            raise ValidationError(
                str(_('Journal entry is not balanced: debit={debit}, credit={credit}').format(
                    debit=total_debit,
                    credit=total_credit
                ))
            )

        self.total_debit = total_debit
        self.total_credit = total_credit
        return True

    def post(self, user=None):
        """ترحيل القيد وتحديث أرصدة الحسابات"""
        from django.utils import timezone

        if self.is_posted:
            raise ValidationError(str(_('Journal entry is already posted')))

        self.validate_balance()

        # تحديث أرصدة الحسابات
        for line in self.lines.all():
            if line.debit > 0:
                line.account.update_balance(line.debit, is_debit=True)
            if line.credit > 0:
                line.account.update_balance(line.credit, is_debit=False)

        self.is_posted = True
        self.posted_at = timezone.now()
        self.posted_by = user
        self.save()

        return self

    def reverse(self, user=None):
        """إنشاء قيد عكسي"""
        from django.utils import timezone

        if not self.is_posted:
            raise ValidationError(
                str(_('Cannot reverse an unposted journal entry')))

        # Create reversal entry
        reversal = GeneralJournal.objects.create(
            entry_date=timezone.now().date(),
            entry_type='reversal',
            source_type=self.source_type,
            description=str(_('Reversal of entry #{number}').format(
                number=self.entry_number)),
            reversed_entry=self,
        )

        # Reverse lines
        for line in self.lines.all():
            JournalLine.objects.create(
                journal=reversal,
                account=line.account,
                debit=line.credit,
                credit=line.debit,
                description=str(_('Reversal: {desc}').format(
                    desc=line.description)),
            )

        reversal.post(user)
        return reversal


class JournalLine(BaseModel):
    """
    سطر في قيد اليومية
    """
    journal = models.ForeignKey(
        GeneralJournal,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('Journal Entry')
    )
    account = models.ForeignKey(
        ChartOfAccounts,
        on_delete=models.PROTECT,
        related_name='journal_lines',
        verbose_name=_('Account')
    )

    debit = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name=_('Debit')
    )
    credit = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name=_('Credit')
    )

    description = models.CharField(
        max_length=500, blank=True, verbose_name=_('Description'))

    # Cost Center
    cost_center = models.CharField(
        max_length=50, blank=True, verbose_name=_('Cost Center'))

    class Meta:
        verbose_name = _('Journal Line')
        verbose_name_plural = _('Journal Lines')

    def __str__(self):
        return f"{self.account.code} - {_('Debit')}:{self.debit} {_('Credit')}:{self.credit}"

    def clean(self):
        # Cannot both be zero or both be positive
        if self.debit == 0 and self.credit == 0:
            raise ValidationError(
                str(_('Must specify either debit or credit amount')))
        if self.debit > 0 and self.credit > 0:
            raise ValidationError(
                str(_('Cannot have both debit and credit in the same line')))
