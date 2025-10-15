from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.products.models import (
    Category, Product, ProductVariant, 
    ProductImage, FlexiblePrice,Supplier,Manufacturer,Brand,AttributeValue,
    Attributes
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



class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductVariant
        fields = '__all__'
        read_only_fields = [
            'id', 'usku', 'discount_price', 'images',
            'created_at', 'updated_at', 'product_id'
        ]

class FrameVariantSerializer(ProductVariantSerializer):
    frame_shape_name = serializers.CharField(source='frame_shape.name', read_only=True)
    frame_material_name = serializers.CharField(source='frame_material.name', read_only=True)
    frame_color_name = serializers.CharField(source='frame_color.name', read_only=True)
    temple_length_name = serializers.CharField(source='temple_length.name', read_only=True)
    bridge_width_name = serializers.CharField(source='bridge_width.name', read_only=True)

class StokLensVariantSerializer(ProductVariantSerializer):
    pass
    # spherical_name = serializers.CharField(source='spherical.name', read_only=True)
    # cylinder_name = serializers.CharField(source='cylinder.name', read_only=True)

# variants/rx_lens.py
class RxLensVariantSerializer(ProductVariantSerializer):
    addition_name = serializers.CharField(source='addition.name', read_only=True)
    lens_base_curve_name = serializers.CharField(source='lens_base_curve.name', read_only=True)


class ContactLensVariantSerializer(ProductVariantSerializer):
    lens_base_curve_name = serializers.CharField(source='lens_base_curve.name', read_only=True)
    lens_water_content_name = serializers.CharField(source='lens_water_content.name', read_only=True)
    replacement_schedule_name = serializers.CharField(source='replacement_schedule.name', read_only=True)
    lens_color_name = serializers.CharField(source='lens_color.name', read_only=True)
    lens_material_name = serializers.CharField(source='lens_material.name', read_only=True)



class ContactLensVariantExpirationDateSerializer(ProductVariantSerializer):
    pass

class ExtraVariantAttributeSerializer(ProductVariantSerializer):
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all()
    )
    attribute = serializers.PrimaryKeyRelatedField(
        queryset=Attributes.objects.all()
    )
    value = serializers.PrimaryKeyRelatedField(
        queryset=AttributeValue.objects.all()
    )

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
    "StockLenses": StokLensVariantSerializer,
    "RxLenses": RxLensVariantSerializer,
    "ContactLenses": ContactLensVariantSerializer,
    "ContactLensesExpirationDate": ContactLensVariantExpirationDateSerializer,
    "custom": ExtraVariantAttributeSerializer,
}

class ProductSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    type = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()  # 👈 ديناميكي حسب variant_type

    def get_type(self, obj):
        return obj.get_type_display()

    def get_variants(self, obj):
        serializer_class = VARIANT_SERIALIZER_MAPPING.get(obj.variant_type, ProductVariantSerializer)
        variants_qs = obj.variants.all()
        return serializer_class(variants_qs, many=True, context=self.context).data

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'description', 'usku']

    def create(self, validated_data):
        variants_data = validated_data.pop('variants', [])
        product = Product(**validated_data)
        product.save()

        # إنشاء الـ variants حسب نوع المنتج
        for vdata in variants_data:
            ProductVariant.objects.create(product=product, **vdata)

        return product

    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        existing_variant_ids = [v.id for v in instance.variants.all()]
        sent_variant_ids = [v.get('id') for v in variants_data if v.get('id')]

        # حذف أي variant غير موجود
        for variant in instance.variants.all():
            if variant.id not in sent_variant_ids:
                variant.delete()

        # إنشاء أو تحديث الـ variants
        for vdata in variants_data:
            variant_id = vdata.get('id')
            if variant_id and variant_id in existing_variant_ids:
                variant = ProductVariant.objects.get(id=variant_id, product=instance)
                for attr, value in vdata.items():
                    setattr(variant, attr, value)
                variant.save()
            else:
                ProductVariant.objects.create(product=instance, **vdata)

        return instance



# class ProductVariantListSerializer(serializers.ModelSerializer):
#     frame_color_id: AttributeValueSerializer = AttributeValueSerializer(read_only=True)
#     lens_color_id: AttributeValueSerializer = AttributeValueSerializer(read_only=True)
#     discount_price: float | None = serializers.SerializerMethodField()
    
#     class Meta:
#         model = ProductVariant
#         fields = [
#             'id', 'sku', 'usku', 'frame_color_id', 'lens_color_id',
#             'selling_price', 'discount_percentage', 'discount_price',
#             'is_active'
#         ]
    
#     @extend_schema_field(float)
#     def get_discount_price(self, obj: ProductVariant) -> float | None:
#         """Calculate the discount price for the product variant.
        
#         Args:
#             obj: ProductVariant instance
            
#         Returns:
#             float: Discounted price or None if no discount
#         """
#         if obj.discount_percentage:
#             return float(obj.selling_price * (1 - obj.discount_percentage / 100))
#         return None


# class ProductVariantSerializer(serializers.ModelSerializer):
#     product_name = serializers.CharField(source='product_id.name', read_only=True)
#     frame_shape_name = serializers.CharField(source='frame_shape_id.name', read_only=True)
#     frame_material_name = serializers.CharField(source='frame_material_id.name', read_only=True)
#     frame_color_name = serializers.CharField(source='frame_color_id.name', read_only=True)
#     temple_length_name = serializers.CharField(source='temple_length_id.name', read_only=True)
#     bridge_width_name = serializers.CharField(source='bridge_width_id.name', read_only=True)
#     lens_diameter_name = serializers.CharField(source='lens_diameter_id.name', read_only=True)
#     lens_color_name = serializers.CharField(source='lens_color_id.name', read_only=True)
#     lens_material_name = serializers.CharField(source='lens_material_id.name', read_only=True)
#     lens_base_curve_name = serializers.CharField(source='lens_base_curve_id.name', read_only=True)
#     lens_water_content_name = serializers.CharField(source='lens_water_content_id.name', read_only=True)
#     replacement_schedule_name = serializers.CharField(source='replacement_schedule_id.name', read_only=True)
#     lens_type_name = serializers.CharField(source='lens_type_id.name', read_only=True)
#     lens_coatings_name = serializers.CharField(source='lens_coatings_id.name', read_only=True)
#     weight_name = serializers.CharField(source='weight_id.name', read_only=True)
#     dimensions_name = serializers.CharField(source='dimensions_id.name', read_only=True)

#     class Meta:
#         model = ProductVariant
#         fields = '__all__'
#         read_only_fields = [
#             'id', 'usku', 'discount_price', 'images', 
#             'created_at', 'updated_at',
#             'product_id'
#         ]

    
#     def get_discount_price(self, obj):
#         return obj.discount_price
    
#     def validate(self, data):
#         # Add any custom validation logic here
#         product_type = data.get('product_id').type if 'product_id' in data else None
        
#         if product_type == 'CL':  # Contact Lenses
#             if not data.get('lens_base_curve'):
#                 raise serializers.ValidationError(
#                     "Base curve is required for contact lenses."
#                 )
        
#         return data


# class ProductSerializer(serializers.ModelSerializer):
#     manufacturer_name = serializers.CharField(source='manufacturer_id.name', read_only=True)
#     category_name = serializers.CharField(source='category_id.name', read_only=True)
#     supplier_name = serializers.CharField(source='supplier_id.name', read_only=True)
#     brand_name = serializers.CharField(source='brand_id.name', read_only=True)
#     # type_display = serializers.CharField(source='get_type_display', read_only=True)  # 👈 هنا السحر
#     type = serializers.SerializerMethodField() # لعرض نوع المنتج بدل من type code

#     def get_type(self, obj):
#         return obj.get_type_display()
#     # Nested serializer للـ variants
#     variants = ProductVariantSerializer(many=True, required=False)

#     class Meta:
#         model = Product
#         fields = '__all__'
#         read_only_fields = ['id', 'created_at', 'updated_at', 'description', 'usku']

#     def create(self, validated_data):
#         variants_data = validated_data.pop('variants', [])
#         product = Product(**validated_data)
#         product.save()  # ← يولّد description وusku تلقائيًا

#         # إضافة الـ variants إن وجدت
#         variant_instances = [
#             ProductVariant(product=product, **v) for v in variants_data
#         ]
#         if variant_instances:
#             ProductVariant.objects.bulk_create(variant_instances)

#         return product

#     def update(self, instance, validated_data):
#         variants_data = validated_data.pop('variants', [])

#         # تحديث بيانات المنتج الأساسية
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()

#         # IDs الحالية في قاعدة البيانات
#         existing_variant_ids = [v.id for v in instance.variants.all()]
#         sent_variant_ids = [v.get('id') for v in variants_data if v.get('id')]

#         # حذف أي variant غير موجود في الطلب
#         for variant in instance.variants.all():
#             if variant.id not in sent_variant_ids:
#                 variant.delete()

#         # إنشاء أو تحديث الـ variants
#         for variant_data in variants_data:
#             variant_id = variant_data.get('id', None)
#             if variant_id and variant_id in existing_variant_ids:
#                 # تحديث variant موجود
#                 variant = ProductVariant.objects.get(id=variant_id, product=instance)
#                 for attr, value in variant_data.items():
#                     setattr(variant, attr, value)
#                 variant.save()
#             else:
#                 # إنشاء variant جديد
#                 ProductVariant.objects.create(product=instance, **variant_data)

#         return instance
