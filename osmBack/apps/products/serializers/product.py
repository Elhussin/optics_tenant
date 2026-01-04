from rest_framework import serializers
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
                "Cannot set both customer and customer group."
            )

        # Validate date range
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError(
                    "End date must be after start date."
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
    type_display = serializers.CharField(source='get_type_display', read_only=True)

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
        variants_data = validated_data.pop('variants', [])
        categories = validated_data.pop('categories', [])
        
        product = Product.objects.create(**validated_data)
        
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
        if not variants_data:
            return

        ModelClass = VARIANT_MODEL_MAPPING.get(product.variant_type, ProductVariant)
        
        existing_variant_ids = [v.id for v in product.variants.all()]
        sent_variant_ids = [v.get('id') for v in variants_data if v.get('id')]

        # Delete removed variants
        for variant in product.variants.all():
            if variant.id not in sent_variant_ids:
                variant.delete()

        for vdata in variants_data:
            variant_id = vdata.get('id')
            attributes_data = vdata.pop('attributes', [])  # Handle custom attributes
            
            # 1. Create/Update Variant
            current_variant = None
            if variant_id and variant_id in existing_variant_ids:
                try:
                    current_variant = ModelClass.objects.get(id=variant_id, product=product)
                    for attr, value in vdata.items():
                         if hasattr(current_variant, attr): 
                            setattr(current_variant, attr, value)
                    current_variant.save()
                except ModelClass.DoesNotExist:
                     pass 
            else:
                current_variant = ModelClass.objects.create(product=product, **vdata)
            
            # 2. Handle Extra Attributes
            # Pop variant_type if it exists in vdata (for custom variants) to prevent error on base model
            custom_variant_type_id = vdata.pop('variant_type', None)

            if current_variant and attributes_data:
                # If variant_type was not in vdata (e.g. not 'custom' type, or not passed), 
                # we might accept it inside attributes_data if structured that way?
                # But form sends flat variant_type.
                # If custom_variant_type_id is None, and we are in 'custom' mode, we can't save ExtraVariantAttribute properly
                # unless we fetch an existing one? 
                
                # For now, we proceed only if we have data.
                
                # Sync logic: Delete attributes not in the new list??
                # Implementing simple add/update for now.
                
                for attr_item in attributes_data:
                    # attr_item: { 'attribute': ID, 'value': ID, 'id': ID? }
                    attr_id = attr_item.get('attribute')
                    val_id = attr_item.get('value')
                    
                    if not attr_id or not val_id:
                        continue

                    # We need variant_type. Check if it's in attr_item or use common one
                    v_type_id = attr_item.get('variant_type') or custom_variant_type_id
                    
                    if not v_type_id:
                        # Fallback: maybe the user meant the Product's variant_type is mapped to this?
                        # Unlikely. If missing, skip to avoid IntegrityError.
                        continue

                    ExtraVariantAttribute.objects.update_or_create(
                        variant=current_variant,
                        attribute_id=attr_id,
                        variant_type_id=v_type_id,
                        defaults={'value_id': val_id}
                    )

