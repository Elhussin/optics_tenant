'use client';

import { Controller, FieldValues, Control } from 'react-hook-form';
import ReactSelect from 'react-select';
import { getFieldLabel } from '@/src/shared/utils/DynamicFormhelper';

type Option = { label: string; value: string };

type ControlledSelectProps<T extends FieldValues> = {
  name: string;
  control: Control<T>;
  label?: string;
  options: string[] | Option[];
  required?: boolean;
  placeholder?: string;
  classNamePrefix?: string;
  className?: string;
};
const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused ? (state.theme.dark ? '#374151' : 'white') : 'white',
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db', // focus ring
    borderRadius: '0.375rem',
    padding: '0.5rem 0.75rem',
    width: '100%',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
      ? state.theme.dark ? '#4b5563' : '#f3f4f6'
      : state.theme.dark ? '#374151' : 'white',
    color: state.theme.dark ? 'white' : 'black',
  }),
  menu: (provided: any) => ({
    ...provided,
    zIndex: 50,
  }),
};

export function ControlledSelect<T extends FieldValues>(props: ControlledSelectProps<T>) {

  const { name, control, label, options, required = false, placeholder = 'Select...', classNamePrefix = 'rs', className = '' } = props;

  const parsedOptions: Option[] = options.map((opt) =>
    typeof opt === 'string'
      ? { value: opt, label: getFieldLabel(opt) }
      : opt
  );
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block font-medium text-sm text-gray-700 dark:text-gray-200">
          {label}
          {required ? ' *' : ''}
        </label>
      )}

      <Controller
        name={name as any}
        control={control}
        rules={{ required: required ? `${label || name} is required` : false }}
        render={({ field, fieldState }) => (
          <>
            {/* <ReactSelect
              inputId={name}
              options={parsedOptions}
              onChange={(opt) => field.onChange((opt as Option)?.value)}
              onBlur={field.onBlur}
              value={parsedOptions.find((o) => o.value === field.value) || null}

              className={'options'}
              classNamePrefix={classNamePrefix}
              placeholder={placeholder}
              isClearable
            /> */}
            <ReactSelect
            inputId={name}
            options={parsedOptions}
            onChange={(opt) => field.onChange((opt as Option)?.value)}
            onBlur={field.onBlur}
            value={parsedOptions.find((o) => o.value === field.value) || null}
            // className="select"
            // classNamePrefix="select"   // <- هذا سيضيف select__option, select__menu, select__control ...
            placeholder={placeholder}
            isClearable
            styles={customStyles}
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
}
