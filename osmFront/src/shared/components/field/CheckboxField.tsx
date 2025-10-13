// CheckboxField.tsx
import { useProductFormStore } from "../../../features/product/store/useProductFormStore";

interface CheckboxFieldProps {
  data: any[]; // options
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  item: any;
  variantNumber?: number | undefined;
}

export const CheckboxField = ({
  data = [],
  register,
  errors,
  watch,
  setValue,
  item,
  variantNumber,
}: CheckboxFieldProps) => {
  const { setShowModal, setEntityName, setCurrentFieldName, setVariantField } = useProductFormStore();

  // console.log("data:", data);
  // console.log("isArray:", Array.isArray(data));
  // console.log("first item:", data?.[0]);
  // console.log("item.filter:", item.filter);
  
  // const filter = Array.isArray(data)
  //   ? data.filter((v: any) => {
  //       console.log("v:", v);
  //       return v.attribute_name === item.filter;
  //     })
  //   : [];
  // console.log("filter result:", filter);
  
  const registerName = variantNumber !== undefined ? `variants.${variantNumber}.${item.name}` : item.name;

  const selectedValues: string[] = watch(registerName) || [];

  const handleChange = (value: string) => {
    const updated = selectedValues.includes(value) ? selectedValues.filter((v) => v !== value) : [...selectedValues, value];
    setValue(registerName, updated, { shouldValidate: true });
    if (typeof variantNumber === "number") {
      setVariantField(variantNumber, item.name, updated);
    }
  };

  const handleClick = (entity: string, fieldName: string) => {
    setEntityName(entity);
    setCurrentFieldName(fieldName);
    setShowModal(true);
  };

  return (
    <div className="mb-4">
      {/* <label className="block text-sm font-medium text-gray-700 mb-2">
        {item.filter}
      </label> */}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">

          {data.length === 0 && (
            <div className="flex items-center space-x-2">
              <input
                id={item.name}
                type="checkbox"
                {...register(item.name)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={item.name} className="label">
                {item.label}
              </label>
            </div>
          )}

          {Array.isArray(data) && data.map((opt: any) => (
            <label key={opt.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={opt.id}
                checked={selectedValues.includes(opt.id)}
                onChange={() => handleChange(opt.id)}
                className="cursor-pointer"
              />
              {opt.value}
            </label>
          ))}
        </div>
      </div>

      {errors && errors[registerName] && (
        <p className="text-red-500 text-sm mt-1">{errors[registerName]?.message}</p>
      )}
    </div>
  );
};
