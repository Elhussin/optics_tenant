// components/forms/GenericForm.tsx
import React from 'react';
import { ZodType, z } from 'zod';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';
import { handleErrorStatus } from '@/lib/utils/error';

type FieldType = 'text' | 'number' | 'password' | 'textarea';

interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
}

interface GenericFormProps<TSchema extends ZodType<any, any, any>> {
  schema: TSchema;
  fields: FieldConfig[];
  endpoint: string;
  mode?: 'create' | 'update' | 'patch' | 'delete';
  id?: string | number;
  className?: string;
  submitText?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
  onSuccess?: (data?: any) => void;
}

export default function GenericForm<TSchema extends ZodType<any, any, any>>({
  schema,
  fields,
  endpoint,
  mode = 'create',
  id,
  className = '',
  submitText = 'Save',
  showCancelButton = false,
  onCancel,
  onSuccess,
}: GenericFormProps<TSchema>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    submitForm,
    reset,
  } = useFormRequest(schema, {
    mode,
    id,
    apiOptions: {
      endpoint,
      onSuccess: (res) => onSuccess?.(res),
    },
  });

  const onSubmit = async (data: z.infer<TSchema>) => {
    try {
      const result = await submitForm(data);
      if (result.success && mode === 'create') reset();
    } catch (error) {
      toast.error(handleErrorStatus(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              {...register(field.name)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <input
              id={field.name}
              type={field.type}
              {...register(field.name)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          {errors[field.name] && (
            <p className="text-red-500 text-sm mt-1">
              {(errors[field.name] as any)?.message}
            </p>
          )}
        </div>
      ))}

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
  );
}
