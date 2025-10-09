import React, { useEffect } from 'react';
import { schemas } from '@/src/shared/api/schemas';
import { useApiForm } from '@/src/shared/hooks/useApiForm';
import { safeToast } from "@/src/shared/utils/toastService";
import { useFilteredListRequest } from '@/src/shared/hooks/useFilteredListRequest';
import { Loading } from '@/src/shared/components/ui/loding';
import { RenderForeignKeyField, parsedOptions } from "./FilterOtian";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { relationshipConfigs } from '@/src/features/formGenerator/constants/generatFormConfig';
import { ProductVariantForginKey, TEXTFIELDDATA } from '@/src/features/product/constants';
import {ReturnCheckbox} from "./ReturnCheckbox";
import index from 'swr';

export default function ProductVariantForm({ alias, title, message, submitText, id, isView = false, className = "", }: any) {
  const [showModal, setShowModal] = React.useState(false);
  const [entity, setEntity] = React.useState<string>("");
  const [attributes, setAttributes] = React.useState<any[]>([]);
  const [currentFieldName, setCurrentFieldName] = React.useState('');
  // const []
  const relationConfig = relationshipConfigs[currentFieldName];
  const updateProductVariant = useApiForm({ alias: "products_product-variants_update" });
  const { register, handleSubmit, setValue, getValues, submitForm, errors, isSubmitting, reset, control,watch } = useApiForm({ alias: alias });


  const { data, isLoading } = useProductRelations();

  console.log("related data", data)

  const onSubmit = async (data: any) => {
    try {
      let result;
      if (id) {
        result = await updateProductVariant.mutation.mutateAsync(data);

      } else {
        result = await submitForm(data);

      }

      if (result?.success) {
        reset();

        safeToast(message || "Saved successfully", { type: "success" });
        reset(result.data);
      }
    } catch (err: any) {
      safeToast(err.message || "Server error", { type: "error" });
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      <ReturnFilterOptian
        props={{
          data: data,
          filterData: ProductVariantForginKey,
          control: control,
          setShowModal: setShowModal,
          setEntity: setEntity,
          setCurrentFieldName: setCurrentFieldName
        }}
      />
        <ReturnTextField
          data={TEXTFIELDDATA}
          register={register}
          errors={errors}

        />

<ReturnCheckbox
  data={data.attributes}
  register={register}
  errors={errors}
  watch={watch}
  setValue={setValue}

/>



        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          // disabled={mode === 'edit' && fieldName === 'email'||mode === 'edit' && fieldName === 'username'||mode === 'edit' && fieldName === 'password'}

          >
            {isSubmitting ? 'Saving...' : submitText}
          </button>
        </div>
      </form>

      {showModal && (
        <DynamicFormDialog
          entity="attribute-values"
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
        />
      )} */}

    </div>
  );
}


export const ReturnTextField = ({ data, register, errors }: { data: any[], register: any, errors: any }) => {
  return (
    <>
      {data.map((item, index) => (
        <div className="mb-4" key={index}>
          <label htmlFor={item.name} className="block text-sm font-medium text-gray-700 mb-1">
            {item.label}
          </label>
          <input
            id={item.name}
            type={item.type}
            {...register(item.name)}
            className="input-text"
            placeholder={item.label + "..."}
          />
          {errors[item.name] && <p className="text-red-500 text-sm mt-1">{errors[item.name]?.message}</p>}
        </div>
      ))}
    </>
  );
}

 interface ReturnFilterOtianProps {
  data: any;
  filterData: any[];
  control: any;
  setShowModal: any;
  setEntity: any;
  setCurrentFieldName: any;
}


export const ReturnFilterOptian = ({ props }: { props: ReturnFilterOtianProps }) => {
  const { data, filterData, control, setShowModal, setEntity, setCurrentFieldName } = props;
  console.log("filterData",data)
  return (
    <>
      {filterData.map((item, index) => (
        
        <RenderForeignKeyField
          key={index}
          name={item.name}
          filter={item.filter}
          hent={item.hent}
          data={parsedOptions(selectRelatedData(data, item.filter),item.filter,item.mapOnly)}
          control={control}
          setShowModal={setShowModal}
          setEntity={setEntity}
          entityName={item.entityName}
          setCurrentFieldName={setCurrentFieldName}
        />
      ))}
    </>
  );
};





// { "label": "Is Deleted", "name": "is_deleted", type: "checkbox", "defaultChecked": false },
// { "label": "Is Active", "name": "is_active", type: "checkbox", "defaultChecked": true },
// { "label": "Lens Coatings", "name": "lens_coatings_id", type: "checkbox", "defaultChecked": false, options: [] },


function useProductRelations() {
  const fetchAttributes = useFilteredListRequest({ alias: "products_attribute_values_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
  const fetchSuppliers = useFilteredListRequest({ alias: "products_suppliers_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
  const fetchManufacturers = useFilteredListRequest({ alias: "products_manufacturers_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
  const fetchBrands = useFilteredListRequest({ alias: "products_brands_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
  const category = useFilteredListRequest({ alias: "products_categories_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });

  const isLoading =
    fetchAttributes.isLoading ||
    fetchSuppliers.isLoading ||
    fetchManufacturers.isLoading ||
    fetchBrands.isLoading ||
    category.isLoading;

  const data = {
    attributes: fetchAttributes.data || [],
    suppliers: fetchSuppliers.data || [],
    manufacturers: fetchManufacturers.data || [],
    brands: fetchBrands.data || [],
    categories: category.data || [],
  };

  return { data, isLoading };
}



function selectRelatedData(data: any, filter?: string) {
  switch (filter) {
    case "Category":
      return data.categories || [];
    case "Supplier":
      return data.suppliers || [];
    case "Manufacturer":
      return data.manufacturers || [];
    case "Brand":
      return data.brands || [];
    default:
      return data.attributes || [];
  }
}
