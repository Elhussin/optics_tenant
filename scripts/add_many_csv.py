import csv
import os
import json
import django
from django.apps import apps

# إعداد Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "optics_tenant.settings")
django.setup()

# إذا كنت تستخدم django-tenants
from django_tenants.utils import schema_context

def import_csv_to_model(schema_name, app_label, model_name, csv_file_path):
    print(f"\n🔄 Importing: {csv_file_path} ➜ {schema_name}.{app_label}.{model_name}")
                                                                    
    with schema_context(schema_name):
        try:
            model = apps.get_model(app_label=app_label, model_name=model_name)
        except LookupError:
            print(f"❌ Model {app_label}.{model_name} not found.")
            return

        with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            fields = [field.name for field in model._meta.get_fields() if field.concrete and not field.auto_created]

            for row in reader:
                data = {field: row[field] for field in fields if field in row}
                obj, created = model.objects.get_or_create(**data)
                print(f"{'✅ Created' if created else '🔁 Exists'}: {obj}")

def run_batch_import(config_path):
    with open(config_path, 'r', encoding='utf-8') as f:
        config_list = json.load(f)
    
    for config in config_list:
        import_csv_to_model(
            schema_name=config["schema"],
            app_label=config["app"],
            model_name=config["model"],
            csv_file_path=config["csv"]
        )

if __name__ == "__main__":
    # تمرير مسار ملف الإعدادات
    run_batch_import("csv/csv_config.json")
