import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import customStyles from '@/src/shared/constants/customStyles';
interface SelcetFieldProps {
  control: any;
  parsedOptions: any[];
  item: any;
  setVariantField: any;
  openVariantIndex: any;
}

export const SelectField = (props: SelcetFieldProps) => {
  const { control, parsedOptions, item, setVariantField, openVariantIndex } = props;
  console.log(item)
  return (
    <div>
      <Controller
        name={item.name as any}
        control={control}
        rules={{
          required: item.required ? `${item.label || item.name} is required` : false,
        }}

        render={({ field, fieldState }) => (
          <>
            <ReactSelect
              inputId={item.name}
              options={parsedOptions}
              onChange={(opt) => {
                field.onChange((opt as any)?.value)
                
                setVariantField(openVariantIndex!, item.name, (opt as any)?.value)
              }}
              onBlur={field.onBlur}
              value={parsedOptions.find((o) => o.value === field.value) || null}
              styles={customStyles}
              placeholder={item.placeholder || "Select..."}
              isClearable
            />
            {fieldState.error && (
              <p className="text-sm text-red-500 mt-1">
                {fieldState.error.message}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
};
