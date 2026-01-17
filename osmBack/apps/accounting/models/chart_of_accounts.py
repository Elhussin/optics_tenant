# apps/accounting/models/chart_of_accounts.py
"""
دليل الحسابات - Chart of Accounts
"""

from django.db import models
from django.core.exceptions import ValidationError
from core.models import BaseModel


class ChartOfAccounts(BaseModel):
    """
    دليل الحسابات - الهيكل الأساسي للحسابات المحاسبية
    """
    ACCOUNT_TYPES = [
        ('asset', 'أصل'),              # 1xxxx
        ('liability', 'التزام'),        # 2xxxx
        ('equity', 'حقوق الملكية'),     # 3xxxx
        ('revenue', 'إيراد'),           # 4xxxx
        ('expense', 'مصروف'),           # 5xxxx
        ('cogs', 'تكلفة البضاعة'),      # 6xxxx (Cost of Goods Sold)
    ]

    ACCOUNT_SUBTYPES = [
        # Assets - أصول
        ('cash', 'نقدية'),
        ('bank', 'بنك'),
        ('receivable', 'ذمم مدينة'),
        ('inventory', 'مخزون'),
        ('prepaid', 'مصروفات مقدمة'),
        ('fixed_asset', 'أصول ثابتة'),

        # Liabilities - التزامات
        ('payable', 'ذمم دائنة'),
        ('accrued', 'مصروفات مستحقة'),
        ('tax_payable', 'ضرائب مستحقة'),
        ('deferred', 'إيرادات مقدمة'),
        ('loan', 'قروض'),

        # Equity - حقوق ملكية
        ('capital', 'رأس المال'),
        ('retained', 'أرباح مبقاة'),
        ('reserves', 'احتياطيات'),

        # Revenue - إيرادات
        ('sales', 'مبيعات'),
        ('service', 'خدمات'),
        ('other_income', 'إيرادات أخرى'),

        # Expenses - مصروفات
        ('salary', 'رواتب'),
        ('rent', 'إيجار'),
        ('utilities', 'مرافق'),
        ('supplies', 'مستلزمات'),
        ('marketing', 'تسويق'),
        ('other_expense', 'مصروفات أخرى'),

        # COGS - تكلفة البضاعة
        ('cost_of_goods', 'تكلفة بضاعة مباعة'),
    ]

    code = models.CharField(
        max_length=10,
        unique=True,
        verbose_name="رمز الحساب",
        help_text="مثال: 1100 للنقدية"
    )
    name = models.CharField(max_length=200, verbose_name="اسم الحساب")
    name_en = models.CharField(
        max_length=200, blank=True, verbose_name="الاسم بالإنجليزية")

    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPES,
        verbose_name="نوع الحساب"
    )
    account_subtype = models.CharField(
        max_length=20,
        choices=ACCOUNT_SUBTYPES,
        blank=True,
        verbose_name="النوع الفرعي"
    )

    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name="الحساب الرئيسي"
    )

    description = models.TextField(blank=True, verbose_name="الوصف")

    # الرصيد الافتتاحي
    opening_balance = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name="الرصيد الافتتاحي"
    )
    current_balance = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name="الرصيد الحالي"
    )

    # هل يظهر في التقارير
    is_header = models.BooleanField(
        default=False,
        verbose_name="حساب رئيسي (عنوان)",
        help_text="الحسابات الرئيسية لا تستخدم للقيود"
    )

    # هل تزيد بالمدين أم بالدائن
    normal_balance = models.CharField(
        max_length=10,
        choices=[('debit', 'مدين'), ('credit', 'دائن')],
        default='debit',
        verbose_name="الطبيعة"
    )

    class Meta:
        verbose_name = "حساب في دليل الحسابات"
        verbose_name_plural = "دليل الحسابات"
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
        ('standard', 'قيد عادي'),
        ('adjustment', 'قيد تسوية'),
        ('closing', 'قيد إقفال'),
        ('opening', 'قيد افتتاحي'),
        ('reversal', 'قيد عكسي'),
    ]

    SOURCE_TYPES = [
        ('manual', 'يدوي'),
        ('sales_invoice', 'فاتورة مبيعات'),
        ('purchase_invoice', 'فاتورة مشتريات'),
        ('payment', 'دفعة'),
        ('receipt', 'قبض'),
        ('return', 'مرتجع'),
        ('adjustment', 'تسوية مخزون'),
        ('payroll', 'رواتب'),
    ]

    entry_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        verbose_name="رقم القيد"
    )
    entry_date = models.DateField(verbose_name="تاريخ القيد")

    entry_type = models.CharField(
        max_length=20,
        choices=ENTRY_TYPES,
        default='standard',
        verbose_name="نوع القيد"
    )
    source_type = models.CharField(
        max_length=20,
        choices=SOURCE_TYPES,
        default='manual',
        verbose_name="مصدر القيد"
    )

    # ربط بالمستند المصدر
    source_document = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="رقم المستند المصدر"
    )
    source_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="معرف المستند"
    )

    description = models.TextField(verbose_name="الوصف")

    # الإجماليات
    total_debit = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name="إجمالي المدين"
    )
    total_credit = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name="إجمالي الدائن"
    )

    # الحالة
    is_posted = models.BooleanField(
        default=False,
        verbose_name="مرحّل"
    )
    posted_at = models.DateTimeField(null=True, blank=True)
    posted_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='posted_journals'
    )

    # قيد عكسي
    reversed_entry = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reversal_entries'
    )

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "قيد يومية"
        verbose_name_plural = "قيود اليومية"
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
                f"القيد غير متوازن: مدين={total_debit}, دائن={total_credit}"
            )

        self.total_debit = total_debit
        self.total_credit = total_credit
        return True

    def post(self, user=None):
        """ترحيل القيد وتحديث أرصدة الحسابات"""
        from django.utils import timezone

        if self.is_posted:
            raise ValidationError("القيد مرحّل مسبقاً")

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
        if not self.is_posted:
            raise ValidationError("لا يمكن عكس قيد غير مرحّل")

        # إنشاء القيد العكسي
        reversal = GeneralJournal.objects.create(
            entry_date=timezone.now().date(),
            entry_type='reversal',
            source_type=self.source_type,
            description=f"عكس القيد رقم {self.entry_number}",
            reversed_entry=self,
        )

        # عكس السطور
        for line in self.lines.all():
            JournalLine.objects.create(
                journal=reversal,
                account=line.account,
                debit=line.credit,
                credit=line.debit,
                description=f"عكس: {line.description}",
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
        verbose_name="القيد"
    )
    account = models.ForeignKey(
        ChartOfAccounts,
        on_delete=models.PROTECT,
        related_name='journal_lines',
        verbose_name="الحساب"
    )

    debit = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name="مدين"
    )
    credit = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name="دائن"
    )

    description = models.CharField(max_length=500, blank=True)

    # ربط بمستندات أخرى للتتبع
    cost_center = models.CharField(
        max_length=50, blank=True, verbose_name="مركز تكلفة")

    class Meta:
        verbose_name = "سطر قيد"
        verbose_name_plural = "سطور القيود"

    def __str__(self):
        return f"{self.account.code} - مدين:{self.debit} دائن:{self.credit}"

    def clean(self):
        # لا يمكن أن يكون كلاهما صفر أو كلاهما موجب
        if self.debit == 0 and self.credit == 0:
            raise ValidationError("يجب تحديد مبلغ مدين أو دائن")
        if self.debit > 0 and self.credit > 0:
            raise ValidationError("لا يمكن وجود مدين ودائن في نفس السطر")
