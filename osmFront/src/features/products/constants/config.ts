import { ProductConfigType } from "@/src/features/products/types";
import { generateLensOptions } from "@/src/features/products/utils/generateLensOptions";

export const PRODUCT_TYPE_CHOICES = [
  { value: "FR", label: "Frames" },
  { value: "SL", label: "Spectacle Lens" },
  { value: "CL", label: "Contact Lens" },
  { value: "DV", label: "Devices" },
  { value: "AX", label: "Accessories" },
  { value: "OT", label: "Other" },
];

export const VARIANT_TYPE_CHOICES = [
  { value: "frames", label: "Frames", role: "FR" },
  { value: "stockLenses", label: "Stock Lenses", role: "SL" },
  { value: "rxLenses", label: "Rx Lenses", role: "SL" },
  { value: "contactLenses", label: "Contact Lenses", role: "CL" },
  { value: "basic", label: "Basic", role: "all" },
  // { value: "custom", label: "Custom", role: "all" },
];

export const ProductConfig: ProductConfigType[] = [
  {
    name: "categories_ids",
    label: "Categories",
    role: "all",
    filter: "categories",
    title: "Select Categories",
    subFilter: "",
    entityName: "categories",
    fieldName: "name",
    type: "multiSelect", // Changed from foreignkey to multiSelect for M2M
    placeholder: "Select Categories...",
    required: true,
    mapOnly: true,
  },

  {
    name: "brand",
    label: "Brand",
    role: "all",
    filter: "brands",
    subFilter: "product_type",
    title: "Select Brand | Brand Name",
    entityName: "brands",
    fieldName: "name",
    type: "foreignkey",
    required: true,
    mapOnly: true,
  },
  {
    name: "model",
    label: "Model",
    type: "text",
    role: "all",
    filter: "Model",
    title: "Enter Product Model | Model Number",
    entityName: "",
    fieldName: "",
    placeholder: "Model...",
    required: true,
  },
  {
    name: "name",
    label: "Name",
    role: "all",
    filter: "Name",
    title: "Enter Product Name",
    entityName: "",
    fieldName: "",
    type: "text",
    placeholder: "Name...",
    required: false,
  },
  {
    name: "manufacturer",
    label: "Manufacturer",
    role: "all",
    filter: "manufacturers",
    subFilter: "",  // Removed "product_type" - manufacturers don't have this field
    title: "Select Manufacturer | Manufacturer Name",
    entityName: "manufacturers",
    fieldName: "name",
    type: "foreignkey",
    required: false,
    mapOnly: true,
  },
  {
    name: "is_active",
    label: "Is Active",
    role: "all",
    filter: "Is Active",
    subFilter: "",
    title: "Is Active | True | False",
    entityName: "",
    fieldName: "is_active",
    type: "checkbox",
    placeholder: "Is Active",
    required: false,
  },
];

export const MainFieldConfig: ProductConfigType[] = [
  {
    name: "main_group",
    label: "Main Group",
    role: "all",
    filter: "Main Group",
    title: "Select Product Main Group",
    entityName: "products",
    fieldName: "main_group",
    type: "select",
    placeholder: "Select Main Group...",
    required: true,
    options: PRODUCT_TYPE_CHOICES,
  },
  {
    name: "variant_count",
    label: "Variant Count",
    role: "all",
    filter: "Variant Count",
    title: "Select Variant Count",
    entityName: "products",
    fieldName: "variant_count",
    type: "number",
    placeholder: "Select Variant Count...",
    required: true,
    defaultValue: 1,
    className: "w-full",
    // onChange: (value: any) => {setVariantCount(Number(value))}
  },
  {
    name: "variant_type",
    label: "Variant Type",
    role: "all",
    filter: "Variant Type",
    title: "Select Variant Type",
    entityName: "products",
    fieldName: "variant_type",
    type: "select",
    placeholder: "Select Variant Type...",
    required: true,
    options: VARIANT_TYPE_CHOICES,
  },
  {
    name: "attribute_count",
    label: "Attribute Count",
    type: "number",
    role: "all",
    filter: "",
    entityName: "",
    fieldName: "",
    required: true,
  },
];

export const ProductTypeEnum = [
  { value: "SL-ST", label: "Single Stock", filter: "SL" },
  {
    value: "SL-RX",
    label: "Single RX",
    filter: "SL",
  },
  {
    value: "SL-MF",
    label: "Multi Focal ",
    filter: "SL",
  },
  {
    value: "SL-BF",
    label: "Bifocal RX",
    filter: "SL",
  },
  {
    value: "SL-TF",
    label: "Triple Focal RX",
    filter: "SL",
  },

  {
    value: "CL-Cl",
    label: "Contact Lens Clear",
    filter: "CL",
  },
  {
    value: "CL-CO",
    label: "Contact Lens Colored",
    filter: "CL",
  },
  {
    value: "FR-SG",
    label: "Frames Sun Glasses",
    filter: "FR",
  },
  {
    value: "FR-SP",
    label: "Frames Spectacle Glasses",
    filter: "FR",
  },
  {
    value: "OT",
    label: "Other",
    filter: "OT",
  },
  {
    value: "DV",
    label: "Devices",
    filter: "DV",
  },
  {
    value: "AX",
    label: "Accessories",
    filter: "AX",
  },
];

export const BasicVariantConfig: ProductConfigType[] = [
  {
    name: "product_type",
    label: "Product Type",
    role: "all",
    filter: "Product Type",  // Matches Attribute name in database
    subFilter: "value",      // Filter by the 'value' field
    subFilterType: "prefix", // Use prefix matching (e.g., "FR-SG" starts with "FR")
    title: "Product Type Sun Glasses, Color Contact lens, etc.",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select product type...",
    required: true,
  },
  // {
  //   label: "Last Purchase Price",
  //   name: "last_purchase_price",
  //   role: "all",
  //   filter: "Last Purchase Price",
  //   subFilter: "",
  //   title: "Last Purchase Price | 100 | 200 | 300 |...",
  //   entityName: "attribute-values",
  //   fieldName: "attribute_name",
  //   type: "text",
  //   placeholder: "Enter last purchase price...",
  //   required: true,
  // },
  {
    label: "Selling Price",
    name: "selling_price",
    role: "all",
    filter: "Selling Price",
    subFilter: "",
    title: "Selling Price | 100 | 200 | 300 |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "text",
    placeholder: "Enter selling price...",
    required: true,
  },
  {
    label: "Discount Percentage",
    name: "discount_percentage",
    role: "all",
    filter: "Discount Percentage",
    subFilter: "",
    title: "Discount Percentage | 10 | 20 | 30 |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "number",
    placeholder: "Enter discount percentage (%)",
    required: true,
  },
  {
    label: "Factory Code",
    name: "factory_code",
    role: "all",
    filter: "Factory Code",
    subFilter: "",
    title: "Factory Code is unique identifier for product | 123456789 |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "text",
    placeholder: "Enter Factory Code...",
    required: false,
  },
  {
    name: "warranty",
    label: "Warranty",
    role: "all",
    filter: "Warranty",
    subFilter: "",
    title: "Warranty | 1year | 2year | 3year |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select warranty...",
    required: false,
  },
  {
    name: "weight",
    label: "Weight",
    role: "all",
    filter: "Weight",
    subFilter: "",
    title: "Weight | 100g | 200g | 300g |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select weight...",
    required: false,
  },
  {
    name: "dimensions",
    label: "Dimensions",
    role: "all",
    filter: "Dimensions",
    subFilter: "",
    title: "Dimensions | 12mm | 13mm | 14mm |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select dimensions...",
    required: false,
  }

];

export const FrameVariantConfig: ProductConfigType[] = [
  {
    name: "frame_color",
    label: "Frame Color",
    role: "FR",
    filter: "Color",
    subFilter: "",
    title: "Frame Color | Black | White | Brown | Green |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select color...",
    required: true,
  },
  {
    name: "lens_diameter",
    label: "Lens Diameter",
    role: "all",
    filter: "Diameter",
    subFilter: "",
    title: "Lens Diameter | 12mm | 13mm | 14mm |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select diameter...",
    required: true,
  },
  {
    name: "temple_length",
    label: "Temple Length",
    role: "FR",
    filter: "Length",
    subFilter: "",
    title: "Frame Temple Length ",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select length...",
    required: true,
  },
  {
    name: "bridge_width",
    label: "Bridge Width",
    role: "FR",
    filter: "Width",
    subFilter: "",
    title: "Frame Bridge Width",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select width...",
    required: true,
  },
  {
    name: "frame_shape",
    label: "Frame Shape",
    role: "FR",
    filter: "Shape",
    subFilter: "",
    title: "Frame Shape | Circle | Oval | Square | Rectangle",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select shape...",
    required: true,
  },
  {
    name: "frame_material",
    label: "Frame Material",
    role: "FR",
    filter: "Material",
    subFilter: "",
    title: "Frame Material | Metal | Plastic | Wood | Glass",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select material...",
    required: true,
  },
  {
    name: "lens_color",
    label: "Lens Color",
    role: "all",
    filter: "Color",
    subFilter: "",
    title: "Lens Color | Brown | Green | Blue |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select lens color...",
    required: true,
  },
];

export const BaseLensVariantConfig: ProductConfigType[] = [
  {
    name: "lens_diameter",
    label: "Lens Diameter",
    role: "all",
    filter: "Diameter",
    subFilter: "",
    title: "Lens Diameter | 12mm | 13mm | 14mm |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select diameter...",
    required: true,
  },
  {
    name: "lens_color",
    label: "Lens Color",
    role: "all",
    filter: "Color",
    subFilter: "",
    title: "Lens Color | Brown | Green | Blue |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select lens color...",
    required: true,
  },
  {
    name: "lens_material",
    label: "Lens Material",
    role: "all",
    filter: "Material",
    subFilter: "",
    title: "Lens Material | Polycarbonate | CR-39 | Silicone |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select lens material...",
    required: true,
  },
  {
    name: "lens_coatings",
    label: "Lens Coatings",
    role: "all",
    filter: "Coatings",
    subFilter: "",
    title:
      "Lens Coatings | Anti-reflective | UV Protection | Scratch Resistant |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "multiCheckbox",
    placeholder: "Select coatings...",
    required: true,
  },
  {
    name: "is_active",
    label: "Is Active",
    role: "all",
    filter: "Is Active",
    subFilter: "",
    title: "Is Active | True | False",
    entityName: "",
    fieldName: "is_active",
    type: "checkbox",
    placeholder: "Is Active",
    required: false,
  },
];

// Base Lens | Stock Lenses
export const StockLensVariantConfig: ProductConfigType[] = [
  {
    name: "spherical",
    label: "SPH",
    role: "SL",
    filter: "",
    fieldName: "spherical",
    subFilter: "SL-ST",
    title: "SPH Between -20 | +20 ",
    entityName: "products",
    type: "select",
    required: true,
    options: generateLensOptions(-20, 20),
  },
  {
    name: "cylinder",
    label: "CYL",
    role: "SL",
    filter: "",
    subFilter: "SL-ST",
    title: "CYL Between -00.25 | -08.00",
    entityName: "products",
    fieldName: "cylinder",
    type: "select",
    placeholder: "Select CYL...",
    required: false,
    options: generateLensOptions(-8, -0.25),
  },
];

// Base Lens | Rx Lenses
export const RxLensVariantConfig: ProductConfigType[] = [
  {
    name: "lens_base_curve",
    label: "Lens Base Curve",
    role: "all",
    filter: "Base Curve",
    subFilter: "",  // Removed invalid subFilter - was "RX-CL" which is not a field
    title: "Lens Base Curve",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select base curve...",
    required: true,
  },
  {
    name: "addition",
    label: "ADD",
    role: "SL",
    filter: "",
    subFilter: "SL-ST",
    title: "ADD between 0.25 | 6",
    entityName: "products",
    fieldName: "addition",
    options: generateLensOptions(0.25, 6),
    type: "select",
    placeholder: "Select ADD...",
    required: false,
  },
  {
    name: "right_or_left",
    label: "Right or Left",
    role: "all",
    filter: "",
    subFilter: "",
    title: "Right or Left",
    entityName: "products",
    fieldName: "right_or_left",
    options: [
      { value: "R", label: "Right" },
      { value: "L", label: "Left" },
    ],
    type: "select",
    placeholder: "Select Right or Left...",
    required: false,
  }
];

// Base Lens | Stock Lenses + Rx Lenses
export const ContactLensVariantConfig: ProductConfigType[] = [
  {
    name: "spherical",
    label: "SPH",
    role: "SL",
    filter: "",
    fieldName: "spherical",
    subFilter: "SL-ST",
    title: "SPH Between -20 | +20 ",
    entityName: "products",
    type: "select",
    required: true,
    options: generateLensOptions(-20, 20),
  },
  {
    name: "cylinder",
    label: "CYL",
    role: "SL",
    filter: "",
    subFilter: "SL-ST",
    title: "CYL Between -00.25 | -08.00",
    entityName: "products",
    fieldName: "cylinder",
    type: "select",
    placeholder: "Select CYL...",
    required: false,
    options: generateLensOptions(-8, -0.25),
  },
  {
    name: "axis",
    label: "AXIS",
    role: "SL",
    filter: "",
    subFilter: "SL-ST",
    title: "AXIS | 0 | 1 | 2 |...",
    entityName: "products",
    fieldName: "axis",
    options: generateLensOptions(0, 180, 1, false),
    type: "select",
    placeholder: "Select AXIS...",
    required: true,
  },
  {
    name: "addition",
    label: "ADD",
    role: "SL",
    filter: "",
    subFilter: "SL-ST",
    title: "ADD between 0.25 | 6",
    entityName: "products",
    fieldName: "addition",
    options: generateLensOptions(0.25, 6),
    type: "select",
    placeholder: "Select ADD...",
    required: false,
  },
  {
    name: "lens_water_content",
    label: "Lens Water Content",
    role: "CL",
    filter: "Water Content",
    subFilter: "",
    title: "Lens Water Content | 12% | 13% | 14% |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select water content...",
    required: false,
  },
  {
    name: "replacement_schedule",
    label: "Replacement Schedule",
    role: "CL",
    filter: "Replacement Schedule",
    subFilter: "",
    title: "Replacement Schedule | Daily | Weekly | Monthly |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select schedule...",
    required: true,
  },
  {
    name: "units",
    label: "Unit",
    role: "CL",
    filter: "Unit",
    subFilter: "",
    title: "Items in box | 1piece | 2piece | 3piece |...",
    entityName: "attribute-values",
    fieldName: "attribute_name",
    type: "foreignkey",
    placeholder: "Select unit...",
    required: true,
  },

  {
    name: "expiration_date",
    label: "Expiration Date",
    role: "CL",
    filter: "Expiration Date",
    subFilter: "",
    title: "Expiration Date | YYYY-MM-DD |...",
    entityName: "",
    fieldName: "expiration_date",
    type: "date",
    placeholder: "Select Expiration Date...",
    required: true,
  },
];

export const CustomVariantMainConfig: ProductConfigType[] = [
  {
    name: "variant_type",
    label: "Custom Variant Type",  // Custom Variant Type
    role: "all",
    filter: "attributes",
    subFilter: "",
    title: "Select attribute type for custom variant",
    entityName: "attributes",
    fieldName: "name",
    type: "foreignkey",
    placeholder: "Select attribute type...",
    required: true,
    mapOnly: true,  // ✅ إظهار كل الـ attributes
  },
  {
    name: "product_type",
    label: "Product Type",
    role: "all",
    filter: "product_type",
    subFilter: "",
    title: "Product Type",
    entityName: "product-types",
    fieldName: "name",
    type: "foreignkey",
    placeholder: "Select product type...",
    required: true,
    mapOnly: true,  // ✅ إظهار كل الـ product types
  },
];

export const CustomVariantConfig: ProductConfigType[] = [
  {
    name: "attribute",
    label: "Attribute",
    role: "all",
    filter: "attributes",  // Changed to match selectRelatedData
    subFilter: "",
    title: "Select any attribute",
    entityName: "attributes",
    fieldName: "name",
    type: "foreignkey",
    placeholder: "Select attribute...",
    required: true,
    mapOnly: true,  // Show all attributes without filtering
  },
  {
    name: "value",
    label: "Value",
    role: "all",
    filter: "attribute-values",  // Changed to match selectRelatedData default
    subFilter: "",
    title: "Select attribute value",
    entityName: "attribute-values",
    fieldName: "value",  // Changed to use 'value' field for label
    type: "foreignkey",
    placeholder: "Select value...",
    required: true,
    mapOnly: true,  // Show all values - filtering should be done dynamically based on selected attribute
  },
];

export const veriantConfig = (variant_type: string) => {
  let config: any[] = [];
  switch (variant_type) {
    case "basic":
      config = BasicVariantConfig;
      break;
    case "frames":
      config = [...BasicVariantConfig, ...FrameVariantConfig];
      break;
    case "stockLenses":
      config = [
        ...BasicVariantConfig,
        ...StockLensVariantConfig,
        ...BaseLensVariantConfig,

      ];
      break;
    case "rxLenses":
      config = [
        ...BasicVariantConfig,
        ...RxLensVariantConfig,
        ...BaseLensVariantConfig,

      ];
      break;
    case "contactLenses":
      config = [
        ...BasicVariantConfig,
        ...ContactLensVariantConfig,
        ...BaseLensVariantConfig,

      ];
      break;
    case "custom":
      config = BasicVariantConfig;
      break;
    default:
      config = [];
      break;
  }
  return config;
};
