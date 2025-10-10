
export const TEXTFIELDDATA = [
  { "label": "Model", "name": "model", "type": "text" },
  { "label": "Name", "name": "name", "type": "text" },
  { "label": "Sku", "name": "sku", "type": "text" },
  { "label": "Last purchase price", "name": "last_purchase_price", "type": "text" },
  { "label": "Sell price", "name": "selling_price", "type": "text" },
  { "label": "Discount percentage", "name": "discount_percentage", "type": "text" },
  { "label": "Description", "name": "description", "type": "textarea", "rows": 5, "placeholder": "Description..." },
]

export const checkBox = [
  { "label": "Is Active", "name": "is_active", type: "checkbox" },
  { "label": "Is Deleted", "name": "is_deleted", type: "checkbox" },
  { "name": "lens_coatings_id", "role": "lensMex", "filter": "Coatings", "entityName": "attribute-values" },
]


export const ProductVariantForginKey = [
  // {"name":  "product_id","role":"all", "filter":"","entityName":"products"},
  { "name": "category_id",      "role": "all", "filter": "Category",    "entityName": "categories",     "mapOnly": true, "hent": "Category" },
  { "name": "supplier_id",      "role": "all", "filter": "Supplier",    "entityName": "suppliers",      "mapOnly": true, "hent": "Supplier" },
  { "name": "manufacturer_id",  "role": "all", "filter": "Manufacturer", "entityName": "manufacturers",  "mapOnly": true, "hent": "Manufacturer" },
  { "name": "brand_id",         "role": "all", "filter": "Brand",       "entityName": "brands",         "mapOnly": true, "hent": "Brand" },

  // product variant
  { "name": "product_type_id",  "role": "all", "filter": "Type", "hent": "Product Type Sun Glasses ,Color Contact lens", "entityName": "attribute-values" },
  { "name": "unit_id", "role":  "all", "filter": "Unit", "hent": "Iteam in box" }, // iteam in the box
  { "name": "lens_color_id",    "role": "mex", "filter": "Color", "entityName": "attribute-values" },
  { "name": "lens_material_id", "role": "mex", "filter": "Material", "entityName": "attribute-values" },
  { "name": "lens_diameter_id", "role": "mex", "filter": "Diameter", "entityName": "attribute-values" },
  // role frame
  { "name": "frame_shape_id",    "role": "frame", "filter": "Shape", "entityName": "attribute-values" },
  { "name": "frame_material_id", "role": "frame", "filter": "Material", "entityName": "attribute-values" },
  { "name": "frame_color_id",    "role": "frame", "filter": "Color", "entityName": "attribute-values" },
  { "name": "temple_length_id",  "role": "frame", "filter": "Length", "entityName": "attribute-values" },
  { "name": "bridge_width_id",   "role": "frame", "filter": "Width", "entityName": "attribute-values" },
  // lens
  { "name": "lens_base_curve_id", "role": "lensMex", "filter": "Base Curve", "entityName": "attribute-values" },
  // contact lens
  { "name": "lens_water_content_id", "role": "contact-lens", "filter": "Water Content", "entityName": "attribute-values" },
  { "name": "replacement_schedule_id", "role": "contact-lens", "filter": "Replacement Schedule", "entityName": "attribute-values" },
  { "name": "warranty_id", "role": "contact-lens", "filter": "Warranty", "entityName": "attribute-values" },
  { "name": "dimensions_id", "role": "contact-lens", "filter": "Dimensions", "entityName": "attribute-values" },
  { "name": "weight_id", "role": "contact-lens", "filter": "Weight", "entityName": "attribute-values" },

]


const select = [
  { "label": "Spherical", "name": "spherical", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Cylinder", "name": "cylinder", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Axis", "name": "axis", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Addition", "name": "addition", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Type", "name": "type", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
]
