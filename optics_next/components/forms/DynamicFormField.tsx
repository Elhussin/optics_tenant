// components/forms/DynamicFormField.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { unwrapSchema } from '@/lib/utils/generateForm';
import { detectFieldType } from '@/lib/utils/detectFieldType';
import { formatLabel } from '@/lib/utils/formatLabel';

interface DynamicFieldProps {
  field: string;
  rawSchema: z.ZodTypeAny;
  baseClasses?: string;
  labelClasses?: string;
  spacing?: string;
}

export const DynamicFormField: React.FC<DynamicFieldProps> = ({
  field,
  rawSchema,
  baseClasses = "input-base",
  labelClasses = "block text-sm font-medium mb-1",
  spacing = "mb-4",
}) => {
  const { register, formState } = useFormContext();
  const schema = unwrapSchema(rawSchema);
  const fieldType = detectFieldType(field, rawSchema);
  const isRequired = !(rawSchema instanceof z.ZodOptional);
  const error = formState.errors?.[field]?.message;
  const label = formatLabel(field);

  switch (fieldType) {
    case 'checkbox':
      return (
        <div className={spacing}>
          <label className="inline-flex items-center space-x-2">
            <input id={field} type="checkbox" {...register(field)} />
            <span>{label}{isRequired && ' *'}</span>
          </label>
          {error && <p className="text-red-500 text-sm">{String(error)}</p>}
        </div>
      );

    case 'select':
      if (schema instanceof z.ZodEnum) {
        return (
          <div className={spacing}>
            <label htmlFor={field} className={labelClasses}>
              {label}{isRequired && ' *'}
            </label>
            <select id={field} {...register(field)} className={baseClasses}>
              <option value="">Select...</option>
              {schema.options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm">{String(error)}</p>}
          </div>
        );
      }
      break;

    case 'textarea':
      return (
        <div className={spacing}>
          <label htmlFor={field} className={labelClasses}>
            {label}{isRequired && ' *'}
          </label>
          <textarea
            id={field}
            rows={3}
            {...register(field)}
            className={baseClasses}
            placeholder={`${label}...`}
          />
          {error && <p className="text-red-500 text-sm">{String(error)}</p>}
        </div>
      );

    default:
      return (
        <div className={spacing}>
          <label htmlFor={field} className={labelClasses}>
            {label}{isRequired && ' *'}
          </label>
          <input
            id={field}
            type={fieldType}
            {...register(field)}
            className={baseClasses}
            placeholder={`${label}...`}
          />
          {error && <p className="text-red-500 text-sm">{String(error)}</p>}
        </div>
      );
  }
};
