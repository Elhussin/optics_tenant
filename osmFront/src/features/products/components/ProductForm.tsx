
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Package, Tag, Layers, CheckCircle } from "lucide-react";
import { Form } from "@/src/shared/components/shadcn/ui/form";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useProductFormStore } from "@/src/features/products/store/useProductFormStore";
import { useProductRelations } from "@/src/features/products/hooks/useProductRelations";
import { VariantRender } from "./VariantRender";
import {
  ProductConfig,
  MainFieldConfig,
  veriantConfig,
} from "@/src/features/products/constants/config";
import { handleSave } from "../utils/handleSave";
import { RenderFields } from "@/src/shared/components/field/RenderFields";
import { Loading } from "@/src/shared/components/ui/loding";
import { Dialog } from "./Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/shared/components/shadcn/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/shadcn/ui/card";

export const ProductForm = ({ alias, id }: { alias: string; id?: string }) => {
  // const defaultValues = {
  //   name: "",
  //   type: "",
  //   variant_type: "",
  //   variant_count: 1,
  //   is_active: true,
  //   categories_ids: [],        // ← مهم
  //   attributes_ids: [],        // ← مهم
    
  // };

  const createForm = useApiForm({
    alias: alias || "products_products_create",
    // defaultValues,
  });

  const store = useProductFormStore();
  const { isLoading } = useProductRelations();

  // Watch key fields
  const [productType, variant_type] = createForm.watch(["type", "variant_type"]);

  // Calculate completeness for steps
  const isTypeSelected = !!productType;
  const isVariantTypeSelected = !!variant_type;

  // Tabs state
  const [activeTab, setActiveTab] = useState("basic");

  // Filtered config for specific product type fields
  const filteredConfig = useMemo(() => {
    return ProductConfig.filter((item) => item.role === "all" || item.role === productType);
  }, [productType]);

  const submitText = id ? "Update Product" : "Create Product";

  // Sync variant count store
  useEffect(() => {
     // Default to 1 variant if not set or complex logic needed
     // You might want to remove strict dependency on 'variant_count' field if dynamic adding is used
     store.setVariantCount(1);
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
       <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {id ? "Edit Product" : "New Product"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Create a new product with multiple variants and attributes.
            </p>
       </div>

      <Form {...createForm}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 shadow-sm transition-all">
                 <Package className="w-4 h-4 mr-2" /> Basic Info
              </TabsTrigger>
              <TabsTrigger value="attributes" disabled={!isTypeSelected} className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 shadow-sm transition-all">
                <Tag className="w-4 h-4 mr-2" /> Specifications
              </TabsTrigger>
              <TabsTrigger value="variants" disabled={!isVariantTypeSelected} className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 shadow-sm transition-all">
                <Layers className="w-4 h-4 mr-2" /> Variants
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Basic Information */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Classification</CardTitle>
                  <CardDescription>Select the type and classification of your product.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <RenderFields fields={MainFieldConfig.filter(f => f.name === "type")} form={createForm} />
                      {productType && (
                         <RenderFields fields={MainFieldConfig.filter(f => f.name === "variant_type")} form={createForm} selectedType={productType} />
                      )}
                   </div>
                </CardContent>
              </Card>
              
               <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab("attributes")} 
                    disabled={!isTypeSelected}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next: Specifications
                  </Button>
               </div>
            </TabsContent>

            {/* Step 2: Custom Specifications */}
            <TabsContent value="attributes" className="space-y-6">
               <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>Fill in specific details for this product type.</CardDescription>
                </CardHeader>
                <CardContent>
                   <RenderFields 
                      key={productType} 
                      fields={filteredConfig} 
                      form={createForm} 
                      selectedType={productType} 
                   />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>Back</Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab("variants")} 
                    disabled={!isVariantTypeSelected}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next: Variants
                  </Button>
               </div>
            </TabsContent>

            {/* Step 3: Variants */}
            <TabsContent value="variants" className="space-y-6">
               <Card>
                <CardHeader>
                  <CardTitle>Manage Variants</CardTitle>
                  <CardDescription>Add SKU, Price, and specific attributes for each variant.</CardDescription>
                </CardHeader>
                <CardContent>
                  <VariantRender 
                    key={`${productType}-${variant_type}`} 
                    variant_type={variant_type} 
                    form={createForm} 
                    productType={productType} 
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between items-center pt-4 border-t mt-6">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("attributes")}>Back</Button>
                  
                  <Button
                    type="button"
                    onClick={() => handleSave(createForm, createForm.getValues("variants"), veriantConfig(variant_type), id)}
                    disabled={createForm.isBusy}
                    className={`min-w-[150px] bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 ${
                      createForm.isBusy ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {createForm.isBusy ? <Loader2 className="animate-spin mr-2" size={20} /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    {createForm.isBusy ? "Saving..." : submitText}
                  </Button>
               </div>
            </TabsContent>
          </Tabs>

        </form>
      </Form>
      <Dialog setValue={createForm.setValue} />
    </div>
  );
};

export default ProductForm;