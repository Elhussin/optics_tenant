# apps/sales/migrations/0004_add_performance_indexes.py

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0003_add_payment_and_installment_models'),
    ]

    operations = [
        # Order indexes
        migrations.AddIndex(
            model_name='order',
            index=models.Index(
                fields=['branch', 'status'],
                name='idx_order_branch_status'
            ),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(
                fields=['customer', 'created_at'],
                name='idx_order_customer_date'
            ),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(
                fields=['order_type', 'status'],
                name='idx_order_type_status'
            ),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(
                fields=['payment_status', 'created_at'],
                name='idx_order_payment_date'
            ),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(
                fields=['partner', 'status'],
                name='idx_order_partner_status'
            ),
        ),

        # Invoice indexes
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(
                fields=['branch', 'status'],
                name='idx_invoice_branch_status'
            ),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(
                fields=['customer', 'created_at'],
                name='idx_invoice_customer_date'
            ),
        ),

        # Payment indexes
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(
                fields=['status', 'created_at'],
                name='idx_payment_status_date'
            ),
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(
                fields=['payment_method', 'status'],
                name='idx_payment_method_status'
            ),
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(
                fields=['invoice', 'status'],
                name='idx_payment_invoice_status'
            ),
        ),

        # Installment indexes
        migrations.AddIndex(
            model_name='installment',
            index=models.Index(
                fields=['status', 'due_date'],
                name='idx_installment_status_due'
            ),
        ),
    ]
