import React, { useEffect ,useState} from 'react';
import { useApiForm } from '@/src/shared/hooks/useApiForm';
import { safeToast } from "@/src/shared/utils/toastService";
import { Loading } from '@/src/shared/components/ui/loding';
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { ProductForginKeyConfig, ProductConfig } from '@/src/features/product/constants';
import { useProductRelations } from '@/src/features/product/hooks/useProductRelations';
import { RenderForm } from './RenderForm';
import { SelcetField } from "./SelcetField";
export default function ProductVariantForm({ alias, title, message, submitText, id, isView = false, className = "", }: any) {
  const [showModal, setShowModal] = useState(false);
  const [entity, setEntity] = useState<string>("");
  const [attributes, setAttributes] = useState<any[]>([]);
  const [currentFieldName, setCurrentFieldName] = useState('');

  const updateProductVariant = useApiForm({ alias: "products_product-variants_update" });
  const { register, handleSubmit, setValue, getValues, submitForm, errors, isSubmitting, reset, control, watch } = useApiForm({ alias: "products_products_create" });
  const { data, isLoading } = useProductRelations();
    const [varientCount, setVarientCount] = useState(1);
  const [isProduct, setIsProduct] = useState(true);
  const [isVariant, setIsVariant] = useState(false);
  const [openVariantIndex, setOpenVariantIndex] = useState<number | null>(null);


  const wactProductType = watch(["type", "brand_id", "model"]);
  const isIncomplete = wactProductType.some((v) => !v); // يتحقق إن فيه قيمة فاضية
  const selectedType = watch("type");
  const selectedProductType = watch("product_type_id");

  const filteredConfig = ProductConfig.filter(item => {
    return item.role === "all" || item.role === selectedType;
  });

  const onSubmit = async (data: any) => {
    console.log("first", data);
    const productPayload = {
      name: data.name,
      type: data.type,
      category_id: data.category_id,
      supplier_id: data.supplier_id,
      manufacturer_id: data.manufacturer_id,
      brand_id: data.brand_id,
      model: data.model,
      description: data.description,
    };

    const variantPayload = {
      product_id: data.product_id || '',
      sku: data.sku,
      // usku: data.usku,
      frame_shape_id: data.frame_shape_id,
      frame_material_id: data.frame_material_id,
      frame_color_id: data.frame_color_id,
      temple_length_id: data.temple_length_id,
      bridge_width_id: data.bridge_width_id,

      lens_diameter_id: data.lens_diameter_id,
      lens_color_id: data.lens_color_id,
      lens_material_id: data.lens_material_id,
      lens_base_curve_id: data.lens_base_curve_id,
      lens_coatings_id: data.lens_coatings_id,

      lens_water_content_id: data.lens_water_content_id,
      replacement_schedule_id: data.replacement_schedule_id,
      expiration_date: data.expiration_date,

      product_type_id: data.product_type_id,
      spherical: data.spherical,
      cylinder: data.cylinder,
      axis: data.axis,
      addition: data.addition,
      unit_id: data.unit_id,

      warranty_id: data.warranty_id,
      weight_id: data.weight_id,
      dimensions_id: data.dimensions_id,


      last_purchase_price: data.last_purchase_price,
      selling_price: data.selling_price,
      discount_percentage: data.discount_percentage,
    };

    const FinalData = { ...productPayload, variants: [variantPayload] };
    console.log("Sending payload:", FinalData);

    try {
      let result;
      if (id) {
        result = await updateProductVariant.mutation.mutateAsync(FinalData);
      } else {
        result = await submitForm(FinalData);  // ✅ مهم إرسال FinalData وليس data
      }

      console.log(result);

      if (result?.success) {
        // reset();
        safeToast("Saved successfully", { type: "success" });
        reset(result.data);
      }
    } catch (err: any) {
      console.log(err);
      safeToast(err.message || "Server error", { type: "error" });
    }
  };

  const toggleVariant = () => {
    setIsVariant(!isVariant);
  };



  const toggleVariantOptions = (index: number) => {
    // إذا نفس index مضغوط مسبقاً نغلقه، وإلا نفتحه
    console.log(index);
    setOpenVariantIndex(prev => (prev === index ? null : index));
  };
  if (isLoading) return <Loading />;

  const TypeEnum = [{ value: "", label: "select..." }, { value: "CL", label: "Contact Lens" }, { value: "SL", label: "Spectacle Lens" }, { value: "FR", label: "Frames" }, { value: "AX", label: "Accessories" }, { value: "DV", label: "Devices" }, { value: "OT", label: "Other" }]


  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* type */}

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label>Type</label>
            <SelcetField
              fieldName={"type"}
              // label={"Type"}
              options={TypeEnum}
              required={true}
              control={control}
            />
          </div>
          <div>
            <label>Variant Count</label>
            <input className="input-text" type="number" value={varientCount} onChange={(e) => setVarientCount(Number(e.target.value),)} />
          </div>
        </div>
        {selectedType && isProduct && (
          <RenderForm
            filteredConfig={filteredConfig}
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            data={data}
            submitForm={submitForm}
            selectedType={selectedType}
            isSubmitting={isSubmitting}
            setShowModal={setShowModal}
            setEntity={setEntity}
            setCurrentFieldName={setCurrentFieldName}
          />
        )}



        {isVariant &&
          Array.from({ length: varientCount }).map((_, i) => (
            <div key={i}>
            <h2
              className='font-bold border-b-2 border-gray-200 mb-1 p-1 cursor-pointer'
              onClick={() => toggleVariantOptions(i)}
            >
              Variant {i + 1}
            </h2>
            {openVariantIndex === i && (
              <RenderForm
                key={i}
                filteredConfig={ProductForginKeyConfig}
                control={control}
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
                data={data}
                submitForm={submitForm}
                selectedType={selectedType}
                // isSubmitting={isSubmitting}
                // setShowModal={setShowModal}
                // setEntity={setEntity}
                // setCurrentFieldName={setCurrentFieldName}
              />
            )}
            </div>
          ))
        }
        <div className="flex gap-3 pt-4">
          {isVariant && isProduct && (

            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            // disabled={mode === 'edit' && fieldName === 'email'||mode === 'edit' && fieldName === 'username'||mode === 'edit' && fieldName === 'password'}

            >
              {isSubmitting ? 'Saving...' : submitText}
            </button>

          )}
          <button
            type="button"
            onClick={() => toggleVariant()}
            disabled={isIncomplete}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${isIncomplete
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            {isVariant ? "Back" : "Next"}
          </button>



        </div>




      </form>

      {showModal && (
        <DynamicFormDialog
          entity={entity}
          onClose={(data: any) => {
            setShowModal(false);
            if (data) {
              // fetchAttributes.refetch();
              setAttributes((prev) => [data, ...prev]);
              // هنا نستخدم الاسم الصحيح للحقل الذي تم اختياره
              setValue(currentFieldName, String(data.id));
            }


          }}
          title="Add Attribute Value"
        />
      )}

    </div>

  );
}


// <div className={`${className}`}>
// <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
// {/* type */}
// <div className="mb-4">
// <SelcetField
//   fieldName={"type"}
//   label={"Type"}
//   options={TypeEnum}
//   required={true}
//   control={control}
// />
// </div>

//   {/* forign key */}
//   <div className="grid  grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
//     {filteredConfig.map((item: any, index: number) => (
//       <ForeignKeyField
//         key={index}
//         name={item.name}
//         filter={item.filter}
//         hent={item.hent}
//         data={parsedOptions(selectRelatedData(data, item.filter), item.filter, item.mapOnly, item.fieldName)}
//         control={control}
//         setShowModal={setShowModal}
//         setEntity={setEntity}
//         entityName={item.entityName}
//         setCurrentFieldName={setCurrentFieldName}
//       />
//     ))}
//   </div>

//   {/* text field */}
//   <div className="grid  grid-cols-1 md:grid-cols-2 gap-2">
//   <ReturnTextField
//     data={TEXTFIELDDATA}
//     register={register}
//     errors={errors}

//   />
//   </div>

//   {/* lens */}
//   {selectedType && (selectedType === "CL" || selectedType === "SL") && (
//     <div className="flex flex-wrap items-center gap-2">
//       {select.map((item: any, index: number) => (
//         <SelcetField
//           key={index}
//           fieldName={item.name}
//           label={item.label}
//           options={item.options}
//           required={item.required}
//           control={control}
//           placeholder={item.name === "axis" ? "0" : "+00.00"}
//         />
//       ))}
//     </div>


//   )}

//   {/* lens Coting */}
//   {selectedType && (selectedType === "SL") && (
//     <>
//       {checkBoxConfig.map((item: any, index: number) => (
        // <CheckboxField
        //   key={index}
        //   data={data.attributes.filter((v: any) => v.attribute_name === item.filter)}
        //   register={register}
        //   errors={errors}
        //   watch={watch}
        //   setValue={setValue}
        //   name={item.name}
        //   label={item.filter}
        //   entityName={item.entityName}
        //   setShowModal={setShowModal}
        //   setCurrentFieldName={setCurrentFieldName}
        //   setEntity={setEntity}
        // />
//       ))}

//     </>
//   )}



//   <div className="flex gap-3 pt-4">
//     <button
//       type="submit"
//       disabled={isSubmitting}
//       className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
//     // disabled={mode === 'edit' && fieldName === 'email'||mode === 'edit' && fieldName === 'username'||mode === 'edit' && fieldName === 'password'}

//     >
//       {isSubmitting ? 'Saving...' : submitText}
//     </button>
//   </div>
// </form>

// {showModal && (
//   <DynamicFormDialog
//     entity={entity}
//     onClose={(data: any) => {
//       setShowModal(false);
//       if (data) {
//         // fetchAttributes.refetch();
//         setAttributes((prev) => [data, ...prev]);
//         // هنا نستخدم الاسم الصحيح للحقل الذي تم اختياره
//         setValue(currentFieldName, String(data.id));
//       }


//     }}
//     title="Add Attribute Value"
//   />
// )}

// </div>


{/* 
      {showModal && (
        <DynamicFormDialog
          entity={entity}
          onClose={(newItem: any) => {
            setShowModal(false);

            if (newItem) {
              // نحدث قائمة البيانات فقط الخاصة بالكيان الحالي
              setData((prev) => ({
                ...prev,
                [entity]: [newItem, ...prev[entity]],
              }));

              // نعين القيمة الجديدة داخل الفورم
              setValue(currentFieldName, String(newItem.id));
            }
          }}
          title={`Add ${entity}`}
      //   />
      // )} */}
      // import React, { useReducer } from 'react';
      // import { useApiForm } from '@/src/shared/hooks/useApiForm';
      // import { safeToast } from "@/src/shared/utils/toastService";
      // import { Loading } from '@/src/shared/components/ui/loding';
      // import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
      // import { ProductForginKeyConfig, ProductConfig } from '@/src/features/product/constants';
      // import { useProductRelations } from '@/src/features/product/hooks/useProductRelations';
      // import { RenderForm } from './Form';
      // import { SelcetField } from "./SelcetField";
      

      // // ----------------- Main Component -----------------
      // export default function ProductVariantForm({ alias, title, message, submitText, id, className = "" }: any) {
      //   const { isVariant, variantCount, openVariantIndex, toggleVariant, setVariantCount } = useProductFormStore();

      //   const updateProductVariant = useApiForm({ alias: "products_product-variants_update" });
      //   const { register, handleSubmit, setValue, submitForm, errors, isSubmitting, reset, control, watch } = useApiForm({ alias: "products_products_create" });
      //   const { data, isLoading } = useProductRelations();
      
      //   const selectedType = watch("type");
      //   const filteredConfig = ProductConfig.filter(item => item.role === "all" || item.role === selectedType);
      //   const watchProductType = watch(["type", "brand_id", "model"]);
      //   const isIncomplete = watchProductType.some(v => !v);

      //   const TypeEnum = [
      //     { value: "", label: "select..." },
      //     { value: "CL", label: "Contact Lens" },
      //     { value: "SL", label: "Spectacle Lens" },
      //     { value: "FR", label: "Frames" },
      //     { value: "AX", label: "Accessories" },
      //     { value: "DV", label: "Devices" },
      //     { value: "OT", label: "Other" }
      //   ];
      
      //   // ----------------- Submit Handler -----------------
      //   const onSubmit = async (formData: any) => {
      //     // ----------------- Main Product Payload -----------------
      //     const productPayload = {
      //       name: formData.name,
      //       type: formData.type,
      //       category_id: formData.category_id,
      //       supplier_id: formData.supplier_id,
      //       manufacturer_id: formData.manufacturer_id,
      //       brand_id: formData.brand_id,
      //       model: formData.model,
      //       description: formData.description,
      //     };
      
      //     // ----------------- Variants Payload -----------------
      //     const variantsPayload = Array.from({ length: variantCount }).map((_, i) => ({
      //       product_id: formData.product_id || '',
      //       sku: formData?.variants?.[i]?.sku,
      //       frame_shape_id: formData?.variants?.[i]?.frame_shape_id,
      //       frame_material_id: formData?.variants?.[i]?.frame_material_id,
      //       frame_color_id: formData?.variants?.[i]?.frame_color_id,
      //       temple_length_id: formData?.variants?.[i]?.temple_length_id,
      //       bridge_width_id: formData?.variants?.[i]?.bridge_width_id,
      //       lens_diameter_id: formData?.variants?.[i]?.lens_diameter_id,
      //       lens_color_id: formData?.variants?.[i]?.lens_color_id,
      //       lens_material_id: formData?.variants?.[i]?.lens_material_id,
      //       lens_base_curve_id: formData?.variants?.[i]?.lens_base_curve_id,
      //       lens_coatings_id: formData?.variants?.[i]?.lens_coatings_id,
      //       lens_water_content_id: formData?.variants?.[i]?.lens_water_content_id,
      //       replacement_schedule_id: formData?.variants?.[i]?.replacement_schedule_id,
      //       expiration_date: formData?.variants?.[i]?.expiration_date,
      //       product_type_id: formData?.variants?.[i]?.product_type_id,
      //       spherical: formData?.variants?.[i]?.spherical,
      //       cylinder: formData?.variants?.[i]?.cylinder,
      //       axis: formData?.variants?.[i]?.axis,
      //       addition: formData?.variants?.[i]?.addition,
      //       unit_id: formData?.variants?.[i]?.unit_id,
      //       warranty_id: formData?.variants?.[i]?.warranty_id,
      //       weight_id: formData?.[i]?.weight_id,
      //       dimensions_id: formData?.variants?.[i]?.dimensions_id,
      //       last_purchase_price: formData?.variants?.[i]?.last_purchase_price,
      //       selling_price: formData?.variants?.[i]?.selling_price,
      //       discount_percentage: formData?.variants?.[i]?.discount_percentage,
        
        
        
        
          
      //     }));
        

      
      //     const finalPayload = { ...productPayload, variants: variantsPayload };
      //     console.log("Final Payload:", finalPayload);
      
      //     try {
      //       let result;
      //       if (id) {
      //         result = await updateProductVariant.mutation.mutateAsync(finalPayload);
      //       } else {
      //         result = await submitForm(finalPayload);
      //       }
      
      //       if (result?.success) {
      //         safeToast("Saved successfully", { type: "success" });
      //         reset(result.data);
      //       }
      //     } catch (err: any) {
      //       safeToast(err.message || "Server error", { type: "error" });
      //     }
      //   };
      
      //   if (isLoading) return <Loading />;
      
      //   return (
      //     <div className={className}>
      //       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      //         {/* Type & Variant Count */}
      //         <div className="mb-4 grid grid-cols-2 gap-4">
      //           <div>
      //             <label>Type</label>
      //             <SelcetField fieldName="type" options={TypeEnum} required control={control} />
      //           </div>
      //           <div>
      //             <label>Variant Count</label>
      //             <input
      //               className="input-text"
      //               type="number"
      //               value={variantCount}
      //               onChange={(e) => dispatch({ type: 'SET_VARIANT_COUNT', payload: Number(e.target.value) })}
      //             />
      //           </div>
      //         </div>
      
      //         {/* Main Product Form */}
      //         {selectedType && isProduct && (
      //           <RenderForm
      //             filteredConfig={filteredConfig}
      //             control={control}
      //             register={register}
      //             errors={errors}
      //             setValue={setValue}
      //             watch={watch}
      //             isVariant={false}
      //             setShowModal={() => dispatch({ type: 'TOGGLE_MODAL' })}
      //             setEntity={(entity) => dispatch({ type: 'SET_ENTITY', payload: entity })}
      //             setCurrentFieldName={(field) => dispatch({ type: 'SET_CURRENT_FIELD', payload: field })}
      //           />
      //         )}
      
      //         {/* Variants Forms */}
      //         {isVariant &&
      //           Array.from({ length: variantCount }).map((_, i) => (
      //             <div key={i}>
      //               <h2
      //                 className="font-bold border-b-2 border-gray-200 mb-1 p-1 cursor-pointer"
      //                 onClick={() => dispatch({ type: 'SET_OPEN_VARIANT_INDEX', payload: openVariantIndex === i ? null : i })}
      //               >
      //                 Variant {i + 1}
      //               </h2>
      //               {openVariantIndex === i && (
      //                 <RenderForm
      //                   key={i}
      //                   filteredConfig={ProductForginKeyConfig}
      //                   control={control}
      //                   register={register}
      //                   errors={errors}
      //                   setValue={setValue}
      //                   watch={watch}
      //                   isVariant={true}
      //                   variantIndex={i}
      //                   setShowModal={() => dispatch({ type: 'TOGGLE_MODAL' })}
      //                   setEntity={(entity) => dispatch({ type: 'SET_ENTITY', payload: entity })}
      //                   setCurrentFieldName={(field) => dispatch({ type: 'SET_CURRENT_FIELD', payload: field })}
      //                 />
      //               )}
      //             </div>
      //           ))}
      
      //         {/* Buttons */}
      //         <div className="flex gap-3 pt-4">
      //           {isVariant && isProduct && (
      //             <button
      //               type="submit"
      //               disabled={isSubmitting}
      //               className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      //             >
      //               {isSubmitting ? 'Saving...' : submitText}
      //             </button>
      //           )}
      //           <button
      //             type="button"
      //             onClick={() => dispatch({ type: 'TOGGLE_IS_VARIANT' })}
      //             disabled={isIncomplete}
      //             className={`px-6 py-2 rounded-md font-medium transition-colors ${
      //               isIncomplete ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
      //             }`}
      //           >
      //             {isVariant ? "Back" : "Next"}
      //           </button>
      //         </div>
      //       </form>
      
      //       {/* Modal */}
      //       {showModal && (
      //         <DynamicFormDialog
      //           entity={entity}
      //           onClose={(data: any) => {
      //             dispatch({ type: 'TOGGLE_MODAL' });
      //             if (data) {
      //               dispatch({ type: 'ADD_ATTRIBUTE', payload: data });
      //               setValue(currentFieldName, String(data.id));
      //             }
      //           }}
      //           title="Add Attribute Value"
      //         />
      //       )}
      //     </div>
      //   );
      // }
      