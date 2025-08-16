from django.core.management import call_command
from django.core.management.base import BaseCommand
from django_tenants.utils import schema_context
from tenants.models import Client  # نموذج المستأجر الخاص بك

from django.core.management import call_command
from django.core.management.base import BaseCommand
from django_tenants.utils import schema_context
from tenants.models import Client

class Command(BaseCommand):
    help = 'Migrate Wagtail apps to tenant schemas'

    def add_arguments(self, parser):
        parser.add_argument(
            '--schema',
            type=str,
            help='Specify a tenant schema to migrate (optional). If not provided, migrates all tenants.'
        )

    def handle(self, *args, **options):
        wagtail_apps = [
            'wagtailforms',
            'wagtailredirects',
            'wagtailembeds',
            'wagtailusers',
            'wagtaildocs',
            'wagtailimages',
            'wagtailsearch',
            'wagtailadmin',
            'wagtailcore',
            'wagtail.api',  # Corrected app label
            'wagtail_localize',
            'cms',
        ]

        schema_name = options.get('schema')
        success = True

        if schema_name:
            try:
                tenant = Client.objects.get(schema_name=schema_name)
                self.stdout.write(f"Migrating Wagtail apps for tenant: {tenant.schema_name}")
                with schema_context(tenant.schema_name):
                    for app in wagtail_apps:
                        self.stdout.write(f"Applying migrations for {app} in schema {tenant.schema_name}")
                        try:
                            call_command('migrate', app)
                        except Exception as e:
                            self.stderr.write(f"Error migrating {app} for {tenant.schema_name}: {str(e)}")
                            success = False
                if success:
                    self.stdout.write(self.style.SUCCESS(f"Successfully migrated Wagtail apps for {tenant.schema_name}"))
                else:
                    self.stderr.write(self.style.ERROR(f"Failed to migrate some apps for {tenant.schema_name}"))
            except Client.DoesNotExist:
                self.stderr.write(self.style.ERROR(f"Tenant with schema {schema_name} does not exist"))
        else:
            tenants = Client.objects.all()
            for tenant in tenants:
                success = True
                self.stdout.write(f"Migrating Wagtail apps for tenant: {tenant.schema_name}")
                with schema_context(tenant.schema_name):
                    for app in wagtail_apps:
                        self.stdout.write(f"Applying migrations for {app} in schema {tenant.schema_name}")
                        try:
                            call_command('migrate', app)
                        except Exception as e:
                            self.stderr.write(f"Error migrating {app} for {tenant.schema_name}: {str(e)}")
                            success = False
                if success:
                    self.stdout.write(self.style.SUCCESS(f"Successfully migrated Wagtail apps for {tenant.schema_name}"))
                else:
                    self.stderr.write(self.style.ERROR(f"Failed to migrate some apps for {tenant.schema_name}"))