import csv
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django_tenants.utils import get_tenant_model, schema_context

from apps.users.models import Permission


class Command(BaseCommand):
    help = 'Add missing permission codes to one existing tenant; never grant roles.'

    def add_arguments(self, parser):
        parser.add_argument('--schema', required=True)

    def handle(self, *args, **options):
        schema = options['schema']
        if not get_tenant_model().objects.filter(schema_name=schema).exists():
            raise CommandError('Unknown tenant schema.')
        catalog = Path(__file__).resolve().parents[3] / 'data' / 'csv' / 'Permission.csv'
        with catalog.open(encoding='utf-8-sig', newline='') as source:
            rows = list(csv.DictReader(source))
        created = 0
        with schema_context(schema), transaction.atomic():
            for row in rows:
                code = row.get('code', '').strip()
                if not code:
                    continue
                _, added = Permission.objects.get_or_create(
                    code=code, defaults={'description': row.get('description', '')})
                created += int(added)
        self.stdout.write(self.style.SUCCESS(f'Added {created} permission codes. Role grants unchanged.'))
