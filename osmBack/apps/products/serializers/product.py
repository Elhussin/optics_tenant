from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.products.models import (
    Category, Product, ProductVariant, 
    ProductImage, FlexiblePrice,Supplier,Manufacturer,Brand,AttributeValue,
)
from apps.crm.models import Customer,CustomerGroup
from apps.branches.models import Branch, BranchUsers
from apps.crm.serializers import CustomerGroupSerializer
from apps.branches.serializers import BranchSerializer
from apps.products.serializers.attributes import AttributeValueSerializer
from apps.products.serializers.suppliers import SupplierSerializer, ManufacturerSerializer, BrandSerializer
from apps.products.serializers.inventory import StockMovementsSerializer,StocksSerializer,StockTransferSerializer, StockTransferItemSerializer

class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)

    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'parent_id', 'parent_name',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']



class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            'id', 'variant_id', 'image', 'alt_text', 
            'order', 'is_primary'
        ]
        read_only_fields = ['id', ]
        extra_kwargs = {
            'image': {'required': True}
        }

class ProductVariantListSerializer(serializers.ModelSerializer):
    frame_color_id: AttributeValueSerializer = AttributeValueSerializer(read_only=True)
    lens_color_id: AttributeValueSerializer = AttributeValueSerializer(read_only=True)
    discount_price: float | None = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'usku', 'frame_color_id', 'lens_color_id',
            'selling_price', 'discount_percentage', 'discount_price',
            'is_active'
        ]
    
    @extend_schema_field(float)
    def get_discount_price(self, obj: ProductVariant) -> float | None:
        """Calculate the discount price for the product variant.
        
        Args:
            obj: ProductVariant instance
            
        Returns:
            float: Discounted price or None if no discount
        """
        if obj.discount_percentage:
            return float(obj.selling_price * (1 - obj.discount_percentage / 100))
        return None


class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product_id.name', read_only=True)
    frame_shape_name = serializers.CharField(source='frame_shape_id.name', read_only=True)
    frame_material_name = serializers.CharField(source='frame_material_id.name', read_only=True)
    frame_color_name = serializers.CharField(source='frame_color_id.name', read_only=True)
    temple_length_name = serializers.CharField(source='temple_length_id.name', read_only=True)
    bridge_width_name = serializers.CharField(source='bridge_width_id.name', read_only=True)
    lens_diameter_name = serializers.CharField(source='lens_diameter_id.name', read_only=True)
    lens_color_name = serializers.CharField(source='lens_color_id.name', read_only=True)
    lens_material_name = serializers.CharField(source='lens_material_id.name', read_only=True)
    lens_base_curve_name = serializers.CharField(source='lens_base_curve_id.name', read_only=True)
    lens_water_content_name = serializers.CharField(source='lens_water_content_id.name', read_only=True)
    replacement_schedule_name = serializers.CharField(source='replacement_schedule_id.name', read_only=True)
    lens_type_name = serializers.CharField(source='lens_type_id.name', read_only=True)
    lens_coatings_name = serializers.CharField(source='lens_coatings_id.name', read_only=True)
    weight_name = serializers.CharField(source='weight_id.name', read_only=True)
    dimensions_name = serializers.CharField(source='dimensions_id.name', read_only=True)
    # product_id = serializers.PrimaryKeyRelatedField(read_only=True)

   
    # def __init__(self, *args, **kwargs):
    #     # إذا serializer يستخدم nested (context يحتوي على 'nested')
    #     nested = kwargs.pop('nested', False)
    #     super().__init__(*args, **kwargs)
    #     if nested:
    #         self.fields['product_id'].read_only = True
    class Meta:
        model = ProductVariant
        fields = '__all__'
        read_only_fields = [
            'id', 'usku', 'discount_price', 'images', 
            'created_at', 'updated_at',
            'product_id'
        ]

    
    def get_discount_price(self, obj):
        return obj.discount_price
    
    def validate(self, data):
        # Add any custom validation logic here
        product_type = data.get('product_id').type if 'product_id' in data else None
        
        if product_type == 'CL':  # Contact Lenses
            if not data.get('lens_base_curve'):
                raise serializers.ValidationError(
                    "Base curve is required for contact lenses."
                )
        
        return data



class ProductSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source='manufacturer_id.name', read_only=True)
    category_name = serializers.CharField(source='category_id.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier_id.name', read_only=True)
    brand_name = serializers.CharField(source='brand_id.name', read_only=True)
    
    # Nested serializer للـ variants
    variants = ProductVariantSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
   
    def create(self, validated_data):
        variants_data = validated_data.pop('variants', [])
        product = Product.objects.create(**validated_data)

        # نضيف product_id للـ variants فقط إذا جاء nested
        variant_instances = [
            ProductVariant(product_id=product, **v) for v in variants_data
        ]
        ProductVariant.objects.bulk_create(variant_instances)
        return product
    # إنشاء المنتج مع variants
    # def create(self, validated_data):
    #     print("Incoming raw data to serializer:", self.initial_data)
    #     print("Validated data:", validated_data)
       
    #     product = Product.objects.create(**validated_data)
    #     variants_data = validated_data.pop('variants', [])
    #     print("Product created:", product)

    # # تجهيز وإنشاء الـ variants بعد معرفة الـ product_id
    #     variant_instances = [
    #         ProductVariant(product_id=product.id, **variant_data)
    #         for variant_data in variants_data
    #     ]
    #     if variant_instances:
    #         ProductVariant.objects.bulk_create(variant_instances)
    #     # تجهيز وإنشاء variants دفعة واحدة
    #     # if variants_data:
    #     #     variant_instances = [
    #     #         ProductVariant(product_id=product, **variant_data)
    #     #         for variant_data in variants_data
    #     #     ]
    #     #     ProductVariant.objects.bulk_create(variant_instances)

    #     return product

    # تحديث المنتج وإدارة CRUD للـ variants
    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', [])

        # تحديث بيانات المنتج الأساسية
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # IDs الحالية في قاعدة البيانات
        existing_variant_ids = [v.id for v in instance.variants.all()]
        sent_variant_ids = [v.get('id') for v in variants_data if v.get('id')]

        # حذف أي variant غير موجود في الطلب
        for variant in instance.variants.all():
            if variant.id not in sent_variant_ids:
                variant.delete()

        # إنشاء أو تحديث الـ variants
        for variant_data in variants_data:
            variant_id = variant_data.get('id', None)
            if variant_id and variant_id in existing_variant_ids:
                # تحديث variant موجود
                variant = ProductVariant.objects.get(id=variant_id, product=instance)
                for attr, value in variant_data.items():
                    setattr(variant, attr, value)
                variant.save()
            else:
                # إنشاء variant جديد
                ProductVariant.objects.create(product_id=instance, **variant_data)

        return instance


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



# category_name = CategorySerializer(read_only=True)

# category_id = serializers.PrimaryKeyRelatedField(
#     queryset=Category.objects.all(),
#     source='category',
#     write_only=True
# )

# supplier = SupplierSerializer(read_only=True)
# supplier_id = serializers.PrimaryKeyRelatedField(
#     queryset=Supplier.objects.all(),
#     source='supplier',
#     write_only=True
# )


# manufacturer = ManufacturerSerializer(read_only=True)
# manufacturer_id = serializers.PrimaryKeyRelatedField(
#     queryset=Manufacturer.objects.all(),
#     source='manufacturer',
#     write_only=True
# )

# brand = BrandSerializer(read_only=True)
# brand_id = serializers.PrimaryKeyRelatedField(
#     queryset=Brand.objects.all(),
#     source='brand',
#     write_only=True
# )

    # product = ProductSerializer(read_only=True)
# product_id = serializers.PrimaryKeyRelatedField(
#     queryset=Product.objects.all(),
#     source='product',
#     write_only=True
# )

# Frame specifications
# frame_shape = AttributeValueSerializer(read_only=True)
# frame_shape_id = serializers.PrimaryKeyRelatedField(
#     queryset=AttributeValue.objects.filter(attribute_id__name='Shape'),
#     source='frame_shape',
#     write_only=True,
#     allow_null=True
# )

# frame_material = AttributeValueSerializer(read_only=True)
# frame_material_id = serializers.PrimaryKeyRelatedField(
#     queryset=AttributeValue.objects.filter(attribute_id__name='Material'),
#     source='frame_material',
#     write_only=True,
#     allow_null=True
# )

# frame_color = AttributeValueSerializer(read_only=True)
# frame_color_id = serializers.PrimaryKeyRelatedField(
#     queryset=AttributeValue.objects.filter(attribute_id__name='Color'),
#     source='frame_color',
#     write_only=True,
#     allow_null=True
# )

# # Lens specifications
# lens_coatings = LensCoatingSerializer(many=True, read_only=True)
# lens_coating_ids = serializers.PrimaryKeyRelatedField(
#     queryset=LensCoating.objects.all(),
#     source='lens_coatings',
#     write_only=True,
#     many=True,
#     required=False
# )

# lens_type = AttributeValueSerializer(read_only=True)
# lens_type_id = serializers.PrimaryKeyRelatedField(
#     queryset=AttributeValue.objects.filter(attribute_id__name='Lens Type'),
#     source='lens_type',
#     write_only=True,
#     allow_null=True
# )

# # Pricing fields
# discount_price = serializers.SerializerMethodField()
# images = ProductImageSerializer(many=True, read_only=True)

# fields = [
#     'id', 'product_id', 'sku', 'usku',
#     'product_name',
#     'frame_shape_name', 'frame_material_name', 'frame_color_name',
#     'temple_length_name', 'bridge_width_name',
#     'lens_diameter_name', 'lens_color_name',
#     'lens_material_name', 'lens_base_curve_name',
#     'lens_water_content_name', 'replacement_schedule_name',
#     'lens_type_name', 'lens_coatings_name',
#     'weight_name', 'dimensions_name',
    
#     # Frame specs
#     'frame_shape_id', 'frame_material_id',
#     'frame_color_id', 'temple_length_id',
#     'bridge_width_id',
    
#     # Lens specs
#     'lens_diameter_id', 'lens_color_id',
#     'lens_material_id', 'lens_base_curve_id',
#     'lens_water_content_id', 'replacement_schedule_id',
    
#     # Lens coatings and type
#    'lens_coatings_id', 'lens_type_id',
#     'spherical', 'cylinder', 'axis', 'addition', 'unit_id',
    
#     # Additional info
#     'warranty_id', 'weight_id', 'dimensions_id',
    
#     # Pricing
#     'last_purchase_price', 'selling_price', 'discount_percentage', 'discount_price',
    
#     # Images
#     'images',
    
#     # Status and timestamps
#     'is_active', 'created_at', 'updated_at'
# ]
# read_only_fields = [
#     'id', 'usku', 'discount_price', 'images', 
#     'created_at', 'updated_at'
# ]