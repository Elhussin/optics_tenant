from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
from django.utils.text import slugify
from django_tenants.utils import get_tenant_model, get_tenant_domain_model, schema_context
from core.utils.tenant_seeding import seed_tenant_data


class Command(BaseCommand):
    help = "Initialize a tenant (Public or Store), run migrations, and seed data."

    def add_arguments(self, parser):
        parser.add_argument('--name', type=str, required=True,
                            help='Name of the tenant')
        parser.add_argument('--schema', type=str, default='public',
                            help='Schema name (defaults to public)')
        parser.add_argument(
            '--domain', type=str, help='Domain name (e.g., localhost or store1.beta.cloud)')
        parser.add_argument(
            '--email', type=str, default='admin@optics.com', help='Email for the admin user')
        parser.add_argument('--username', type=str,
                            default='admin', help='Username for the admin user')
        parser.add_argument('--password', type=str,
                            help='Password for the admin user')
        parser.add_argument('--paid_until', type=str,
                            default='2030-12-31', help='Paid until date')

    def handle(self, *args, **options):
        TenantModel = get_tenant_model()
        DomainModel = get_tenant_domain_model()

        name = options['name']
        schema_name = options['schema']
        domain_name = options['domain']
        email = options['email']
        username = options['username']
        password = options['password']
        paid_until = options['paid_until']

        if not domain_name:
            if schema_name == 'public':
                domain_name = 'localhost'
            else:
                domain_name = f"{slugify(schema_name)}.{settings.TENANT_BASE_DOMAIN}"

        self.stdout.write(self.style.NOTICE(
            f"🚀 Starting setup for tenant: {name} (Schema: {schema_name})"))

        # 1. Create Tenant
        tenant, created = TenantModel.objects.get_or_create(
            schema_name=schema_name,
            defaults={
                'name': name,
                'paid_until': paid_until,
                'on_trial': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(
                f"✅ Tenant '{name}' created."))
            # Manually create schema since auto_create_schema=False
            self.stdout.write(f"Creating database schema for {schema_name}...")
            tenant.create_schema(check_if_exists=True, verbosity=1)
        else:
            self.stdout.write(self.style.WARNING(
                f"ℹ️ Tenant '{name}' already exists."))

        # 2. Assign Domain
        domain, d_created = DomainModel.objects.get_or_create(
            domain=domain_name,
            defaults={
                'tenant': tenant,
                'is_primary': True
            }
        )
        if d_created:
            self.stdout.write(self.style.SUCCESS(
                f"✅ Domain '{domain_name}' assigned."))

        # 3. Run Migrations
        self.stdout.write("Running migrations...")
        if schema_name == 'public':
            call_command('migrate_all_tenants')
        else:
            # For a single tenant, we can use migrate with schema name if supported,
            # but migrate_all_tenants usually handles everything.
            call_command('migrate_all_tenants')

        # 4. Seed Data & Create Admin inside schema context
        with schema_context(schema_name):
            self.stdout.write(f"Seeding data for schema: {schema_name}...")

            # Sync CSV data
            call_command('import_csv_with_foreign',
                         config='data/csv_configotenant.json',
                         schema=schema_name)

            # Seed Roles, Permissions, and Payment Methods
            owner_role = seed_tenant_data(stdout=self.stdout)

            # Create Admin User using our updated command
            call_command('create_tenant_admin',
                         schema_name=schema_name,
                         username=username,
                         email=email,
                         password=password,
                         role_ids=str(owner_role.id),
                         client_id=str(tenant.id)
                         )

        self.stdout.write(self.style.SUCCESS(f"🏁 Setup complete for {name}!"))
        self.stdout.write(f"🔗 Domain: http://{domain_name}:8000")



#  pdm run python manage.py setup_tenant --name "Public Site" --schema public --domain localhost --password "3112"

#  pdm run python manage.py setup_tenant --name "Store 6" --schema store6 --domain store6.localhost --password "3112"