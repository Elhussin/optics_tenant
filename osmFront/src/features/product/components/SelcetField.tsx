
import { RHFSelect } from "@/src/features/formGenerator/components/RHFSelect";

export const SelcetField = ({ fieldName, control, options, label, required=false, placeholder="Slect" }: any) => {
    return (
      <>
        {label && (
          <label htmlFor={fieldName} className="block font-medium text-sm m-1">
            {label}
            {required ? <span className="text-red-500"> *</span> : ''}
          </label>
        )}

        <RHFSelect
          name={fieldName}
          control={control}
          parsedOptions={options}
          label={label}
          required={required}
          placeholder={placeholder}
          className="flex-1" // يملأ المساحة المتبقية
        />
      </>
    )
}