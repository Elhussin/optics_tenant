import getpass
from django.core.management.base import BaseCommand, CommandError
from django_tenants.utils import schema_context
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Create a superuser for a specific tenant schema'

    def add_arguments(self, parser):
        parser.add_argument('--schema_name', '-s', type=str, required=True, help='Tenant schema name')
        parser.add_argument('--username', type=str, required=True, help='Username for the superuser')
        parser.add_argument('--email', type=str, required=True, help='Email for the superuser')
        parser.add_argument('--password', type=str, help='Password for the superuser (optional)')

    def handle(self, *args, **options):
        schema_name = options['schema_name']
        username = options['username']
        email = options['email']
        password = options.get('password')

        # اطلب كلمة المرور بشكل آمن إذا لم تُمرر من الطرفية
        if not password:
            password = getpass.getpass('Password: ')
            password2 = getpass.getpass('Confirm Password: ')
            if password != password2:
                raise CommandError("Passwords do not match.")

        try:
            with schema_context(schema_name):
                User = get_user_model()
                if User.objects.filter(username=username).exists():
                    self.stdout.write(self.style.WARNING(
                        f"Superuser '{username}' already exists in schema '{schema_name}'."
                    ))
                    return

                User.objects.create_superuser(username=username, email=email, password=password,client_id=config['client_id'])

                self.stdout.write(self.style.SUCCESS(
                    f"Superuser '{username}' created successfully in schema '{schema_name}'."
                ))

        except Exception as e:
            raise CommandError(f"Failed to create superuser: {e}")

# python manage.py create_tenant_superuser --schema_name store1 --username store1 --email admin1@store1.com

# python manage.py create_tenant_superuser --schema_name public --username admin --email admin@public.com