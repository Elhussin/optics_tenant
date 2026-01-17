from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CSVImportSerializer
from django.apps import apps
from django_tenants.utils import schema_context
import csv
import io
from core.mixins.filterOptionsMixin import FilterOptionsMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, BasePermission
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.fields import CharField


class IsSuperAdmin(BasePermission):
    """
    صلاحية مخصصة للسماح فقط للمشرفين الرئيسيين (SuperAdmin).
    """
    message = "Only superadmin users can perform this action."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_superuser and
            request.user.is_staff
        )


# قائمة بيضاء للموديلات المسموح استيراد بياناتها
ALLOWED_IMPORT_MODELS = {
    # Users App
    'users.Role',
    'users.Permission',
    'users.RolePermission',
    'users.User',
    'users.TenantSettings',
    'users.Page',
    'users.PageContent',

    # Tenants App
    'tenants.SubscriptionPlan',

    # Products App
    'products.Attribute',
    'products.AttributeValue',
    'products.Category',
    'products.Brand',
    'products.Supplier',
    'products.Manufacturer',
    'products.Product',
    'products.ProductVariant',
    'products.FrameVariant',
    'products.StokLensVariant',
    'products.RxLensVariant',
    'products.ContactLensVariant',

    # Branches App
    'branches.Branch',
    'branches.BranchUsers',

    # HRM App
    'hrm.Department',
    'hrm.Employee',

    # CRM App
    'crm.Customer',
    'crm.CustomerGroup',
}

# الحد الأقصى لحجم ملف CSV (5 ميجابايت)
MAX_CSV_FILE_SIZE = 5 * 1024 * 1024


class CSVImportView(APIView):
    # فقط SuperAdmin يمكنه استخدام هذا الـ Endpoint
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = CSVImportSerializer(data=request.data)
        if serializer.is_valid():
            csv_file = serializer.validated_data['csv_file']
            config = serializer.validated_data['config']

            # التحقق من حجم الملف
            if csv_file.size > MAX_CSV_FILE_SIZE:
                return Response(
                    {"error": f"File too large. Maximum size is {MAX_CSV_FILE_SIZE // (1024*1024)}MB."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Security: Use schema from authenticated user's client instead of request data
            if not hasattr(request.user, 'client') or not request.user.client:
                return Response(
                    {"error": "User is not associated with any tenant client."},
                    status=status.HTTP_403_FORBIDDEN
                )

            schema = request.user.client.schema_name
            app_label = config.get('app', '')
            model_name = config.get('model', '')
            foreign_keys = config.get('foreign_keys', {})

            # التحقق من أن الموديل مسموح به
            model_path = f"{app_label}.{model_name}"
            if model_path not in ALLOWED_IMPORT_MODELS:
                return Response(
                    {"error": f"Model '{model_path}' is not allowed for import."},
                    status=status.HTTP_403_FORBIDDEN
                )

            with schema_context(schema):
                try:
                    model = apps.get_model(
                        app_label=app_label, model_name=model_name)
                except LookupError:
                    return Response(
                        {"error": f"Model {model_name} in {app_label} not found."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                model_fields = {
                    f.name: f for f in model._meta.get_fields()
                    if f.concrete and not f.auto_created
                }

                try:
                    content = csv_file.read().decode('utf-8')
                except UnicodeDecodeError:
                    return Response(
                        {"error": "Invalid file encoding. Please use UTF-8."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                reader = csv.DictReader(io.StringIO(content))
                created = 0
                skipped = 0
                failed = 0
                errors = []

                for i, row in enumerate(reader, start=2):
                    instance_data = {}
                    skip_row = False

                    for field_name, field in model_fields.items():
                        if field_name not in row or not row[field_name]:
                            continue

                        if field_name in foreign_keys:
                            rel_conf = foreign_keys[field_name]
                            try:
                                rel_model = apps.get_model(
                                    rel_conf['related_model'])
                            except LookupError:
                                errors.append(
                                    f"⚠️ Line {i}: Related model '{rel_conf['related_model']}' not found.")
                                failed += 1
                                skip_row = True
                                break

                            lookup_field = rel_conf.get('lookup_field', 'id')
                            create_if_missing = rel_conf.get(
                                "create_if_missing", False)

                            try:
                                rel_obj = rel_model.objects.get(
                                    **{lookup_field: row[field_name]})
                            except rel_model.DoesNotExist:
                                if create_if_missing:
                                    try:
                                        rel_obj = rel_model.objects.create(
                                            **{lookup_field: row[field_name]})
                                    except Exception as e:
                                        errors.append(
                                            f"❌ Line {i}: Failed to create {rel_model.__name__}: {e}")
                                        failed += 1
                                        skip_row = True
                                        break
                                else:
                                    errors.append(
                                        f"⚠️ Line {i}: {field_name} '{row[field_name]}' not found.")
                                    failed += 1
                                    skip_row = True
                                    break
                            instance_data[field_name] = rel_obj
                        else:
                            instance_data[field_name] = row[field_name]

                    if skip_row:
                        continue

                    if not instance_data:
                        continue

                    try:
                        obj, was_created = model.objects.get_or_create(
                            **instance_data)
                        if was_created:
                            created += 1
                        else:
                            skipped += 1
                    except Exception as e:
                        failed += 1
                        errors.append(f"❌ Line {i}: {str(e)}")

                return Response({
                    "created": created,
                    "skipped": skipped,
                    "failed": failed,
                    "errors": errors
                })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BaseViewSet(FilterOptionsMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    _generated_filterset_class = None  # لتجنب إعادة التوليد كل مرة

    @property
    def filterset_class(self):
        """
        يعيد الكلاس المولد مرة واحدة فقط حتى لا يتكرر إنشاؤه.
        """
        if self._generated_filterset_class is None:
            self._generated_filterset_class = super().get_filterset_class()
        return self._generated_filterset_class

    @property
    def search_fields(self):
        if getattr(self, "_search_fields", None):
            return self._search_fields
        # توليد من serializer كل الحقول النصية تلقائيًا
        return [f for f, field in self.serializer_class().fields.items() if isinstance(field, CharField)]

    @property
    def filter_fields(self):
        if getattr(self, "_filter_fields", None):
            return self._filter_fields
        # توليد كل الحقول مع lookup 'exact' تلقائيًا
        # Ensure we only include fields that actually exist on the model
        model = self.queryset.model
        model_field_names = {f.name for f in model._meta.get_fields()}

        return {
            f: ["exact"]
            for f in self.serializer_class().fields.keys()
            if f in model_field_names
        }

    def get_queryset(self):
        return super().get_queryset()
