import React, { useEffect } from 'react';
import { schemas } from '@/src/shared/api/schemas';
import { useApiForm } from '@/src/shared/hooks/useApiForm';
import { safeToast } from "@/src/shared/utils/toastService";
import { useFilteredListRequest } from '@/src/shared/hooks/useFilteredListRequest';
import { Loading } from '@/src/shared/components/ui/loding';
import { FilterOtian } from "./FilterOtian";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { relationshipConfigs } from '@/src/features/formGenerator/constants/generatFormConfig';
import { ProductVariantForginKey ,TEXTFIELDDATA} from '@/src/features/product/constants';

export default function ProductVariantForm({ alias, title, message, submitText, id, isView = false, className = "", }: any) {
  const [showModal, setShowModal] = React.useState(false);
  const [entity, setEntity] = React.useState<string>("");
  const [attributes, setAttributes] = React.useState<any[]>([]);
  const [currentFieldName, setCurrentFieldName] = React.useState('');
  const relationConfig = relationshipConfigs[currentFieldName];
  const updateProductVariant = useApiForm({ alias: "products_product-variants_update" });
  const { register, handleSubmit, setValue, getValues, submitForm, errors, isSubmitting, reset, control } = useApiForm({ alias: alias });

const fetchAttributes = useFilteredListRequest({ alias: "products_attribute_values_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
  const fetchSuppliers = useFilteredListRequest({ alias: "products_suppliers_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
  const fetchManufacturers = useFilteredListRequest({ alias: "products_manufacturers_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
  const fetchBrands = useFilteredListRequest({ alias: "products_brands_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
  const category = useFilteredListRequest({ alias: "products_categories_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
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

  console.log(fetchAttributes);
  if (!fetchAttributes.data  ) return <Loading />;
  // ||fetchSuppliers.data ||fetchManufacturers.data ||fetchBrands.data
      const ReturnFilterOtian = ({ data }: { data: any[] }) => {
        return (
          <>
            {ProductVariantForginKey.map((item, index) => (
              <FilterOtian
                key={index}
                name={item.name}
                filter={item.filter}
                hent={item.hent}
                data={data}
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
      
  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/*  */}
        <ReturnFilterOtian data={fetchSuppliers.data}/>
        <ReturnFilterOtian data={fetchManufacturers.data}/>
        <ReturnFilterOtian data={fetchBrands.data}/>
        <ReturnFilterOtian data={fetchAttributes.data}/>

        <ReturnTextField 
          data={TEXTFIELDDATA}
          register={register}
          errors={errors}

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
              fetchAttributes.refetch();
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


const ReturnTextField = ({ data,register ,errors }: { data: any[],register:any,errors:any  }) => {
  return (
    <>
      {data.map((item, index) => (
        <div className="mb-4">
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

const ReturnCheckbox = ({ data, register, errors }: { data: any[], register: any, errors: any }) => {
  return (
    <>
      {data.map((item, index) => (
        <div className="mb-4">
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



export   const TEXTFIELDDATA0=[
  {"label":"Model", "name":"model" ,"type":"text"},
  {"label":"Type", "name":"type" ,"type":"text"},
  {"label":"Name", "name":"name" ,"type":"text"},
  {"label":"Sku", "name":"sku" ,"type":"text"},
  {"label":"Last purchase price", "name":"last_purchase_price" ,"type":"text"},
  {"label":"Sell price", "name":"selling_price" ,"type":"text"},
  {"label":"Discount percentage", "name":"discount_percentage" ,"type":"text"},
  

  {"label":"Description", "name":"description" ,"type":"textarea" ,"rows":5 ,"placeholder":"Description..."},

  {"label": "Is Deleted", "name": "is_deleted", type:"checkbox" ,"defaultChecked":false},
  {"label": "Is Active", "name": "is_active", type:"checkbox" ,"defaultChecked":true },
  {"label": "Lens Coatings", "name": "lens_coatings_id", type:"checkbox" ,"defaultChecked":false, options:[]},
  
] 


const select =[
  {"label":"Spherical", "name":"spherical" ,"type":"select",options:[{"value":"1","label":"1"},{"value":"2","label":"2"}]},
  {"label":"Cylinder", "name":"cylinder" ,"type":"select",options:[{"value":"1","label":"1"},{"value":"2","label":"2"}]},
  {"label":"Axis", "name":"axis" ,"type":"select",options:[{"value":"1","label":"1"},{"value":"2","label":"2"}]},
  {"label":"Addition", "name":"addition" ,"type":"select",options:[{"value":"1","label":"1"},{"value":"2","label":"2"}]},  
]

