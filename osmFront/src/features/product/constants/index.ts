import { ProductForginKeyConfigType } from "@/src/features/product/types";

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
export const checkBoxConfig = [
  { "name": "lens_coatings_id", "role": "lensMex", "filter": "Coatings", "entityName": "attribute-values" },
]
  // [{value:"CL",label:"Contact Lens" }, {value:"SL",label:"Spectacle Lens" }, {value:"Fr",label:"Frames" },{value:"AX",label:"Accessories" }, {value:"DV",label:"Devices" },{value:"OT",label:"Other" }

  export const ProductForginKeyConfig : ProductForginKeyConfigType[] = [
  // {"name":  "product_id","role":"all", "filter":"","entityName":"products"},
  { "name": "category_id",      "role": "all", "filter": "Category",    "entityName": "categories",     "mapOnly": true, "hent": "Category" ,"fieldName":"name"},
  { "name": "supplier_id",      "role": "all", "filter": "Supplier",    "entityName": "suppliers",      "mapOnly": true, "hent": "Supplier" ,"fieldName":"name"},
  { "name": "manufacturer_id",  "role": "all", "filter": "Manufacturer", "entityName": "manufacturers",  "mapOnly": true, "hent": "Manufacturer" ,"fieldName":"name"},
  { "name": "brand_id",         "role": "all", "filter": "Brand",       "entityName": "brands",         "mapOnly": true, "hent": "Brand" ,"fieldName":"name"},

  // product variant
 
  // role frame
  { "name": "frame_shape_id",    "role": "FR", "filter": "Shape", "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  { "name": "frame_material_id", "role": "FR", "filter": "Material", "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  { "name": "frame_color_id",    "role": "FR", "filter": "Color", "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  { "name": "temple_length_id",  "role": "FR", "filter": "Length", "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  { "name": "bridge_width_id",   "role": "FR", "filter": "Width", "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  // lens
  { "name": "lens_base_curve_id",      "role": "all",      "filter": "Base Curve",         "entityName": "attribute-values" , "fieldName":"attribute_name"},
  { "name": "product_type_id",  "role": "all", "filter": "Type", "hent": "Product Type Sun Glasses ,Color Contact lens", "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  { "name": "lens_color_id",    "role": "all", "filter": "Color", "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  { "name": "lens_material_id", "role": "all", "filter": "Material", "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  { "name": "lens_diameter_id", "role": "all", "filter": "Diameter", "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  
  // contact lens
  { "name": "unit_id", "role":  "CL", "filter": "Unit", "hent": "Iteam in box" ,"entityName": "attribute-values" ,"fieldName":"attribute_name"}, // iteam in the box
  { "name": "lens_water_content_id",   "role": "CL", "filter": "Water Content",        "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  { "name": "replacement_schedule_id", "role": "CL", "filter": "Replacement Schedule", "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  { "name": "warranty_id",             "role": "all", "filter": "Warranty",             "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  { "name": "dimensions_id",           "role": "all", "filter": "Dimensions",           "entityName": "attribute-values" ,"fieldName":"attribute_name"},
  { "name": "weight_id",               "role": "all", "filter": "Weight",               "entityName": "attribute-values" ,"fieldName":"attribute_name"},

]


const select = [
  { "label": "Spherical", "name": "spherical", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Cylinder", "name": "cylinder", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Axis", "name": "axis", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Addition", "name": "addition", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Type", "name": "type", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
]
