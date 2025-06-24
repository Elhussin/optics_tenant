from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CSVImportSerializer
from django.apps import apps
from django_tenants.utils import schema_context
import csv
import io


class CSVImportView(APIView):
    
    def post(self, request):
        serializer = CSVImportSerializer(data=request.data)
        if serializer.is_valid():
            csv_file = serializer.validated_data['csv_file']
            config = serializer.validated_data['config']

            schema = config['schema']
            app_label = config['app']
            model_name = config['model']
            foreign_keys = config.get('foreign_keys', {})

            with schema_context(schema):
                try:
                    model = apps.get_model(app_label=app_label, model_name=model_name)
                except LookupError:
                    return Response({"error": "Model not found."}, status=400)

                model_fields = {
                    f.name: f for f in model._meta.get_fields()
                    if f.concrete and not f.auto_created
                }

                reader = csv.DictReader(io.StringIO(csv_file.read().decode('utf-8')))
                created = 0
                failed = 0
                errors = []

                for i, row in enumerate(reader, start=2):
                    instance_data = {}

                    for field_name, field in model_fields.items():
                        if field_name not in row or not row[field_name]:
                            continue

                        if field_name in foreign_keys:
                            rel_conf = foreign_keys[field_name]
                            rel_model = apps.get_model(rel_conf['related_model'])
                            lookup_field = rel_conf['lookup_field']
                            create_if_missing = rel_conf.get("create_if_missing", False)

                            try:
                                rel_obj = rel_model.objects.get(**{lookup_field: row[field_name]})
                            except rel_model.DoesNotExist:
                                if create_if_missing:
                                    rel_obj = rel_model.objects.create(**{lookup_field: row[field_name]})
                                else:
                                    errors.append(f"⚠️ Line {i}: {field_name} '{row[field_name]}' not found.")
                                    failed += 1
                                    break
                            instance_data[field_name] = rel_obj
                        else:
                            instance_data[field_name] = row[field_name]

                    try:
                        model.objects.get_or_create(**instance_data)
                        created += 1
                    except Exception as e:
                        failed += 1
                        errors.append(f"❌ Line {i}: {str(e)}")

                return Response({
                    "created": created,
                    "failed": failed,
                    "errors": errors
                })

        return Response(serializer.errors, status=400)
