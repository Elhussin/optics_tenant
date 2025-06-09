import csv
import os
import sys
import django
from importlib import import_module
from django.apps import apps

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# إعداد بيئة Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "optics_tenant.settings")
django.setup()

# إذا كنت تستخدم django-tenants
from django_tenants.utils import schema_context

def import_csv_to_model(schema_name, app_label, model_name, csv_file_path):
    # الدخول إلى الـ schema المطلوب (إذا كان multi-tenant)
    with schema_context(schema_name):
        try:
            model = apps.get_model(app_label=app_label, model_name=model_name)
        except LookupError:
            print(f"Model {app_label}.{model_name} not found.")
            return

        with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            fields = [field.name for field in model._meta.get_fields() if field.concrete and not field.auto_created]

            for row in reader:
                data = {field: row[field] for field in fields if field in row}
                obj, created = model.objects.get_or_create(**data)
                print(f"{'Created' if created else 'Exists'}: {obj}")

if __name__ == "__main__":
    # مثال على الاستخدام
    import_csv_to_model(
        schema_name="store1",             # اسم الـ schema
        app_label="products",              # اسم التطبيق
        model_name="Attributes",              # اسم الموديل
        csv_file_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), "csv/Attributes.csv")       # مسار ملف CSV
    )

# python3 scripts/add_csv_data.py

# Attributes
# AttributeValue