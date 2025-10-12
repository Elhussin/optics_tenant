type CheckboxGroupOption = {
  label: string;
  value: string;
};

type CheckboxField = {
  name: string;       
  label: string;        
  options: CheckboxGroupOption[]; 
};
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";

interface CheckboxFieldProps {
  data: CheckboxField[];
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  item: any;
}
import { useProductFormStore } from "@/src/features/product/store/useProductFormStore";

export const CheckboxField = ({
  data,
  register,
  errors,
  watch,
  setValue,
  item
}: CheckboxFieldProps) => {


  const selectedValues: string[] = watch(item.name) || [];

  const handleChange = (value: string) => {
    const updated = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    setValue(item.name, updated, { shouldValidate: true });
  };

  const { setShowModal, setEntityName, setCurrentFieldName } = useProductFormStore();
  const handleClick = (entity: string, fieldName: string) => {
    setEntityName(entity);
    setCurrentFieldName(fieldName);
    setShowModal(true);
  };

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {item.filter}
        </label>

        
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {data.map((opt: any) => (
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
          <div className="flex items-center">
            <ActionButton
              onClick={() => handleClick(item.entityName, item.name)}
              variant="outline"
              className="px-3 py-2 whitespace-nowrap"
              icon={<CirclePlus size={18} color="green" />}
              title={`Add ${item.filter}`}
            />
          </div>
        </div>

        {errors[item.name] && (
          <p className="text-red-500 text-sm mt-1">{errors[item.name]?.message}</p>
        )}
      </div>

    </>
  );
};
