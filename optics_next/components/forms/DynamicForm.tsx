// components/forms/DynamicForm.tsx
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { DynamicFormField } from './DynamicFormField';
import { schemas } from '@/lib/api/zodClient';

interface Props {
  schemaName: string;
  form: any; // from useCrudFormRequest (react-hook-form object)
  onSubmit: (data: any) => void;
  ignoreFields?: string[];
  className?: string;
  submitText?: string;
}

// const schemas = require('@/lib/api/zodClient').schemas;
export const DynamicForm: React.FC<Props> = ({
  schemaName,
  form,
  onSubmit,
  ignoreFields = ['id', 'created_at', 'updated_at', 'owner', 'tenant', 'group', 'is_superuser', 'is_deleted'],
  className = '',
  submitText = 'Save',
}) => {
    const schema = (schemas as any)[schemaName] as z.ZodObject<any>;
    const shape = schema.shape;
    const allFields = Object.keys(shape).filter((f) => !ignoreFields.includes(f));
    // const visibleFields = config.fieldOrder || allFields;
    const visibleFields = schema.shape ? Object.keys(schema.shape).filter((field) => !ignoreFields.includes(field)) : [];

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
        {visibleFields.map((field) => (
          <DynamicFormField key={field} field={field} rawSchema={schema.shape[field]} />
        ))}

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{submitText}</button>
          <button type="reset" onClick={() => form.reset()} className="bg-gray-400 text-white px-4 py-2 rounded">Reset</button>
        </div>
      </form>
    </FormProvider>
  );
};
