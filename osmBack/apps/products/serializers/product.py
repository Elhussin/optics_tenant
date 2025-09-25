from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.products.models import (
    Category, LensCoating, Product, ProductVariant, 
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
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        allow_null=True, 
        required=False
    )
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'parent', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class LensCoatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = LensCoating
        fields = [
            'id', 'name', 'description', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            'id', 'variant', 'image', 'alt_text', 
            'order', 'is_primary'
        ]
        read_only_fields = ['id', ]
        extra_kwargs = {
            'image': {'required': True}
        }

class ProductVariantListSerializer(serializers.ModelSerializer):
    frame_color: AttributeValueSerializer = AttributeValueSerializer(read_only=True)
    lens_color: AttributeValueSerializer = AttributeValueSerializer(read_only=True)
    discount_price: float | None = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'usku', 'frame_color', 'lens_color',
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

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    
    supplier = SupplierSerializer(read_only=True)
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        source='supplier',
        write_only=True
    )
    
    manufacturer = ManufacturerSerializer(read_only=True)
    manufacturer_id = serializers.PrimaryKeyRelatedField(
        queryset=Manufacturer.objects.all(),
        source='manufacturer',
        write_only=True
    )
    
    brand = BrandSerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        source='brand',
        write_only=True
    )
    
    variants = ProductVariantListSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'supplier', 'supplier_id',
            'manufacturer', 'manufacturer_id', 'brand', 'brand_id',
            'model', 'type', 'name', 'description', 'main_image',
            'variants', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'variants']

class ProductVariantSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    
    # Frame specifications
    frame_shape = AttributeValueSerializer(read_only=True)
    frame_shape_id = serializers.PrimaryKeyRelatedField(
        queryset=AttributeValue.objects.filter(attribute__name='Shape'),
        source='frame_shape',
        write_only=True,
        allow_null=True
    )
    
    frame_material = AttributeValueSerializer(read_only=True)
    frame_material_id = serializers.PrimaryKeyRelatedField(
        queryset=AttributeValue.objects.filter(attribute__name='Material'),
        source='frame_material',
        write_only=True,
        allow_null=True
    )
    
    frame_color = AttributeValueSerializer(read_only=True)
    frame_color_id = serializers.PrimaryKeyRelatedField(
        queryset=AttributeValue.objects.filter(attribute__name='Color'),
        source='frame_color',
        write_only=True,
        allow_null=True
    )
    
    # Lens specifications
    lens_coatings = LensCoatingSerializer(many=True, read_only=True)
    lens_coating_ids = serializers.PrimaryKeyRelatedField(
        queryset=LensCoating.objects.all(),
        source='lens_coatings',
        write_only=True,
        many=True,
        required=False
    )
    
    lens_type = AttributeValueSerializer(read_only=True)
    lens_type_id = serializers.PrimaryKeyRelatedField(
        queryset=AttributeValue.objects.filter(attribute__name='Lens Type'),
        source='lens_type',
        write_only=True,
        allow_null=True
    )
    
    # Pricing fields
    discount_price = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'product_id', 'sku', 'usku',
            
            # Frame specs
            'frame_shape', 'frame_shape_id', 'frame_material', 'frame_material_id',
            'frame_color', 'frame_color_id', 'temple_length', 'temple_length_id',
            'bridge_width', 'bridge_width_id',
            
            # Lens specs
            'lens_diameter', 'lens_diameter_id', 'lens_color', 'lens_color_id',
            'lens_material', 'lens_material_id', 'lens_base_curve', 'lens_base_curve_id',
            'lens_water_content', 'lens_water_content_id', 'replacement_schedule',
            'replacement_schedule_id', 'expiration_date',
            
            # Lens coatings and type
            'lens_coatings', 'lens_coating_ids', 'lens_type', 'lens_type_id',
            'spherical', 'cylinder', 'axis', 'addition', 'unit', 'unit_id',
            
            # Additional info
            'warranty', 'warranty_id', 'weight', 'weight_id', 'dimensions', 'dimensions_id',
            
            # Pricing
            'last_purchase_price', 'selling_price', 'discount_percentage', 'discount_price',
            
            # Images
            'images',
            
            # Status and timestamps
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'usku', 'discount_price', 'images', 
            'created_at', 'updated_at'
        ]
    
    def get_discount_price(self, obj):
        return obj.discount_price
    
    def validate(self, data):
        # Add any custom validation logic here
        product_type = data.get('product').type if 'product' in data else None
        
        if product_type == 'CL':  # Contact Lenses
            if not data.get('lens_base_curve'):
                raise serializers.ValidationError(
                    "Base curve is required for contact lenses."
                )
        
        return data

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
