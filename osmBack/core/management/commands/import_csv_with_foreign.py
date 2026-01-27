import csv
import os
import json
from django.core.management.base import BaseCommand, CommandError
from django.apps import apps
from django_tenants.utils import schema_context


class Command(BaseCommand):
    help = 'Batch import CSV files with support for ForeignKeys in tenant schemas.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--config',
            type=str,
            required=True,
            help='Path to JSON config file specifying models and CSV files',
        )
        parser.add_argument(
            '--schema',
            type=str,
            required=False,
            help='Optional schema_name argument for custom use',
        )

    def handle(self, *args, **options):
        config_path = options['config']
        schema_name = options.get('schema')
        print(f"Using config file: {config_path}")
        print(f"Schema name: {schema_name}")

        if not os.path.exists(os.path.abspath(config_path)):
            raise CommandError(f"Config file does not exist: {config_path}")

        with open(os.path.abspath(config_path), 'r', encoding='utf-8') as f:
            config_list = json.load(f)

        for config in config_list:
            if schema_name:
                config["schema"] = schema_name

            # Use local variable for schema to allow per-config override if not globally set
            current_schema = schema_name or config.get("schema", "public")

            app_label = config["app"]
            model_name = config["model"]
            csv_file_path = os.path.join(
                os.path.dirname(config_path), config["csv"])
            foreign_keys = config.get("foreign_keys", {})
            row_filter = config.get("row_filter", {})

            self.import_csv_to_model(
                current_schema, app_label, model_name, csv_file_path, foreign_keys, row_filter)

    def import_csv_to_model(self, schema_name, app_label, model_name, csv_file_path, foreign_keys, row_filter=None):
        self.stdout.write(
            f"\n[INFO] Importing: {csv_file_path} -> {schema_name}.{app_label}.{model_name}")

        with schema_context(schema_name):
            try:
                model = apps.get_model(
                    app_label=app_label, model_name=model_name)
            except LookupError:
                self.stderr.write(
                    f"[ERROR] Model {app_label}.{model_name} not found.")
                return

            created_count = 0
            skipped_count = 0
            failed_rows = []

            with open(os.path.abspath(csv_file_path), newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                model_fields = {
                    field.name: field
                    for field in model._meta.get_fields()
                    if field.concrete and not field.auto_created
                }

                for row_num, row in enumerate(reader, start=2):
                    # 1. Apply Row Filters
                    if row_filter:
                        filter_match = True
                        for k, v in row_filter.items():
                            if str(row.get(k, '')).strip() != str(v):
                                filter_match = False
                                break
                        if not filter_match:
                            # Skip row silently (it's for another model)
                            continue

                    data = {}
                    mtm_data = {}
                    skip_row = False

                    # 2. Iterate Model Fields
                    for field_name, field in model_fields.items():

                        # Handle ForeignKey (Many-to-One)
                        if field.is_relation and field.many_to_one:
                            fk_config = foreign_keys.get(field_name, {})

                            # Determine lookup fields
                            lookup_fields = fk_config.get("lookup_fields", {})
                            simple_lookup_field = fk_config.get(
                                "lookup_field", "id")
                            fixed_filters = fk_config.get("fixed_filters", {})
                            create_if_missing = fk_config.get(
                                "create_if_missing", False)
                            create_fields_map = fk_config.get(
                                "create_fields", {})

                            # Determine if we should process this FK
                            # If no lookup info is provided, maybe we rely on simple ID?
                            # Or if the column is missing in row, skip?

                            lookup_kwargs = {}

                            # A. Build Lookup Args
                            # 1. Fixed Filters
                            for k, v in fixed_filters.items():
                                lookup_kwargs[k] = v

                            # 2. Dynamic Lookups
                            if lookup_fields:
                                # Multi-field lookup: related_field_name -> csv_column_name
                                found_all_keys = True
                                for rel_field, csv_col in lookup_fields.items():
                                    val = row.get(csv_col)
                                    if not val:
                                        found_all_keys = False
                                        break
                                    lookup_kwargs[rel_field] = val.strip()

                                if not found_all_keys:
                                    # If critical keys missing, maybe skip field?
                                    if not field.blank and not field.null:
                                        # Required field missing
                                        pass
                                    continue
                            elif field_name in row:
                                # Simple lookup using single field (backward compatibility)
                                val = row[field_name]
                                if val:
                                    lookup_kwargs[simple_lookup_field] = val.strip(
                                    )

                            if not lookup_kwargs and field.name not in fixed_filters:
                                # No data to find relation
                                continue

                            rel_model = field.related_model

                            try:
                                rel_obj = rel_model.objects.get(
                                    **lookup_kwargs)
                                data[field.name] = rel_obj
                            except rel_model.DoesNotExist:
                                if create_if_missing:
                                    try:
                                        create_kwargs = lookup_kwargs.copy()
                                        # Add extra create fields
                                        for create_field, csv_col in create_fields_map.items():
                                            if csv_col in row:
                                                create_kwargs[create_field] = row[csv_col]

                                        rel_obj = rel_model.objects.create(
                                            **create_kwargs)
                                        self.stdout.write(
                                            f"[NEW] Created {rel_model.__name__}: {rel_obj}")
                                        data[field.name] = rel_obj
                                    except Exception as e:
                                        self.stderr.write(
                                            f"[ERROR] Failed to create {rel_model.__name__}: {e}")
                                        skip_row = True
                                        break
                                else:
                                    # If field is nullable, we can skip it, else row fails
                                    if field.null:
                                        pass
                                    else:
                                        self.stderr.write(
                                            f"[WARN] Row {row_num}: FK {field_name} not found with {lookup_kwargs}")
                                        skip_row = True
                                        break
                            except rel_model.MultipleObjectsReturned:
                                self.stderr.write(
                                    f"[WARN] Row {row_num}: Multiple objects returned for {field_name} with {lookup_kwargs}")
                                skip_row = True
                                break

                        # Handle Many-to-Many fields
                        elif field.is_relation and field.many_to_many:
                            # (Keep existing MTM logic, but check if field in row)
                            if field_name in row and row[field_name]:
                                mtm_config = foreign_keys.get(field_name, {})
                                mtm_data[field_name] = {
                                    'values': [v.strip() for v in row[field_name].split(',')],
                                    'lookup_field': mtm_config.get("lookup_field", "id"),
                                    'model': field.related_model
                                }

                        # Handle Regular Fields
                        else:
                            if field_name in row:
                                val = row[field_name]
                                # Handle empty strings for non-string fields?
                                if val == "" and (field.null or field.blank):
                                    continue
                                data[field_name] = val

                    if skip_row:
                        skipped_count += 1
                        continue

                    if not data:
                        # self.stderr.write(f"[WARN] Row {row_num}: No data found, skipping.")
                        skipped_count += 1
                        continue

                    try:
                        # Use update_or_create logic if possible?
                        # Or just get_or_create.
                        # Ideally, if we have unique identifiers.

                        # Note: Simple get_or_create might duplicate if non-unique fields differ.
                        # But for import, let's stick to get_or_create or just update_or_create based on specific keys?
                        # For now, stick to get_or_create as per original script.

                        obj, created = model.objects.get_or_create(**data)

                        # Handle MTM
                        if mtm_data:
                            for mtm_field, config in mtm_data.items():
                                rel_model = config['model']
                                lookup_field = config['lookup_field']
                                values = config['values']

                                rel_objs = rel_model.objects.filter(
                                    **{f"{lookup_field}__in": values})
                                getattr(obj, mtm_field).set(rel_objs)

                        if created:
                            self.stdout.write(f"[OK] Created: {obj}")
                            created_count += 1
                        else:
                            # self.stdout.write(f"[SKIP] Exists: {obj}")
                            skipped_count += 1
                    except Exception as e:
                        self.stderr.write(
                            f"[ERROR] Error on row {row_num}: {e}")
                        failed_rows.append(row_num)

            self.stdout.write(
                f"\n[SUMMARY] For {model_name} in schema {schema_name}:")
            self.stdout.write(f"[OK] Created: {created_count}")
            self.stdout.write(
                f"[SKIP] Skipped (Exists, Filtered or Errors): {skipped_count}")
            if failed_rows:
                self.stderr.write(f"[ERROR] Failed Rows: {failed_rows}")


#
# python manage.py import_csv_with_foreign --config data/csv_configo0.json --schema store1
# pdm run python manage.py import_csv_with_foreign --config data/csv_configotenant.json --schema store3


# pdm run python manage.py import_csv_with_foreign --config data/csv_configotenant.json --schema public
