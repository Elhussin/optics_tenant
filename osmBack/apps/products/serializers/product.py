from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema_field
from apps.products.models import (
    Category, Product, ProductVariant,
    ProductImage, FlexiblePrice, Supplier, Manufacturer, Brand, AttributeValue,
    Attribute, FrameVariant, StokLensVariant, RxLensVariant, ContactLensVariant,
    ContactLensVariantExpirationDate, ExtraVariantAttribute
)
from apps.crm.models import Customer, CustomerGroup
from apps.branches.models import Branch, BranchUsers
from apps.crm.serializers import CustomerGroupSerializer
from apps.branches.serializers import BranchSerializer
from apps.products.serializers.attributes import AttributeValueSerializer
from apps.products.serializers.suppliers import SupplierSerializer, ManufacturerSerializer, BrandSerializer
from apps.products.serializers.inventory import StockMovementSerializer, StockSerializer, StockTransferSerializer, StockTransferItemSerializer


class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)

    class Meta:
        model = Category
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'
        read_only_fields = ['id', ]
        extra_kwargs = {
            'image': {'required': True}
        }


class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductVariant
        exclude = ['is_deleted']
        read_only_fields = [
            'id', 'usku', 'discount_price', 'images',
            'created_at', 'updated_at', 'product'
        ]


class CreateProductVariantSerializer(serializers.ModelSerializer):
    """Serializer for creating variants with product specified"""

    # Allow all fields from all variant types by making them optional
    # Additional fields will be accepted via allow_null and required=False

    class Meta:
        model = ProductVariant
        exclude = ['is_deleted']
        read_only_fields = [
            'id', 'usku', 'discount_price', 'images',
            'created_at', 'updated_at', 'description'
        ]
        # Use extra_kwargs to make all fields optional
        extra_kwargs = {field.name: {'required': False, 'allow_null': True}
                        for field in ProductVariant._meta.get_fields()
                        if not field.auto_created and not field.primary_key}

    # 👈 variants READ logic
    variants = serializers.SerializerMethodField()
    # 👈 variants WRITE logic (input)
    variants_input = serializers.ListField(child=serializers.DictField(
    ), write_only=True, required=False, source='variants')

    def to_internal_value(self, data):
        """Override to accept fields from all variant types"""
        # Don't validate against model fields - accept everything
        # The actual model will validate when we create the instance
        return data

    def create(self, validated_data):
        import logging
        from apps.products.models import Product
        logger = logging.getLogger('product')

        # Get the product to determine variant type
        product_value = validated_data.get('product')
        if not product_value:
            raise serializers.ValidationError(
                {"product": str(_("This field is required"))})

        # Convert product ID to instance if needed
        if isinstance(product_value, int):
            try:
                product = Product.objects.get(id=product_value)
                validated_data['product'] = product
                logger.info(
                    f"Converted product ID {product_value} to instance")
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    {"product": str(_('Product with ID {id} does not exist').format(id=product_value))})
        else:
            product = product_value

        logger.info(
            f"Creating variant for product {product.id}, variant_type: {product.variant_type}")

        # Get the correct model class based on product.variant_type
        from apps.products.serializers.product import VARIANT_MODEL_MAPPING
        ModelClass = VARIANT_MODEL_MAPPING.get(
            product.variant_type, ProductVariant)
        logger.info(f"Using model class: {ModelClass.__name__}")

        # Extract M2M fields
        m2m_fields = {}
        model_m2m_field_names = [
            field.name for field in ModelClass._meta.get_fields()
            if field.many_to_many and not field.auto_created
        ]

        logger.info(
            f"M2M fields for {ModelClass.__name__}: {model_m2m_field_names}")

        for m2m_field in model_m2m_field_names:
            if m2m_field in validated_data:
                m2m_fields[m2m_field] = validated_data.pop(m2m_field)
                logger.info(
                    f"Extracted M2M field: {m2m_field} = {m2m_fields[m2m_field]}")

        # Convert ForeignKey fields to _id format
        # Get all ForeignKey field names
        fk_field_names = [
            field.name for field in ModelClass._meta.get_fields()
            if hasattr(field, 'related_model') and field.related_model is not None
            and not field.many_to_many and not field.one_to_many
        ]

        logger.info(
            f"ForeignKey fields for {ModelClass.__name__}: {fk_field_names}")

        logger.info(f"📋 validated_data before conversion: {validated_data}")

        # Convert FK fields from ID to model instance
        from apps.products.models import AttributeValue
        create_data = {}
        for key, value in validated_data.items():
            logger.info(
                f"  Processing: {key}={value} (type: {type(value).__name__})")
            if key in fk_field_names and isinstance(value, int):
                # Get the related model
                field = ModelClass._meta.get_field(key)
                related_model = field.related_model

                try:
                    # Convert ID to instance
                    instance = related_model.objects.get(id=value)
                    create_data[key] = instance
                    logger.info(
                        f"  ✅ Converted FK: {key}={value} → {instance}")
                except related_model.DoesNotExist:
                    logger.error(
                        f"  ❌ {related_model.__name__} with ID {value} not found")
                    raise serializers.ValidationError(
                        {key: str(_('{model} with ID {id} does not exist').format(model=related_model.__name__, id=value))})
            else:
                create_data[key] = value
                logger.info(f"  ➡️  Kept as-is: {key}={value}")

        # Create variant with the correct model class
        logger.info(
            f"Creating {ModelClass.__name__} with data: {create_data.keys()}")
        logger.info(f"Full create_data: {create_data}")
        variant = ModelClass.objects.create(**create_data)
        logger.info(f"Created variant with ID: {variant.id}")

        # Set M2M fields
        for m2m_field, m2m_value in m2m_fields.items():
            if m2m_value:
                m2m_manager = getattr(variant, m2m_field)
                if isinstance(m2m_value, list):
                    m2m_manager.set(m2m_value)
                else:
                    m2m_manager.set([m2m_value])
                logger.info(f"Set M2M field {m2m_field} = {m2m_value}")

        # Update description after M2M fields
        if m2m_fields:
            variant.save(force_description_update=True)
            logger.info(f"✅ Updated description: {variant.description}")

        return variant


class FrameVariantSerializer(ProductVariantSerializer):
    frame_shape_name = serializers.CharField(
        source='frame_shape.name', read_only=True)
    frame_material_name = serializers.CharField(
        source='frame_material.name', read_only=True)
    frame_color_name = serializers.CharField(
        source='frame_color.name', read_only=True)
    temple_length_name = serializers.CharField(
        source='temple_length.name', read_only=True)
    bridge_width_name = serializers.CharField(
        source='bridge_width.name', read_only=True)

    class Meta(ProductVariantSerializer.Meta):
        model = FrameVariant


class StokLensVariantSerializer(ProductVariantSerializer):
    class Meta(ProductVariantSerializer.Meta):
        model = StokLensVariant


class RxLensVariantSerializer(ProductVariantSerializer):
    addition_name = serializers.CharField(
        source='addition.name', read_only=True)
    lens_base_curve_name = serializers.CharField(
        source='lens_base_curve.name', read_only=True)
    right_or_left_display = serializers.CharField(
        source='get_right_or_left_display', read_only=True)

    class Meta(ProductVariantSerializer.Meta):
        model = RxLensVariant


class ContactLensVariantSerializer(ProductVariantSerializer):
    lens_base_curve_name = serializers.CharField(
        source='lens_base_curve.name', read_only=True)
    lens_water_content_name = serializers.CharField(
        source='lens_water_content.name', read_only=True)
    replacement_schedule_name = serializers.CharField(
        source='replacement_schedule.name', read_only=True)
    lens_color_name = serializers.CharField(
        source='lens_color.name', read_only=True)
    lens_material_name = serializers.CharField(
        source='lens_material.name', read_only=True)

    class Meta(ProductVariantSerializer.Meta):
        model = ContactLensVariant


class ContactLensVariantExpirationDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactLensVariantExpirationDate
        fields = '__all__'


class ExtraVariantAttributeSerializer(serializers.ModelSerializer):
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all()
    )
    attribute = serializers.PrimaryKeyRelatedField(
        queryset=Attribute.objects.all()
    )
    value = serializers.PrimaryKeyRelatedField(
        queryset=AttributeValue.objects.all()
    )

    class Meta:
        model = ExtraVariantAttribute
        fields = '__all__'


class FlexiblePriceSerializer(serializers.ModelSerializer):
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all()
    )
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        allow_null=True
    )
    customer_group = CustomerGroupSerializer(read_only=True)
    customer_group_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomerGroup.objects.all(),
        source='customer_group',
        write_only=True,
        allow_null=True
    )
    branch = BranchSerializer(read_only=True)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch',
        write_only=True,
        allow_null=True
    )

    class Meta:
        model = FlexiblePrice
        fields = [
            'id', 'variant', 'customer', 'customer_group', 'customer_group_id',
            'branch', 'branch_id', 'special_price', 'start_date', 'end_date',
            'min_quantity', 'currency', 'priority'
        ]

    def validate(self, data):
        # Ensure either customer or customer_group is set, not both
        if data.get('customer') and data.get('customer_group'):
            raise serializers.ValidationError(
                str(_('Cannot set both customer and customer group'))
            )

        # Validate date range
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError(
                    str(_('End date must be after start date'))
                )

        return data


class ProductVariantOfferSerializer (serializers.ModelSerializer):
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all()
    )
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        allow_null=True
    )
    customer_group = CustomerGroupSerializer(read_only=True)
    customer_group_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomerGroup.objects.all(),
        source='customer_group',
        write_only=True,
        allow_null=True
    )
    branch = BranchSerializer(read_only=True)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch',
        write_only=True,
        allow_null=True
    )


VARIANT_SERIALIZER_MAPPING = {
    "basic": ProductVariantSerializer,
    "frames": FrameVariantSerializer,
    "stockLenses": StokLensVariantSerializer,
    "rxLenses": RxLensVariantSerializer,
    "contactLenses": ContactLensVariantSerializer,
    "custom": ProductVariantSerializer,
}

VARIANT_MODEL_MAPPING = {
    "basic": ProductVariant,
    "frames": FrameVariant,
    "stockLenses": StokLensVariant,
    "rxLenses": RxLensVariant,
    "contactLenses": ContactLensVariant,
    "custom": ProductVariant,
}


class ProductSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    categories_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='categories',
        many=True,
        write_only=True
    )

    # Use CharField with source for read, but allow write on 'type' model field
    # Actually, default ModelSerializer behavior for 'type' (a choice field) is fine.
    # We only override it if we want the DISPLAY value in GET.
    # Let's use a separate field for display to keep 'type' writable.
    type_display = serializers.CharField(
        source='get_type_display', read_only=True)

    # 👈 variants READ logic
    variants = serializers.SerializerMethodField()
    # 👈 variants WRITE logic (input)
    variants_input = serializers.ListField(child=serializers.DictField(
    ), write_only=True, required=False, source='variants')

    def get_variants(self, obj):
        # We need to cast variants to their specific subclass (Polymorphism manual handling)
        # OR rely on django-polymorphic if used. Since models are MTI, we can try to access attributes.
        # But efficiently:
        variant_type = obj.variant_type
        serializer_class = VARIANT_SERIALIZER_MAPPING.get(
            variant_type, ProductVariantSerializer)

        # When fetching related variants using reverse relation, Django returns base ProductVariant instances
        # unless we explicitly downcast.

        variants_qs = obj.variants.all()
        # Retrieve specific instances to ensure we get subclass fields
        if variant_type and variant_type in VARIANT_MODEL_MAPPING:
            ModelClass = VARIANT_MODEL_MAPPING[variant_type]
            # IDs of variants related to this product
            ids = variants_qs.values_list('id', flat=True)
            variants_qs = ModelClass.objects.filter(id__in=ids)

        return serializer_class(variants_qs, many=True, context=self.context).data

    class Meta:
        model = Product
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at',
                            'updated_at', 'description', 'usku']

    def create(self, validated_data):
        import logging
        logger = logging.getLogger('product')
        logger.info(
            f"📦 ProductSerializer.create called with validated_data keys: {validated_data.keys()}")
        logger.info(
            f"📦 variants in validated_data: {validated_data.get('variants', 'NOT FOUND')}")

        variants_data = validated_data.pop('variants', [])
        logger.info(f"📦 variants_data after pop: {variants_data}")

        categories = validated_data.pop('categories', [])

        product = Product.objects.create(**validated_data)
        logger.info(f"✅ Product created: {product.id} - {product.name}")

        if categories:
            product.categories.set(categories)

        # Create variants based on specific type
        self._manage_variants(product, variants_data)

        return product

    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', [])
        categories = validated_data.pop('categories', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if categories is not None:
            instance.categories.set(categories)

        # Manage variants
        self._manage_variants(instance, variants_data)

        return instance

    def _manage_variants(self, product, variants_data):
        """Helper to create/update variants polymorphically"""
        import logging
        logger = logging.getLogger('product')
        logger.info(
            f"🔍 _manage_variants called for product {product.id} ({product.name})")
        logger.info(f"📋 variants_data received: {variants_data}")

        if not variants_data:
            logger.warning(
                "⚠️ variants_data is empty or None, skipping variant creation")
            return

        ModelClass = VARIANT_MODEL_MAPPING.get(
            product.variant_type, ProductVariant)

        existing_variant_ids = [v.id for v in product.variants.all()]
        sent_variant_ids = [v.get('id') for v in variants_data if v.get('id')]

        # Delete removed variants
        for variant in product.variants.all():
            if str(variant.id) not in [str(x) for x in sent_variant_ids]:
                variant.delete()

        for vdata in variants_data:
            variant_id = vdata.get('id')
            attributes_data = vdata.pop('attributes', [])

            # Clean vdata: remove empty strings/nulls for optional fields to avoid validation errors
            # Also convert ForeignKey fields to use _id suffix
            clean_vdata = {}

            # Get all ForeignKey field names from the model
            fk_field_names = [
                field.name for field in ModelClass._meta.get_fields()
                if hasattr(field, 'related_model') and field.related_model is not None
                # Exclude reverse relations
                and not field.name.endswith('_set')
            ]
            logger.info(
                f"FK fields for {ModelClass.__name__}: {fk_field_names}")

            for k, v in vdata.items():
                if v == "" or v is None:
                    continue

                # If this field is a ForeignKey and value is an ID (int or numeric string)
                # Convert to _id suffix format
                if k in fk_field_names:
                    try:
                        # Try to convert to int - if it works, it's an ID
                        int_value = int(v)
                        clean_vdata[f"{k}_id"] = int_value
                        logger.info(
                            f"Converted FK field: {k}={v} -> {k}_id={int_value}")
                    except (ValueError, TypeError):
                        # Not a numeric ID, use as-is (could be an instance)
                        clean_vdata[k] = v
                else:
                    clean_vdata[k] = v

            logger.info(f"clean_vdata for variant: {clean_vdata}")

            # 1. Create/Update Variant
            current_variant = None
            if variant_id and int(variant_id) in existing_variant_ids:
                try:
                    current_variant = ModelClass.objects.get(
                        id=variant_id, product=product)

                    # Get M2M field names for update handling
                    model_m2m_field_names = [
                        field.name for field in ModelClass._meta.get_fields()
                        if field.many_to_many and not field.auto_created
                    ]

                    m2m_updates = {}
                    for attr, value in clean_vdata.items():
                        # Check if this is a M2M field
                        base_attr = attr.replace(
                            '_id', '') if attr.endswith('_id') else attr
                        if base_attr in model_m2m_field_names:
                            m2m_updates[base_attr] = value
                        elif hasattr(current_variant, attr):
                            setattr(current_variant, attr, value)

                    current_variant.save()

                    # Handle M2M fields for update
                    for m2m_field, m2m_value in m2m_updates.items():
                        if m2m_value is not None:
                            m2m_manager = getattr(current_variant, m2m_field)
                            if isinstance(m2m_value, list):
                                m2m_manager.set(m2m_value)
                            else:
                                m2m_manager.set([m2m_value])
                            logger.info(
                                f"Updated M2M field {m2m_field} = {m2m_value}")

                    # Update description after M2M fields are set
                    if m2m_updates:
                        current_variant.save(force_description_update=True)
                        logger.info(f"✅ Updated description after M2M fields")

                except ModelClass.DoesNotExist:
                    pass
            else:
                # Remove 'id' from create data if present and empty/invalid
                if 'id' in clean_vdata:
                    del clean_vdata['id']

                # Extract ManyToMany fields before create
                # ManyToMany fields cannot be passed directly to create()
                m2m_fields = {}
                model_m2m_field_names = [
                    field.name for field in ModelClass._meta.get_fields()
                    if field.many_to_many and not field.auto_created
                ]
                logger.info(
                    f"M2M fields for {ModelClass.__name__}: {model_m2m_field_names}")

                for m2m_field in model_m2m_field_names:
                    if m2m_field in clean_vdata:
                        m2m_fields[m2m_field] = clean_vdata.pop(m2m_field)
                    # Also check for _id suffix
                    if f"{m2m_field}_id" in clean_vdata:
                        m2m_fields[m2m_field] = clean_vdata.pop(
                            f"{m2m_field}_id")

                # Create the variant without M2M fields
                logger.info(f"Creating variant with data: {clean_vdata}")
                current_variant = ModelClass.objects.create(
                    product=product, **clean_vdata)

                # Now set M2M fields
                for m2m_field, m2m_value in m2m_fields.items():
                    if m2m_value:
                        m2m_manager = getattr(current_variant, m2m_field)
                        if isinstance(m2m_value, list):
                            m2m_manager.set(m2m_value)
                        else:
                            m2m_manager.set([m2m_value])
                        logger.info(f"Set M2M field {m2m_field} = {m2m_value}")

                # Update description after M2M fields are set
                if m2m_fields:
                    current_variant.save(force_description_update=True)
                    logger.info(f"✅ Updated description after M2M fields")

            # 2. Handle Extra Attributes
            # Don't pop, might need it? actually pop is safer if not fields
            custom_variant_type_id = clean_vdata.get('variant_type', None)

            if current_variant and attributes_data:
                for attr_item in attributes_data:
                    attr_id = attr_item.get('attribute')
                    val_id = attr_item.get('value')

                    if not attr_id or not val_id:
                        continue

                    v_type_id = attr_item.get(
                        'variant_type') or custom_variant_type_id

                    # If we still don't have variant_type_id (e.g. basic product with extra attrs?), default to something?
                    # Or maybe skip.
                    if not v_type_id:
                        continue

                    ExtraVariantAttribute.objects.update_or_create(
                        variant=current_variant,
                        attribute_id=attr_id,
                        variant_type_id=v_type_id,
                        defaults={'value_id': val_id}
                    )
