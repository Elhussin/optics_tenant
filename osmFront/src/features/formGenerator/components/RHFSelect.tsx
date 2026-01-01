'use client';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { RHFSelectProps } from '../types';
import customStyles from '@/src/shared/constants/customStyles';


export const RHFSelect = (props: RHFSelectProps & { isMulti?: boolean }) => {
  const { name, control, parsedOptions, label, required = false, placeholder = 'Select...', className = '', isMulti = false } = props;
  return (
    <div className={className}>
      <Controller
        name={name as any}
        control={control}
        rules={{
          required: required ? `${label || name} is required` : false,
        }}
        render={({ field, fieldState }) => (
          <>
            <ReactSelect
              inputId={name}
              isMulti={isMulti}
              options={parsedOptions}
              onChange={(opt) => {
                if (isMulti) {
                  field.onChange((opt as any[]).map((o) => o.value));
                } else {
                  field.onChange((opt as any)?.value);
                }
              }}
              onBlur={field.onBlur}
              value={
                isMulti
                  ? parsedOptions.filter((o) => Array.isArray(field.value) ? field.value.includes(o.value) : false)
                  : parsedOptions.find((o) => o.value === field.value) || null
              }
              styles={customStyles}
              placeholder={placeholder}
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
