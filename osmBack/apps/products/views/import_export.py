from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.parsers import MultiPartParser
from django.conf import settings
from django.apps import apps
from django_tenants.utils import schema_context
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, inline_serializer
import csv
import io
import json
import os
import logging

logger = logging.getLogger(__name__)

# Hardcoded path relative to Django root or use BASE_DIR
CONFIG_FILE_PATH = os.path.join(
    settings.BASE_DIR, 'data', 'csv_configotenant.json')


class ProductImportView(APIView):
    """
    API View dedicated to importing products only.
    Relies mandatorily on 'products.Product' settings in 'csv_configotenant.json'.
    """
    parser_classes = [MultiPartParser]

    @extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {
                        'type': 'string',
                        'format': 'binary'
                    }
                },
                'required': ['file']
            }
        },
        responses={
            200: inline_serializer(
                name='ProductImportSuccessResponse',
                fields={
                    'message': serializers.CharField(),
                    'summary': inline_serializer(
                        name='ProductImportSummary',
                        fields={
                            'created': serializers.IntegerField(),
                            'updated_or_skipped': serializers.IntegerField(),
                            'failed': serializers.IntegerField(),
                        }
                    ),
                    'errors': serializers.ListField(child=serializers.CharField())
                }
            ),
            400: inline_serializer(
                name='ProductImportBadRequest',
                fields={'error': serializers.CharField()}
            ),
            500: inline_serializer(
                name='ProductImportServerError',
                fields={'detail': serializers.CharField()}
            ),
        },
        description="Import products from CSV file using server-side configuration"
    )
    def post(self, request, *args, **kwargs):
        # 1. Check for file existence
        if 'file' not in request.FILES:
            return Response({"detail": _("No file uploaded. Key must be 'file'.")}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']

        # 2. Load mandatory config file
        if not os.path.exists(CONFIG_FILE_PATH):
            logger.error(f"Config file not found at: {CONFIG_FILE_PATH}")
            return Response({"detail": _("Server configuration error: Config file missing.")}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            with open(CONFIG_FILE_PATH, 'r', encoding='utf-8') as f:
                full_config = json.load(f)
        except json.JSONDecodeError:
            logger.error("Failed to decode JSON config file.")
            return Response({"detail": _("Server configuration error: Invalid JSON config.")}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 3. Extract product settings only
        product_config = next((item for item in full_config if item.get(
            'model') == 'Product' and item.get('app') == 'products'), None)

        if not product_config:
            logger.error(
                "Product configuration not found in csv_configotenant.json")
            return Response({"detail": _("Server configuration error: Product config missing.")}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        foreign_keys = product_config.get('foreign_keys', {})

        # 4. Determine Schema (for current user)
        schema_name = "public"
        # assuming user has a client related to tenant
        if hasattr(request.user, 'client') and request.user.client:
            schema_name = request.user.client.schema_name

        # If you want to allow passing schema in request (for testing purposes only), uncomment:
        # schema_name = request.data.get('schema', schema_name)

        created_count = 0
        skipped_count = 0
        failed_count = 0
        errors = []

        # 5. Process File
        try:
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
        except Exception as e:
            return Response({"detail": _("Failed to read CSV file: {0}").format(str(e))}, status=status.HTTP_400_BAD_REQUEST)

        model_name = "Product"
        app_label = "products"

        with schema_context(schema_name):
            try:
                ProductModel = apps.get_model(app_label, model_name)
            except LookupError:
                return Response({"detail": _("Model {0} not found.").format(model_name)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            model_fields = {f.name: f for f in ProductModel._meta.get_fields(
            ) if f.concrete and not f.auto_created}

            for i, row in enumerate(reader, start=2):  # Start at 2 for header
                data = {}
                skip_row = False

                # Clean data (remove extra spaces)
                row = {k: v.strip() if v else v for k, v in row.items()}

                for field_name, field in model_fields.items():
                    # Skip fields not present in CSV
                    if field_name not in row or not row[field_name]:
                        continue

                    # Handle Relationships (Foreign Keys)
                    if field_name in foreign_keys:
                        fk_conf = foreign_keys[field_name]
                        # e.g. "products.Brand"
                        fk_model_str = fk_conf['related_model']
                        lookup_field = fk_conf.get('lookup_field', 'name')
                        create_if_missing = fk_conf.get(
                            'create_if_missing', False)

                        try:
                            fk_app, fk_model_name = fk_model_str.split('.')
                            FKModel = apps.get_model(fk_app, fk_model_name)
                        except (ValueError, LookupError):
                            errors.append(
                                str(_("Row {0}: Config Error - Related model {1} not found.").format(i, fk_model_str)))
                            failed_count += 1
                            skip_row = True
                            break

                        lookup_value = row[field_name]

                        try:
                            # Try to find related object
                            rel_obj = FKModel.objects.get(
                                **{lookup_field: lookup_value})
                            data[field_name] = rel_obj
                        except FKModel.DoesNotExist:
                            if create_if_missing:
                                try:
                                    rel_obj = FKModel.objects.create(
                                        **{lookup_field: lookup_value})
                                    data[field_name] = rel_obj
                                except Exception as e:
                                    errors.append(
                                        str(_("Row {0}: Failed to create new {1} '{2}': {3}").format(i, fk_model_name, lookup_value, str(e))))
                                    failed_count += 1
                                    skip_row = True
                                    break
                            else:
                                errors.append(
                                    str(_("Row {0}: {1} '{2}' not found.").format(i, fk_model_name, lookup_value)))
                                failed_count += 1
                                skip_row = True
                                break
                    else:
                        # Regular fields
                        data[field_name] = row[field_name]

                if skip_row:
                    continue

                # Create Product
                try:
                    # We can use update_or_create to avoid duplicates if there's a unique field (like name or SKU)
                    # Here we assume creation or simple check
                    input_name = data.get('name')
                    if not input_name:
                        skipped_count += 1  # Skip empty rows
                        continue

                    # Check existence by name for simplicity, or use specific unique constraints
                    obj, created = ProductModel.objects.update_or_create(
                        name=input_name,
                        defaults=data
                    )

                    if created:
                        created_count += 1
                    else:
                        # Considered updated as skipped for "new creation" count, or count separately
                        skipped_count += 1

                except Exception as e:
                    failed_count += 1
                    errors.append(
                        str(_("Row {0}: Save Error - {1}").format(i, str(e))))

        return Response({
            "message": _("Import process completed."),
            "summary": {
                "created": created_count,
                "updated_or_skipped": skipped_count,
                "failed": failed_count
            },
            "errors": errors
        }, status=status.HTTP_200_OK)
