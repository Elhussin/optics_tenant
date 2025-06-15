from django.core.management.base import BaseCommand
from django_tenants.utils import get_tenant_model, get_tenant_domain_model, schema_context
from django.contrib.auth import get_user_model
from django.core.management import call_command
import getpass
import datetime
import json
import os

class Command(BaseCommand):
    help = "Create a tenant, domain, run migrations, and optionally a superuser."

    def add_arguments(self, parser):
        # ملف إعدادات خارجي
        parser.add_argument('--config', type=str, help='Path to config JSON file')

        # بيانات التينانت
        parser.add_argument('--schema', type=str, help='Schema name for the tenant (e.g. tenant1)')
        parser.add_argument('--name', type=str, help='Name of the tenant (e.g. Solo Vizion)')
        parser.add_argument('--domain', type=str, help='Domain to associate with tenant (e.g. tenant1.localhost)')
        parser.add_argument('--paid_until', type=str, default='2030-12-31', help='Paid until date in YYYY-MM-DD')
        parser.add_argument('--trial', action='store_true', help='Set tenant as on trial')

        # بيانات الـ superuser
        parser.add_argument('--create_superuser', action='store_true', help='Create a superuser in this tenant')
        parser.add_argument('--username', type=str, help='Superuser username')
        parser.add_argument('--email', type=str, help='Superuser email')

    def handle(self, *args, **options):
        # إذا تم تمرير ملف إعدادات
        if options.get('config'):
            config_path = options['config']
            if not os.path.exists(config_path):
                self.stdout.write(self.style.ERROR(f"Error: Config file '{config_path}' does not exist."))
                return

            try:
                with open(config_path, 'r') as f:
                    config_data = json.load(f)
            except json.JSONDecodeError:
                self.stdout.write(self.style.ERROR(f"Error: Invalid JSON format in '{config_path}'"))
                return

            for tenant_data in config_data:
                self.create_tenant_from_config(tenant_data)
        else:
            # استخدام الحجج المباشرة
            self.create_tenant_from_config(options)

    def create_tenant_from_config(self, config):
        # إنشاء التينانت
        tenant_model = get_tenant_model()
        tenant = tenant_model(schema_name=config['schema'],
                            name=config['name'],
                            paid_until=datetime.datetime.strptime(config['paid_until'], '%Y-%m-%d').date(),
                            on_trial=config.get('trial', False))
        tenant.save()

        # إنشاء الدومين
        domain_model = get_tenant_domain_model()
        domain = domain_model(domain=config['domain'],
                            tenant=tenant,
                            is_primary=True)
        domain.save()

        # تشغيل الهجرات في السكيمة الجديدة
        with schema_context(tenant.schema_name):
            call_command('migrate')

        # إنشاء superuser إذا تم طلب ذلك
        if config.get('create_superuser', False):

            schema_name = config['schema']
            username = config['username']
            email = config['email']
            password = getpass.getpass(f"Enter password for superuser in {schema_name}: ")

            try:
                with schema_context(schema_name):
                    User = get_user_model()
                    if User.objects.filter(username=username).exists():
                        self.stdout.write(self.style.WARNING(
                            f"Superuser '{username}' already exists in schema '{schema_name}'."
                        ))
                        return

                    User.objects.create_superuser(username=username, email=email, password=password)

                    self.stdout.write(self.style.SUCCESS(
                        f"Superuser '{username}' created successfully in schema '{schema_name}'."
                    ))

            except Exception as e:
                raise CommandError(f"Failed to create superuser: {e}")

        self.stdout.write(self.style.SUCCESS(f"Successfully created tenant: {tenant.name}"))



# python manage.py create_multi_tenant --config=data/tenants_list.json