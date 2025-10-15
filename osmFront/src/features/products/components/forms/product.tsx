import { ProductForginKeyConfigType } from "@/src/features/product/types";
import { RenderForm } from "../RenderForm";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { ProductTypeEnum, VARIANT_TYPE_CHOICES } from "@/src/features/products/constants";

const ProductForm = () => {
    const form = useApiForm({ alias: "products_products_create" });

        const productType = form.watch("type");
    return (
        <div>
            <h1>Product Form</h1>
            <RenderForm
                filteredConfig={ProductConfig}
                control={form.control}
                register={form.register}
                errors={form.errors}
                setValue={form.setValue}
                watch={form.watch}
                selectedType={productType}
                variantNumber={undefined} // product-level
            />
        </div>
    );
};



// export const ProductConfig: Record<string, ProductForginKeyConfigType> = {
export const ProductConfig: ProductForginKeyConfigType[] = [

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
    name: "category_id",
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
    name: "supplier_id",
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
    name: "manufacturer_id",
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
    name: "brand_id",
    label: "Brand",
    role: "all",
    filter: "brands",
    title: "Select Brand | Brand Name",
    entityName: "brands",
    fieldName: "name",
    type: "foreignkey",
    required: true,
    mapOnly: true,
  },
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
    options: ProductTypeEnum,
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
    name: "is_active",
    label: "Is Active",
    role: "all",
    filter: "Is Active",
    subFilter: "",
    title: "Is Active | True | False",
    entityName: "",
    fieldName: "is_active",
    type: "checkbox",
    placeholder: "Select Is Active...",
    required: false,
    
  },
]
