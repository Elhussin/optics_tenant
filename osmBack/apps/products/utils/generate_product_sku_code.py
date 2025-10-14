
def generate_product_sku_code(self):
    """Helper function to create a unique SKU"""
    brand_part = str(self.brand_id.id).zfill(3)
    category_part = str(self.category_id.id).zfill(3)
    supplier_part = str(self.supplier_id.id).zfill(3)
    manufacturer_part = str(self.manufacturer_id.id).zfill(3)
    model_part = self.model.replace(" ", "").upper()
    return f"{self.type}{brand_part}{category_part}{supplier_part}{manufacturer_part}{model_part}"
