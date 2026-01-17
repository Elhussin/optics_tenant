# apps/core/management/commands/optimize_db.py
"""
أمر Django لتحسين قاعدة البيانات
"""

from django.core.management.base import BaseCommand
from django.db import connection
from django.apps import apps
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'تحسين قاعدة البيانات وإضافة الـ indexes المطلوبة'

    def add_arguments(self, parser):
        parser.add_argument(
            '--analyze',
            action='store_true',
            help='تحليل الجداول بعد إضافة الـ indexes'
        )
        parser.add_argument(
            '--vacuum',
            action='store_true',
            help='تنظيف قاعدة البيانات (PostgreSQL)'
        )

    def handle(self, *args, **options):
        self.stdout.write('🔧 بدء تحسين قاعدة البيانات...')

        # إضافة الـ indexes
        self.add_custom_indexes()

        # تحليل الجداول
        if options['analyze']:
            self.analyze_tables()

        # تنظيف PostgreSQL
        if options['vacuum']:
            self.vacuum_database()

        self.stdout.write(self.style.SUCCESS(
            '✅ تم تحسين قاعدة البيانات بنجاح'))

    def add_custom_indexes(self):
        """إضافة indexes مخصصة للاستعلامات الشائعة"""

        # قائمة الـ indexes المطلوبة
        custom_indexes = [
            # Orders - الاستعلامات الأكثر شيوعاً
            {
                'table': 'sales_order',
                'name': 'idx_order_branch_status',
                'columns': ['branch_id', 'status'],
            },
            {
                'table': 'sales_order',
                'name': 'idx_order_customer_created',
                'columns': ['customer_id', 'created_at'],
            },
            {
                'table': 'sales_order',
                'name': 'idx_order_type_status',
                'columns': ['order_type', 'status'],
            },
            {
                'table': 'sales_order',
                'name': 'idx_order_payment_status',
                'columns': ['payment_status', 'created_at'],
            },

            # Invoices
            {
                'table': 'sales_invoice',
                'name': 'idx_invoice_branch_status',
                'columns': ['branch_id', 'status'],
            },
            {
                'table': 'sales_invoice',
                'name': 'idx_invoice_customer_date',
                'columns': ['customer_id', 'created_at'],
            },

            # Payments
            {
                'table': 'sales_payment',
                'name': 'idx_payment_status_created',
                'columns': ['status', 'created_at'],
            },
            {
                'table': 'sales_payment',
                'name': 'idx_payment_method_status',
                'columns': ['payment_method', 'status'],
            },

            # Stock
            {
                'table': 'products_stock',
                'name': 'idx_stock_branch_variant',
                'columns': ['branch_id', 'variant_id'],
            },
            {
                'table': 'products_stock',
                'name': 'idx_stock_quantity',
                'columns': ['quantity'],
                'condition': 'quantity > 0',  # Partial index
            },

            # Customers
            {
                'table': 'crm_customer',
                'name': 'idx_customer_type_tier',
                'columns': ['customer_type', 'pricing_tier'],
            },
            {
                'table': 'crm_customer',
                'name': 'idx_customer_credit_status',
                'columns': ['credit_status'],
                'condition': "credit_status = 'approved'",
            },

            # Partners
            {
                'table': 'crm_partner',
                'name': 'idx_partner_type_active',
                'columns': ['partner_type', 'is_active'],
            },

            # Insurance Claims
            {
                'table': 'crm_insuranceclaim',
                'name': 'idx_claim_status_created',
                'columns': ['status', 'created_at'],
            },

            # Products
            {
                'table': 'products_productvariant',
                'name': 'idx_variant_product_active',
                'columns': ['product_id', 'is_active'],
            },

            # Accounting
            {
                'table': 'accounting_generaljournal',
                'name': 'idx_journal_posted_date',
                'columns': ['is_posted', 'entry_date'],
            },
            {
                'table': 'accounting_chartofaccounts',
                'name': 'idx_account_type_active',
                'columns': ['account_type', 'is_active'],
            },
        ]

        with connection.cursor() as cursor:
            for idx in custom_indexes:
                try:
                    columns = ', '.join(idx['columns'])

                    # تحقق من وجود الـ index
                    cursor.execute(f"""
                        SELECT 1 FROM pg_indexes 
                        WHERE indexname = '{idx['name']}'
                    """)

                    if cursor.fetchone():
                        self.stdout.write(
                            f"  ⏭️  Index {idx['name']} موجود مسبقاً")
                        continue

                    # إنشاء الـ index
                    if idx.get('condition'):
                        sql = f"""
                            CREATE INDEX CONCURRENTLY IF NOT EXISTS {idx['name']}
                            ON {idx['table']} ({columns})
                            WHERE {idx['condition']}
                        """
                    else:
                        sql = f"""
                            CREATE INDEX CONCURRENTLY IF NOT EXISTS {idx['name']}
                            ON {idx['table']} ({columns})
                        """

                    cursor.execute(sql)
                    self.stdout.write(f"  ✅ تم إنشاء index: {idx['name']}")

                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(
                            f"  ⚠️  خطأ في {idx['name']}: {str(e)}")
                    )

    def analyze_tables(self):
        """تحليل الجداول لتحديث الإحصائيات"""
        self.stdout.write('\n📊 تحليل الجداول...')

        tables = [
            'sales_order', 'sales_orderitem', 'sales_invoice', 'sales_invoiceitem',
            'sales_payment', 'products_stock', 'crm_customer', 'crm_partner',
            'products_productvariant', 'accounting_generaljournal',
        ]

        with connection.cursor() as cursor:
            for table in tables:
                try:
                    cursor.execute(f"ANALYZE {table}")
                    self.stdout.write(f"  ✅ تم تحليل: {table}")
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f"  ⚠️  خطأ في {table}: {str(e)}")
                    )

    def vacuum_database(self):
        """تنظيف قاعدة البيانات"""
        self.stdout.write('\n🧹 تنظيف قاعدة البيانات...')

        # VACUUM يحتاج autocommit
        old_autocommit = connection.connection.autocommit
        try:
            connection.connection.autocommit = True
            with connection.cursor() as cursor:
                cursor.execute("VACUUM ANALYZE")
            self.stdout.write('  ✅ تم تنظيف قاعدة البيانات')
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f"  ⚠️  خطأ في التنظيف: {str(e)}")
            )
        finally:
            connection.connection.autocommit = old_autocommit
