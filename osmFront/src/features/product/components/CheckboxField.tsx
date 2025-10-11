type CheckboxGroupOption = {
  label: string;
  value: string;
};

type CheckboxField = {
  name: string;           // اسم الحقل (مثلاً colors)
  label: string;          // عنوان القسم (مثلاً اختر الألوان)
  options: CheckboxGroupOption[]; // قائمة الخيارات
};
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";

interface CheckboxFieldProps {
  data: CheckboxField[];
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  label: string;
  name: string;
  entityName: string;
  setShowModal: any;
  setCurrentFieldName: any;
  setEntity: any;
}


export const CheckboxField = ({
  data,
  register,
  errors,
  watch,
  setValue,
  label,
  name,
  entityName,
  setShowModal,
  setCurrentFieldName,
  setEntity,
}: CheckboxFieldProps) => {


  const selectedValues: string[] = watch(name) || [];

  const handleChange = (value: string) => {
    const updated = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    setValue(name, updated, { shouldValidate: true });
  };

  const handleClick = (entity: string, fieldName: string) => {
    setEntity(entity);
    setCurrentFieldName(fieldName);
    setShowModal(true);
  };

  return (
    <>
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    {label}
  </label>

  {/* صف رئيسي: الشبكة + الزر */}
  <div className="flex items-start justify-between gap-2">
    {/* الشبكة تأخذ كامل المساحة */}
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

    {/* الزر صغير بالنهاية */}
    <div className="flex items-center">
      <ActionButton
        onClick={() => handleClick(entityName, name)}
        variant="outline"
        className="px-3 py-2 whitespace-nowrap"
        icon={<CirclePlus size={18} color="green" />}
        title={`Add ${label}`}
      />
    </div>
  </div>

  {errors[name] && (
    <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
  )}
</div>

    </>
  );
};


{/* {config.map((field: any, i: any) => {
        const selectedValues: string[] = watch(field.name) || [];

        const handleChange = (value: string) => {
          const updated = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
          setValue(field.name, updated, { shouldValidate: true });
        }; */}

{/* return ( */ }