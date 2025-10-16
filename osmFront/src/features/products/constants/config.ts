import { ProductConfigType } from "@/src/features/products/types";



export const PRODUCT_TYPE_CHOICES = [
    { value: "CL", label: "Contact Lens" },
    { value: "SL", label: "Spectacle Lens" },
    { value: "FR", label: "Frames" },
    { value: "AX", label: "Accessories" },
    { value: "DV", label: "Devices" },
    { value: "OT", label: "Other" }
]

export const VARIANT_TYPE_CHOICES = [
    { value: "basic", label: "Basic" , role:"all"},
    { value: "frames", label: "Frames" ,role:"FR"},
    { value: "stockLenses", label: "Stock Lenses" ,role:"SL"},
    { value: "rxLenses", label: "Rx Lenses" ,role:"SL"},
    { value: "contactLenses", label: "Contact Lenses" ,role:"CL"},
    { value: "custom", label: "Custom" ,role:"all"}
]

export const ProductConfig: ProductConfigType[] = [

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
        name: "category",
        label: "Category",
        role: "all",
        filter: "categories",
        title: "Select Main Category",
        subFilter: "",
        entityName: "categories",
        fieldName: "name",
        type: "foreignkey",
        placeholder: "Select Category...",
        required: true,
        mapOnly: true,

    },
    {
        name: "supplier",
        label: "Supplier",
        role: "all",
        filter: "suppliers",
        title: "Select Supplier | Supplier Name",
        entityName: "suppliers",
        fieldName: "name",
        type: "foreignkey",
        placeholder: "Select Supplier...",
        required: true,
        mapOnly: true, // use to map only the data without any other data
    },
    {
        name: "manufacturer",
        label: "Manufacturer",
        role: "all",
        filter: "manufacturers",
        title: "Select Manufacturer | Manufacturer Name",
        entityName: "manufacturers",
        fieldName: "name",
        type: "foreignkey",
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
        name: "is_active",
        label: "Is Active",
        role: "all",
        filter: "Is Active",
        subFilter: "",
        title: "Is Active | True | False",
        entityName: "",
        fieldName: "is_active",
        type: "switch",
        placeholder: "Select Is Active...",
        required: false,

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
]

export const MainFieldConfig : ProductConfigType[] = [
    {
        name: "type",
        label: "Type",
        role: "all",
        filter: "Type",
        title: "Select Product Type",
        entityName: "products",
        fieldName: "type",
        type: "select",
        placeholder: "Select Product Type...",
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
        className:"w-full",
        // onChange: (value: any) => {setVariantCount(Number(value))}
    }
  ]