# tenants/test_utils.py
from django.test import TransactionTestCase
from django_tenants.utils import schema_context, connection, get_tenant_model
from django.core.management import call_command
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class BaseTenantTestCase(TransactionTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.schema_name = f'test_{uuid.uuid4().hex[:8]}'
        with schema_context('public'):
            tenant_model = get_tenant_model()
            cls.tenant = tenant_model.objects.create(
                schema_name=cls.schema_name,
                name='Test Tenant',
                paid_until='2099-01-01',
                on_trial=True
            )
            cls.tenant.save()
            from apps.tenants.models import Domain
            domain_obj = Domain.objects.filter(domain='testserver').first()
            if domain_obj:
                domain_obj.tenant = cls.tenant
                domain_obj.save()
                cls.domain = domain_obj
            else:
                cls.domain = Domain.objects.create(
                    domain='testserver',
                    tenant=cls.tenant,
                    is_primary=True
                )
            cls.tenant.create_schema(check_if_exists=True)
            call_command('migrate_schemas', schema_name=cls.schema_name, interactive=False, run_syncdb=True)

    def setUp(self):
        connection.set_tenant(self.tenant)
        self.user = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass"
        )

    def tearDown(self):
        with schema_context(self.schema_name):
            from django.apps import apps
            for app_label in ['prescriptions', 'crm', 'products', 'users']:
                try:
                    app_config = apps.get_app_config(app_label)
                    for model in app_config.get_models():
                        try:
                            model.objects.all().delete()
                        except Exception:
                            pass
                except Exception:
                    pass
        super().tearDown()

    @classmethod
    def tearDownClass(cls):
        connection.set_schema_to_public()
        with connection.cursor() as cursor:
            cursor.execute(f'DROP SCHEMA IF EXISTS "{cls.schema_name}" CASCADE')
        cls.tenant.delete()
        super().tearDownClass()
