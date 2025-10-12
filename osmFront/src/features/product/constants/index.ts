import { ProductForginKeyConfigType } from "@/src/features/product/types";
import { generateLensOptions } from "@/src/features/product/utils/generateLensOptions";

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
]

export const TypeEnum = [{ value: "CL", label: "Contact Lens" }, { value: "SL", label: "Spectacle Lens" }, { value: "FR", label: "Frames" }, { value: "AX", label: "Accessories" }, { value: "DV", label: "Devices" }, { value: "OT", label: "Other" }]

export const ProductConfig:ProductForginKeyConfigType[] = [
  { "name": "category_id",      "role": "all", "filter": "Category",    "entityName": "categories",     "mapOnly": true, "hent": "Category" ,"fieldName":"name" ,"type":"foreignkey" },
  { "name": "supplier_id",      "role": "all", "filter": "Supplier",    "entityName": "suppliers",      "mapOnly": true, "hent": "Supplier" ,"fieldName":"name" ,"type":"foreignkey"},
  { "name": "manufacturer_id",  "role": "all", "filter": "Manufacturer", "entityName": "manufacturers",  "mapOnly": true, "hent": "Manufacturer" ,"fieldName":"name" ,"type":"foreignkey"},
  { "name": "brand_id",         "role": "all", "filter": "Brand",       "entityName": "brands",         "mapOnly": true, "hent": "Brand" ,"fieldName":"name" ,"type":"foreignkey"},
  { "label": "Model", "name": "model", "type": "text" ,"role": "all", "filter": "Model", "entityName": "attribute-values" ,"fieldName":"attribute_name" , "placeholder": "Model..." },
  { "label": "Name", "name": "name", "type": "text" ,"role": "all", "filter": "Name", "entityName": "attribute-values" ,"fieldName":"attribute_name" , "placeholder": "Name..." },
  // { "label": "Description", "name": "description", "type": "textarea", "rows": 5, "placeholder": "Description..." ,"role": "all", "filter": "Description", "entityName": "attribute-values" ,"fieldName":"attribute_name" },
]


export const ProductVariantConfig : ProductForginKeyConfigType[] = [

  // product variant
  { "name": "product_type_id",  "role": "all", "filter": "Product Type", "hent": "Product Type Sun Glasses ,Color Contact lens", "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},

  // role frame
  { "name": "frame_shape_id",    "role": "FR", "filter": "Shape", "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "frame_material_id", "role": "FR", "filter": "Material", "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "frame_color_id",    "role": "FR", "filter": "Color", "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "temple_length_id",  "role": "FR", "filter": "Length", "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "bridge_width_id",   "role": "FR", "filter": "Width", "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  // lens
  { "name": "lens_base_curve_id",      "role": "all",      "filter": "Base Curve",         "entityName": "attribute-values" , "fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "lens_color_id",    "role": "all", "filter": "Color", "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "lens_material_id", "role": "all", "filter": "Material", "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "lens_diameter_id", "role": "all", "filter": "Diameter", "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  
  // contact lens
  { "name": "unit_id", "role":  "CL", "filter": "Unit", "hent": "Iteam in box" ,"entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"}, // iteam in the box
  { "name": "lens_water_content_id",   "role": "CL", "filter": "Water Content",        "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "replacement_schedule_id", "role": "CL", "filter": "Replacement Schedule", "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "warranty_id",             "role": "all", "filter": "Warranty",             "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "dimensions_id",           "role": "all", "filter": "Dimensions",           "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "weight_id",               "role": "all", "filter": "Weight",               "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"foreignkey"},
  { "name": "lens_coatings_id", "role": "all", "filter": "Coatings", "entityName": "attribute-values" ,"fieldName":"attribute_name" ,"type":"checkbox"},
  { "label": "Sku", "name": "sku", "type": "text" ,"role": "all", "filter": "Sku", "entityName": "attribute-values" ,"fieldName":"attribute_name" , "placeholder": "Sku..." },
  { "label": "Last purchase price", "name": "last_purchase_price", "type": "text" ,"role": "all", "filter": "Last purchase price", "entityName": "attribute-values" ,"fieldName":"attribute_name" , "placeholder": "Last purchase price..." },
  { "label": "Sell price", "name": "selling_price", "type": "text" ,"role": "all", "filter": "Sell price", "entityName": "attribute-values" ,"fieldName":"attribute_name" , "placeholder": "Sell price..." },
  { "label": "Discount percentage", "name": "discount_percentage", "type": "number" ,"role": "all", "filter": "Discount percentage", "entityName": "attribute-values" ,"fieldName":"attribute_name" , "placeholder": "Discount percentage... %" },


  { "name": "spherical", "role": "SL", "filter":"","entityName":"products", "label": "SPH",   options: generateLensOptions(-60, 60),"fieldName":"spherical" ,"type":"select" },
  { "name": "cylinder", "role": "SL", "filter":"","entityName":"products", "label": "CYL", options: generateLensOptions(-12, 12),"fieldName":"cylinder" ,"type":"select" },
  { "name": "axis", "role": "SL", "filter":"","entityName":"products", "label": "AXIS", options: generateLensOptions(0, 180, 1, false),"fieldName":"axis" ,"type":"select" },
  { "name": "addition", "role": "SL", "filter":"","entityName":"products", "label": "ADD", options: generateLensOptions(1, 6),"fieldName":"addition" ,"type":"select" },

]
