import React from 'react';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { ZodTypeAny, ZodEnum, z } from 'zod';

export type SelectOption = {
  value: string | number;
  label: string;
};

type GenericFormProps<T extends ZodTypeAny> = {
  schema: T;
  endpoint: string;
  mode?: 'create' | 'update' | 'patch';
  id?: string | number;
  defaultValues?: Partial<z.infer<T>>;
  selectOptions?: Record<string, SelectOption[]>;
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  className?: string;
  submitText?: string;
  showCancelButton?: boolean;
};

export default function GenericForm<T extends ZodTypeAny>({
  schema,
  endpoint,
  mode = 'create',
  id,
  defaultValues,
  selectOptions = {},
  onSuccess,
  onCancel,
  className = '',
  submitText = 'Save',
  showCancelButton = false,
}: GenericFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    submitForm,
    reset,
  } = useFormRequest(schema, {
    mode,
    id,
    defaultValues,
    apiOptions: { endpoint },
  });

  const shape = (schema as z.ZodObject<any>).shape;

  const renderField = (field: string) => {
    const rawSchema = shape[field];
    const isRequired = !(rawSchema instanceof z.ZodOptional);
    const label = field.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    const enumOptions: SelectOption[] | undefined =
      rawSchema instanceof ZodEnum
        ? rawSchema.options.map((v) => ({ value: v, label: v }))
        : selectOptions[field];

    if (enumOptions) {
      return (
        <div key={field} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {isRequired && ' *'}
          </label>
          <select
            {...register(field)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="" disabled>
              اختر...
            </option>
            {enumOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors[field] && (
            <p className="text-red-500 text-sm mt-1">{(errors[field] as any)?.message}</p>
          )}
        </div>
      );
    }

    return (
      <div key={field} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {isRequired && ' *'}
        </label>
        <input
          type="text"
          {...register(field)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`${label}...`}
        />
        {errors[field] && (
          <p className="text-red-500 text-sm mt-1">{(errors[field] as any)?.message}</p>
        )}
      </div>
    );
  };

  const onSubmit = async (data: any) => {
    try {
      const result = await submitForm(data);
      onSuccess?.(result);
      if (mode === 'create') reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {Object.keys(shape).map((field) => renderField(field))}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : submitText}
          </button>
          {showCancelButton && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
