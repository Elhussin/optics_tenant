# apps/crm/migrations/0005_add_performance_indexes.py

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0004_add_wholesale_support'),
    ]

    operations = [
        # Customer indexes
        migrations.AddIndex(
            model_name='customer',
            index=models.Index(
                fields=['customer_type', 'pricing_tier'],
                name='idx_customer_type_tier'
            ),
        ),
        migrations.AddIndex(
            model_name='customer',
            index=models.Index(
                fields=['credit_status'],
                name='idx_customer_credit_status'
            ),
        ),
        migrations.AddIndex(
            model_name='customer',
            index=models.Index(
                fields=['phone'],
                name='idx_customer_phone'
            ),
        ),
        migrations.AddIndex(
            model_name='customer',
            index=models.Index(
                fields=['first_name', 'last_name'],
                name='idx_customer_name'
            ),
        ),

        # Partner indexes
        migrations.AddIndex(
            model_name='partner',
            index=models.Index(
                fields=['partner_type', 'is_active'],
                name='idx_partner_type_active'
            ),
        ),

        # Insurance Claim indexes
        migrations.AddIndex(
            model_name='insuranceclaim',
            index=models.Index(
                fields=['status', 'created_at'],
                name='idx_claim_status_date'
            ),
        ),
        migrations.AddIndex(
            model_name='insuranceclaim',
            index=models.Index(
                fields=['partner', 'status'],
                name='idx_claim_partner_status'
            ),
        ),

        # CustomerPartnerLink indexes
        migrations.AddIndex(
            model_name='customerpartnerlink',
            index=models.Index(
                fields=['customer', 'partner', 'is_active'],
                name='idx_link_customer_partner'
            ),
        ),
    ]
