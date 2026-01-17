# apps/accounting/services/auto_journal.py
"""
خدمة إنشاء القيود المحاسبية التلقائية
"""

from decimal import Decimal
from django.db import transaction
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class AutoJournalService:
    """
    خدمة إنشاء القيود المحاسبية التلقائية من المستندات
    """

    # رموز الحسابات الافتراضية
    DEFAULT_ACCOUNTS = {
        # أصول
        'cash': '1100',
        'bank': '1110',
        'receivables': '1200',
        'insurance_receivables': '1210',
        'bnpl_receivables': '1220',
        'inventory': '1300',

        # التزامات
        'payables': '2100',
        'vat_payable': '2200',
        'customer_deposits': '2300',

        # حقوق الملكية
        'capital': '3100',
        'retained_earnings': '3200',

        # إيرادات
        'sales_revenue': '4100',
        'service_revenue': '4200',
        'discount_given': '4900',

        # تكلفة البضاعة
        'cogs': '5100',

        # مصروفات
        'salaries': '6100',
        'rent': '6200',
        'utilities': '6300',
    }

    @classmethod
    def get_or_create_account(cls, code, name, account_type, subtype=''):
        """الحصول على الحساب أو إنشاؤه"""
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
            logger.info(f"تم إنشاء حساب جديد: {code} - {name}")

        return account

    @classmethod
    def setup_default_accounts(cls):
        """إعداد الحسابات الافتراضية"""
        accounts_setup = [
            # الأصول
            ('1000', 'الأصول المتداولة', 'asset', '', True),
            ('1100', 'الصندوق', 'asset', 'cash', False),
            ('1110', 'البنك', 'asset', 'bank', False),
            ('1200', 'ذمم العملاء', 'asset', 'receivable', False),
            ('1210', 'ذمم شركات التأمين', 'asset', 'receivable', False),
            ('1220', 'ذمم شركات التقسيط', 'asset', 'receivable', False),
            ('1300', 'المخزون', 'asset', 'inventory', False),

            # الالتزامات
            ('2000', 'الالتزامات المتداولة', 'liability', '', True),
            ('2100', 'ذمم الموردين', 'liability', 'payable', False),
            ('2200', 'ضريبة القيمة المضافة المستحقة',
             'liability', 'tax_payable', False),
            ('2300', 'عربون العملاء', 'liability', 'deferred', False),

            # حقوق الملكية
            ('3000', 'حقوق الملكية', 'equity', '', True),
            ('3100', 'رأس المال', 'equity', 'capital', False),
            ('3200', 'الأرباح المبقاة', 'equity', 'retained', False),

            # الإيرادات
            ('4000', 'الإيرادات', 'revenue', '', True),
            ('4100', 'إيرادات المبيعات', 'revenue', 'sales', False),
            ('4200', 'إيرادات الخدمات', 'revenue', 'service', False),
            ('4900', 'الخصم المسموح به', 'revenue', 'other_income', False),

            # تكلفة البضاعة
            ('5000', 'تكلفة البضاعة المباعة', 'cogs', '', True),
            ('5100', 'تكلفة البضاعة', 'cogs', 'cost_of_goods', False),

            # المصروفات
            ('6000', 'المصروفات التشغيلية', 'expense', '', True),
            ('6100', 'الرواتب والأجور', 'expense', 'salary', False),
            ('6200', 'الإيجار', 'expense', 'rent', False),
            ('6300', 'المرافق', 'expense', 'utilities', False),
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

        logger.info("تم إعداد الحسابات الافتراضية")

    @classmethod
    @transaction.atomic
    def create_sales_invoice_journal(cls, invoice):
        """
        إنشاء قيد محاسبي من فاتورة مبيعات

        القيد:
        مدين: ذمم العملاء / نقدية    = المبلغ الإجمالي
        دائن: إيرادات المبيعات       = المبلغ قبل الضريبة
        دائن: ضريبة القيمة المضافة   = مبلغ الضريبة
        دائن: الخصم المسموح به       = الخصم (إن وجد) - قيد منفصل
        """
        from apps.accounting.models import GeneralJournal, JournalLine, ChartOfAccounts

        # تحديد حساب المدين (نقدية أو ذمم عملاء)
        if invoice.status == 'paid':
            debit_account_code = cls.DEFAULT_ACCOUNTS['cash']
        else:
            # تحديد نوع الذمم حسب نوع الطلب
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

        # الحصول على الحسابات
        debit_account = ChartOfAccounts.objects.filter(
            code=debit_account_code).first()
        sales_account = ChartOfAccounts.objects.filter(
            code=cls.DEFAULT_ACCOUNTS['sales_revenue']).first()
        vat_account = ChartOfAccounts.objects.filter(
            code=cls.DEFAULT_ACCOUNTS['vat_payable']).first()

        if not all([debit_account, sales_account, vat_account]):
            logger.warning(
                "الحسابات الافتراضية غير موجودة - تشغيل setup_default_accounts")
            cls.setup_default_accounts()
            # إعادة الجلب
            debit_account = ChartOfAccounts.objects.get(
                code=debit_account_code)
            sales_account = ChartOfAccounts.objects.get(
                code=cls.DEFAULT_ACCOUNTS['sales_revenue'])
            vat_account = ChartOfAccounts.objects.get(
                code=cls.DEFAULT_ACCOUNTS['vat_payable'])

        # إنشاء القيد
        journal = GeneralJournal.objects.create(
            entry_date=invoice.created_at.date() if invoice.created_at else timezone.now().date(),
            entry_type='standard',
            source_type='sales_invoice',
            source_document=invoice.invoice_number,
            source_id=invoice.id,
            description=f"فاتورة مبيعات رقم {invoice.invoice_number} - {invoice.customer.full_name if invoice.customer else 'عميل'}",
        )

        # سطر المدين (العميل)
        JournalLine.objects.create(
            journal=journal,
            account=debit_account,
            debit=invoice.total_amount,
            credit=0,
            description=f"ذمم العميل - فاتورة {invoice.invoice_number}",
        )

        # سطر الدائن (إيرادات المبيعات)
        net_sales = invoice.subtotal - (invoice.discount_amount or 0)
        JournalLine.objects.create(
            journal=journal,
            account=sales_account,
            debit=0,
            credit=net_sales,
            description="إيرادات المبيعات",
        )

        # سطر الدائن (الضريبة)
        if invoice.tax_amount and invoice.tax_amount > 0:
            JournalLine.objects.create(
                journal=journal,
                account=vat_account,
                debit=0,
                credit=invoice.tax_amount,
                description="ضريبة القيمة المضافة",
            )

        # حساب توازن القيد وترحيله
        journal.validate_balance()
        journal.save()

        logger.info(f"تم إنشاء قيد مبيعات: {journal.entry_number}")
        return journal

    @classmethod
    @transaction.atomic
    def create_payment_journal(cls, payment):
        """
        إنشاء قيد محاسبي من دفعة

        القيد:
        مدين: الصندوق/البنك    = مبلغ الدفعة
        دائن: ذمم العملاء       = مبلغ الدفعة
        """
        from apps.accounting.models import GeneralJournal, JournalLine, ChartOfAccounts

        # تحديد حساب المدين حسب طريقة الدفع
        if payment.payment_method == 'cash':
            debit_account_code = cls.DEFAULT_ACCOUNTS['cash']
        elif payment.payment_method in ['card', 'mada', 'visa', 'mastercard', 'apple_pay', 'stc_pay']:
            debit_account_code = cls.DEFAULT_ACCOUNTS['bank']
        elif payment.payment_method in ['tabby', 'tamara']:
            debit_account_code = cls.DEFAULT_ACCOUNTS['bnpl_receivables']
        elif payment.payment_method == 'insurance':
            debit_account_code = cls.DEFAULT_ACCOUNTS['insurance_receivables']
        else:
            debit_account_code = cls.DEFAULT_ACCOUNTS['bank']

        # تحديد حساب الدائن
        credit_account_code = cls.DEFAULT_ACCOUNTS['receivables']

        debit_account = ChartOfAccounts.objects.get(code=debit_account_code)
        credit_account = ChartOfAccounts.objects.get(code=credit_account_code)

        # وصف القيد
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
            description=f"دفعة {payment.get_payment_method_display()} - {source_doc}",
        )

        # سطر المدين
        JournalLine.objects.create(
            journal=journal,
            account=debit_account,
            debit=payment.amount,
            credit=0,
            description=f"استلام دفعة {payment.get_payment_method_display()}",
        )

        # سطر الدائن
        JournalLine.objects.create(
            journal=journal,
            account=credit_account,
            debit=0,
            credit=payment.amount,
            description="تسوية ذمم العميل",
        )

        journal.validate_balance()
        journal.save()

        logger.info(f"تم إنشاء قيد قبض: {journal.entry_number}")
        return journal

    @classmethod
    @transaction.atomic
    def create_return_journal(cls, invoice):
        """
        إنشاء قيد مرتجع مبيعات

        القيد (عكس قيد المبيعات):
        مدين: إيرادات المبيعات       = المبلغ
        مدين: ضريبة القيمة المضافة   = الضريبة
        دائن: ذمم العملاء / نقدية    = المبلغ الإجمالي
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
            description=f"مرتجع مبيعات - فاتورة {invoice.invoice_number}",
        )

        # عكس إيرادات المبيعات (مدين)
        net_amount = invoice.subtotal - (invoice.discount_amount or 0)
        JournalLine.objects.create(
            journal=journal,
            account=sales_account,
            debit=abs(net_amount),
            credit=0,
            description="إلغاء إيرادات المبيعات",
        )

        # عكس الضريبة (مدين)
        if invoice.tax_amount and invoice.tax_amount > 0:
            JournalLine.objects.create(
                journal=journal,
                account=vat_account,
                debit=abs(invoice.tax_amount),
                credit=0,
                description="إلغاء ضريبة القيمة المضافة",
            )

        # تخفيض ذمم العميل (دائن)
        JournalLine.objects.create(
            journal=journal,
            account=receivables_account,
            debit=0,
            credit=abs(invoice.total_amount),
            description="تخفيض ذمم العميل",
        )

        journal.validate_balance()
        journal.save()

        logger.info(f"تم إنشاء قيد مرتجع: {journal.entry_number}")
        return journal

    @classmethod
    @transaction.atomic
    def create_cogs_journal(cls, invoice):
        """
        إنشاء قيد تكلفة البضاعة المباعة

        القيد:
        مدين: تكلفة البضاعة المباعة = تكلفة المنتجات
        دائن: المخزون               = تكلفة المنتجات
        """
        from apps.accounting.models import GeneralJournal, JournalLine, ChartOfAccounts

        cogs_account = ChartOfAccounts.objects.get(
            code=cls.DEFAULT_ACCOUNTS['cogs'])
        inventory_account = ChartOfAccounts.objects.get(
            code=cls.DEFAULT_ACCOUNTS['inventory'])

        # حساب تكلفة البضاعة
        total_cost = Decimal('0')
        for item in invoice.items.all():
            variant = item.product_variant
            if variant and hasattr(variant, 'cost_price') and variant.cost_price:
                total_cost += variant.cost_price * item.quantity

        if total_cost <= 0:
            logger.info("لا توجد تكلفة للبضاعة - تخطي قيد COGS")
            return None

        journal = GeneralJournal.objects.create(
            entry_date=invoice.created_at.date() if invoice.created_at else timezone.now().date(),
            entry_type='standard',
            source_type='sales_invoice',
            source_document=invoice.invoice_number,
            source_id=invoice.id,
            description=f"تكلفة البضاعة المباعة - فاتورة {invoice.invoice_number}",
        )

        JournalLine.objects.create(
            journal=journal,
            account=cogs_account,
            debit=total_cost,
            credit=0,
            description="تكلفة البضاعة المباعة",
        )

        JournalLine.objects.create(
            journal=journal,
            account=inventory_account,
            debit=0,
            credit=total_cost,
            description="تخفيض المخزون",
        )

        journal.validate_balance()
        journal.save()

        logger.info(f"تم إنشاء قيد تكلفة بضاعة: {journal.entry_number}")
        return journal
