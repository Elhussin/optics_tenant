from decimal import Decimal
from apps.tenants.test.test_utils import BaseTenantTestCase
from django.core.exceptions import ValidationError
from apps.products.models import Product, ProductVariant, FrameVariant, StokLensVariant, Stock, Supplier, Attribute, AttributeValue
from apps.products.models.purchase import PurchaseOrder, PurchaseOrderItem
from apps.products.services.generate_sku_code import generate_sku_code, generate_numeric_barcode
from apps.products.services.purchase_service import calculate_purchase_order_totals, receive_purchase_order_items
from apps.products.services.lens_matrix_service import generate_lens_matrix
from apps.products.models.suppliers import Brand
from apps.branches.models import Branch


class OpticsProductsEnhancementsTestCase(BaseTenantTestCase):
    def setUp(self):
        super().setUp()
        self.brand = Brand.objects.create(name="RayBan")
        self.branch = Branch.objects.create(name="Main Branch")
        self.supplier = Supplier.objects.create(name="Global Optical Supplies")

        attr_type = Attribute.objects.create(name="Product Type")
        self.pt_val = AttributeValue.objects.create(attribute=attr_type, value="Frame")

        attr_dia = Attribute.objects.create(name="Diameter")
        self.dia_val = AttributeValue.objects.create(attribute=attr_dia, value="70mm")

        self.product = Product.objects.create(
            brand=self.brand,
            model="3025",
            main_group="FR",
            name="RayBan Aviator 3025"
        )

    def test_structured_sku_and_numeric_barcode(self):
        variant = ProductVariant.objects.create(
            product=self.product,
            product_type=self.pt_val,
            selling_price=Decimal("450.00")
        )
        self.assertTrue(variant.sku.startswith("V-FR-RAYB-3025"))
        self.assertIsNotNone(variant.barcode)
        self.assertTrue(variant.barcode.startswith("200"))

    def test_min_selling_price_validation(self):
        variant = ProductVariant(
            product=self.product,
            product_type=self.pt_val,
            selling_price=Decimal("100.00"),
            min_selling_price=Decimal("150.00")
        )
        with self.assertRaises(ValidationError):
            variant.clean()

    def test_purchase_order_landed_costs_allocation(self):
        po = PurchaseOrder.objects.create(
            supplier=self.supplier,
            branch=self.branch,
            shipping_cost=Decimal("50.00"),
            customs_cost=Decimal("50.00")
        )
        variant1 = ProductVariant.objects.create(
            product=self.product,
            product_type=self.pt_val,
            selling_price=Decimal("200.00")
        )
        item1 = PurchaseOrderItem.objects.create(
            order=po,
            variant=variant1,
            quantity_ordered=10,
            unit_cost=Decimal("100.00")
        )

        calculate_purchase_order_totals(po)
        item1.refresh_from_db()

        self.assertEqual(po.total_landed_cost, Decimal("100.00"))
        self.assertEqual(item1.landed_cost_per_unit, Decimal("10.00"))
        self.assertEqual(item1.effective_unit_cost, Decimal("110.00"))

    def test_lens_matrix_generator_and_duplicate_prevention(self):
        lens_product = Product.objects.create(
            brand=self.brand,
            model="1.61 AR",
            main_group="SL",
            name="Stock Lens 1.61"
        )
        
        result1 = generate_lens_matrix(
            product_id=lens_product.id,
            sph_start=-1.00,
            sph_end=-0.50,
            sph_step=0.25,
            cyl_start=0.00,
            cyl_end=-0.25,
            cyl_step=-0.25,
            product_type_id=self.pt_val.id,
            lens_diameter_id=self.dia_val.id,
            selling_price=Decimal("120.00")
        )

        self.assertEqual(result1["created_count"], 6)

        result2 = generate_lens_matrix(
            product_id=lens_product.id,
            sph_start=-1.00,
            sph_end=-0.50,
            sph_step=0.25,
            cyl_start=0.00,
            cyl_end=-0.25,
            cyl_step=-0.25,
            product_type_id=self.pt_val.id,
            lens_diameter_id=self.dia_val.id,
            selling_price=Decimal("120.00")
        )

        self.assertEqual(result2["created_count"], 0)
        self.assertEqual(result2["skipped_duplicates_count"], 6)
