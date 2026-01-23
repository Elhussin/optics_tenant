from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from django.conf import settings
from django.apps import apps
from django_tenants.utils import schema_context
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
    API View مخصص لاستيراد المنتجات فقط.
    يعتمد إجبارياً على إعدادات 'products.Product' الموجودة في ملف 'csv_configotenant.json'.
    """
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        # 1. التحقق من وجود الملف
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded. Key must be 'file'."}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']

        # 2. تحميل ملف الكونفيج الإجباري
        if not os.path.exists(CONFIG_FILE_PATH):
            logger.error(f"Config file not found at: {CONFIG_FILE_PATH}")
            return Response({"error": "Server configuration error: Config file missing."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            with open(CONFIG_FILE_PATH, 'r', encoding='utf-8') as f:
                full_config = json.load(f)
        except json.JSONDecodeError:
            logger.error("Failed to decode JSON config file.")
            return Response({"error": "Server configuration error: Invalid JSON config."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 3. استخراج إعدادات المنتج فقط
        product_config = next((item for item in full_config if item.get(
            'model') == 'Product' and item.get('app') == 'products'), None)

        if not product_config:
            logger.error(
                "Product configuration not found in csv_configotenant.json")
            return Response({"error": "Server configuration error: Product config missing."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        foreign_keys = product_config.get('foreign_keys', {})

        # 4. تحديد الـ Schema (للمستخدم الحالي)
        schema_name = "public"
        # assuming user has a client related to tenant
        if hasattr(request.user, 'client') and request.user.client:
            schema_name = request.user.client.schema_name

        # إذا كنت تريد السماح بتمرير schema في الـ request (لأغراض الاختبار فقط)، يمكنك إلغاء التعليق
        # schema_name = request.data.get('schema', schema_name)

        created_count = 0
        skipped_count = 0
        failed_count = 0
        errors = []

        # 5. معالجة الملف
        try:
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
        except Exception as e:
            return Response({"error": f"Failed to read CSV file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        model_name = "Product"
        app_label = "products"

        with schema_context(schema_name):
            try:
                ProductModel = apps.get_model(app_label, model_name)
            except LookupError:
                return Response({"error": f"Model {model_name} not found."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            model_fields = {f.name: f for f in ProductModel._meta.get_fields(
            ) if f.concrete and not f.auto_created}

            for i, row in enumerate(reader, start=2):  # Start at 2 for header
                data = {}
                skip_row = False

                # تنظيف البيانات (إزالة المسافات الزائدة)
                row = {k: v.strip() if v else v for k, v in row.items()}

                for field_name, field in model_fields.items():
                    # تخطي الحقول غير الموجودة في الـ CSV
                    if field_name not in row or not row[field_name]:
                        continue

                    # معالجة العلاقات (Foreign Keys)
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
                                f"Row {i}: Config Error - Related model {fk_model_str} not found.")
                            failed_count += 1
                            skip_row = True
                            break

                        lookup_value = row[field_name]

                        try:
                            # محاولة العثور على الكائن المرتبط
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
                                        f"Row {i}: Failed to create new {fk_model_name} '{lookup_value}': {str(e)}")
                                    failed_count += 1
                                    skip_row = True
                                    break
                            else:
                                errors.append(
                                    f"Row {i}: {fk_model_name} '{lookup_value}' not found.")
                                failed_count += 1
                                skip_row = True
                                break
                    else:
                        # الحقول العادية
                        data[field_name] = row[field_name]

                if skip_row:
                    continue

                # إنشاء المنتج
                try:
                    # يمكننا استخدام update_or_create لتجنب التكرار إذا كان هناك حقل فريد (مثل الاسم أو SKU)
                    # هنا سنفترض الإنشاء فقط أو التحقق البسيط
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
                    errors.append(f"Row {i}: Save Error - {str(e)}")

        return Response({
            "message": "Import process completed.",
            "summary": {
                "created": created_count,
                "updated_or_skipped": skipped_count,
                "failed": failed_count
            },
            "errors": errors
        }, status=status.HTTP_200_OK)
