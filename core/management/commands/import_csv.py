import os
import csv
import json
from django.core.management.base import BaseCommand
from django.apps import apps
from django_tenants.utils import schema_context


class Command(BaseCommand):
    help = "استيراد بيانات من CSV حسب إعدادات JSON"

    def add_arguments(self, parser):
        parser.add_argument('--config', type=str, help="Path to the JSON configuration file")
        parser.add_argument('--dry-run', action='store_true', help="Validate CSV files without importing")
        parser.add_argument('--report', action='store_true', help="Display report after import")

    def handle(self, *args, **options):
        # config_path = options['config']
        config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),  options['config']) 
        print(config_path)
        dry_run = options['dry_run']
        show_report = options['report']

        if not config_path or not os.path.exists(config_path):
            self.stderr.write("config path not found")
            return

        with open(config_path, 'r', encoding='utf-8') as f:
            configs = json.load(f)

        report = []

        for config in configs:
            schema = config['schema']
            app_label = config['app']
            model_name = config['model']
            # csv_path = config['csv']
            csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), config['csv'])
            foreign_keys = config.get('foreign_keys', {})

            self.stdout.write(f"\n📥 [{schema}] import {model_name} from {csv_path}")

            with schema_context(schema):
                try:
                    model = apps.get_model(app_label=app_label, model_name=model_name)
                except LookupError:
                    self.stderr.write(f"model not found: {app_label}.{model_name}")
                    continue

                model_fields = {
                    f.name: f for f in model._meta.get_fields()
                    if f.concrete and not f.auto_created
                }

                created_count = 0
                skipped_count = 0
                failed_rows = []

                with open(csv_path, newline='', encoding='utf-8') as csvfile:
                    reader = csv.DictReader(csvfile)
                    for row_num, row in enumerate(reader, start=2):  # 2 because of header
                        instance_data = {}

                        for field_name, field in model_fields.items():
                            if field_name not in row or not row[field_name]:
                                continue

                            if field_name in foreign_keys:
                                rel_conf = foreign_keys[field_name]
                                rel_model = apps.get_model(rel_conf['related_model'])
                                lookup_field = rel_conf['lookup_field']
                                try:
                                    rel_obj = rel_model.objects.get(**{lookup_field: row[field_name]})
                                    instance_data[field_name] = rel_obj
                                except rel_model.DoesNotExist:
                                    self.stderr.write(f"foreign key not found: {app_label}.{model_name}")
                                    failed_rows.append(row_num)
                                    break
                            else:
                                instance_data[field_name] = row[field_name]

                        try:
                            if not dry_run:
                                obj, created = model.objects.get_or_create(**instance_data)
                                if created:
                                    created_count += 1
                                else:
                                    skipped_count += 1
                        except Exception as e:
                            self.stderr.write(f"error in row {row_num}: {e}")
                            failed_rows.append(row_num)

                if show_report:
                    self.stdout.write(f"✅ created: {created_count}")
                    self.stdout.write(f"🔁 skipped: {skipped_count}")
                    self.stdout.write(f"❌ failed: {len(failed_rows)} - rows: {failed_rows}")


# python manage.py import_csv --config 'import_config.json.json' --dry-run
# optics_tenant/scripts/csv/csv_config.json