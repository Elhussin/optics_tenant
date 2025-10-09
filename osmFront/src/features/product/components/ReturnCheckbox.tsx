type CheckboxGroupOption = {
  label: string;
  value: string;
};

type CheckboxField = {
  name: string;           // اسم الحقل (مثلاً colors)
  label: string;          // عنوان القسم (مثلاً اختر الألوان)
  options: CheckboxGroupOption[]; // قائمة الخيارات
};

export const ReturnCheckbox = ({
  data,
  register,
  errors,
  watch,
  setValue,
}: {
  data: CheckboxField[];
  register: any;
  errors: any;
  watch: any;
  setValue: any;
}) => {

  console.log("CheckboxGroupOption",data)
  return (
    <>
      {data.map((field, i) => {
        const selectedValues: string[] = watch(field.name) || [];

        const handleChange = (value: string) => {
          const updated = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
          setValue(field.name, updated, { shouldValidate: true });
        };

        return (
          <div key={i} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>

            <div className="space-y-1">
              {field.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={selectedValues.includes(opt.value)}
                    onChange={() => handleChange(opt.value)}
                    className="cursor-pointer"
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        );
      })}
    </>
  );
};
