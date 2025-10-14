// SelcetField.tsx
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import customStyles from '@/src/shared/constants/customStyles';

interface SelcetFieldProps {
  control: any;
  parsedOptions: any[];
  item: any;
  setVariantField: any;
  openVariantIndex: any;
  variantNumber?: number | undefined;
  errors?: any;
}

export const SelcetField = (props: SelcetFieldProps) => {
  const { control, parsedOptions, item, setVariantField, openVariantIndex, variantNumber, errors } = props;
  const registerName = variantNumber !== undefined ? `variants.${variantNumber}.${item.name}` : item.name;
  return (
    <div>
      <Controller
        name={registerName as any}
        control={control}
        rules={{
          required: item.required ? `${item.label || item.name} is required` : false,
        }}
        render={({ field, fieldState }) => (
          <>

            <ReactSelect
              inputId={registerName}
              options={parsedOptions}
              defaultValue={null}
              onChange={(opt) => {
                const value = (opt as any)?.value ?? null;
                field.onChange(value);

                // only set variant store if variantNumber isn't undefined
                if (typeof variantNumber === "number") {
                  setVariantField(variantNumber, item.name, value);
                }
              }}
              onBlur={field.onBlur}
              value={parsedOptions.find((o) => o.value === field.value) || null}
              styles={customStyles}
              placeholder={item.placeholder || "Select..."}
              isClearable
            />

            {fieldState.error && (
              <p className="text-sm text-red-500 mt-1">
                         <p>{registerName}</p>   {fieldState.error.message}
              </p>

            )}


            {/* {errors && errors[registerName] && (
              <p className="text-red-500 text-sm mt-1">{errors[registerName]?.message}</p>
            )} */}
          </>
        )}
      />
    </div>
  );
};
