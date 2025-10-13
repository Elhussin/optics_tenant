
import { useProductFormStore } from "../store/useProductFormStore";


type CheckboxGroupOption = {
  label: string;
  value: string;
};

type CheckboxField = {
  name: string;       
  label: string;        
  options: CheckboxGroupOption[]; 
};

interface CheckboxFieldProps {
  data: CheckboxField[];
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  item: any;
  openVariantIndex: any;
  setVariantField: any;
}


export const CheckboxField = ({
  data,
  register,
  errors,
  watch,
  setValue,
  item,
  openVariantIndex,
  setVariantField
}: CheckboxFieldProps) => {

  const { setShowModal, setEntityName, setCurrentFieldName  ,variants , } = useProductFormStore();
  const selectedValues: string[] = watch(item.name) || [];

  const handleChange = (value: string) => {
    const updated = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    setValue(item.name, updated, { shouldValidate: true });
    setVariantField(openVariantIndex, item.name, updated);
  };


  const handleClick = (entity: string, fieldName: string) => {
    setEntityName(entity);
    setCurrentFieldName(fieldName);
    setShowModal(true);
  };

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 border-b-2  border-gray-300" >
          {item.filter}
        </label>

        
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {data?.map((opt: any) => (
              <label key={opt.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={opt.id}
                  checked={selectedValues.includes(opt.id)}
                  onChange={() => handleChange(opt.id) }
                  className="cursor-pointer"
                />
                {opt.value}
              </label>
            ))}
          </div>    
        </div>

        {errors[item.name] && (
          <p className="text-red-500 text-sm mt-1">{errors[item.name]?.message}</p>
        )}
      </div>

    </>
  );
};
