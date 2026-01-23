import getpass
from django.core.management.base import BaseCommand, CommandError
from django_tenants.utils import schema_context
from django.contrib.auth import get_user_model
from apps.tenants.models import Client
from apps.users.models import Role, User


class Command(BaseCommand):
    help = 'Create an admin user for a specific tenant schema'

    def add_arguments(self, parser):
        parser.add_argument('--schema_name', '-s', type=str,
                            required=True, help='Tenant schema name')
        parser.add_argument('--username', type=str,
                            required=True, help='Username for the superuser')
        parser.add_argument('--email', type=str, required=True,
                            help='Email for the superuser')
        parser.add_argument('--password', type=str,
                            help='Password for the superuser ')
        parser.add_argument('--role_ids', type=str, required=True,
                            help='Comma-separated Role IDs for the superuser')
        parser.add_argument('--client_id', type=str,
                            required=True, help='Client ID for the superuser')

    def handle(self, *args, **options):
        schema_name = options['schema_name']
        username = options['username']
        email = options['email']
        password = options.get('password')
        role_ids_str = options.get('role_ids')
        client_id = options.get('client_id')

        if not role_ids_str or role_ids_str.strip() == "":
            raise CommandError(
                "Role IDs are required. Please provide at least one valid role ID.")

        if not client_id or client_id.strip() == "":
            raise CommandError(
                "Client ID is required. Please provide a valid client ID.")

        if not password:
            password = getpass.getpass('Password: ')
            password2 = getpass.getpass('Confirm Password: ')
            if password != password2:
                raise CommandError("Passwords do not match.")

        try:
            with schema_context(schema_name):
                User = get_user_model()

                # Split role IDs
                role_ids = [rid.strip()
                            for rid in role_ids_str.split(',') if rid.strip()]

                user, created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'email': email,
                        'client_id': client_id,
                        'is_superuser': True,
                        'is_staff': True,
                        'is_active': True
                    }
                )

                # Assign roles (ManyToMany)
                user.roles.set(role_ids)

                if created:
                    user.set_password(password)
                    user.save()
                    self.stdout.write(self.style.SUCCESS(
                        f"Superuser '{username}' created successfully in schema '{schema_name}' with {len(role_ids)} roles."
                    ))
                else:
                    user.save()  # Update if user already exists
                    self.stdout.write(self.style.WARNING(
                        f"Superuser '{username}' updated in schema '{schema_name}'."
                    ))

        except Exception as e:
            raise CommandError(f"Failed to create superuser: {e}")

        except Exception as e:
            raise CommandError(f"Failed to create superuser: {e}")
# python manage.py create_tenant_admin --schema_name public --username admin2 --email admin2@mail.com --role_id <ID> --client_id <ID>
