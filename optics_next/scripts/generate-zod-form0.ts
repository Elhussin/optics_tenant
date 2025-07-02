// scripts/generate-zod-form.ts
import fs from 'fs';
import path from 'path';
import { schemas } from '../lib/zod-client';
import { z } from 'zod';

const [,, schemaName, apiEndpoint, configPath] = process.argv;

if (!schemaName || !(schemaName in schemas)) {
  console.error('❌ Invalid schema name');
  console.log('Available schemas:', Object.keys(schemas).join(', '));
  process.exit(1);
}
const YOUR_ENDPOINT = apiEndpoint || 'YOUR_ENDPOINT';

const schema = (schemas as any)[schemaName] as z.ZodObject<any>;
const shape = schema.shape;
const pascal = schemaName.replace(/(^\w|_\w)/g, (m) => m.replace('_', '').toUpperCase());
const camel = schemaName.replace(/_(\w)/g, (_, c) => c.toUpperCase());

const formFile = `components/forms/${pascal}Form.tsx`;
const hookFile = `lib/hooks/use${pascal}Form.ts`;

function generateField(field: string) {
  return `
  <div className="mb-4">
    <label htmlFor="${field}" className="block text-sm font-medium text-gray-700 mb-1">
      ${field[0].toUpperCase() + field.slice(1)} *
    </label>
    <input
      id="${field}"
      type="text"
      {...register("${field}")}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {errors.${field} && <p className="text-red-500 text-sm mt-1">{errors.${field}?.message}</p>}
  </div>`;
}

const formCode = `// components/forms/${pascal}Form.tsx
import React from 'react';
import { use${pascal}Form, UseFormRequestOptions } from '@/lib/hooks/use${pascal}Form';
import { handleErrorStatus } from '@/utils/error';
import { toast } from 'sonner';

export interface ${pascal}FormProps extends UseFormRequestOptions {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  className?: string;
  submitText?: string;
  showCancelButton?: boolean;
}

export default function ${pascal}Form({
  onSuccess,
  onCancel,
  className = "",
  submitText = "Save",
  showCancelButton = false,
  ...options
}: ${pascal}FormProps) {
  const { 
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    submitForm,
    reset
  } = use${pascal}Form(options);

  const onSubmit = async (data: any) => {
    try {
      const result = await submitForm(data);
      onSuccess?.(result);
      if (options.mode === 'create') reset();
    } catch (error) {
      toast.error(handleErrorStatus(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={\`space-y-4 \${className}\`}>
      ${Object.keys(shape).map(f => generateField(f)).join('\n')}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={\`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium \${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}\`}
        >
          {isSubmitting ? 'Saving...' : submitText}
        </button>

        {showCancelButton && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
`;

const hookCode = `// lib/hooks/use${pascal}Form.ts
import { schemas } from '@/lib/zod-client';
import { useFormRequest, UseFormRequestOptions } from '@/lib/hooks/useFormRequest';

export function use${pascal}Form(options: UseFormRequestOptions = {}) {
  return useFormRequest(schemas.${schemaName}, {
    apiOptions: {
      endpoint: '${YOUR_ENDPOINT}',
      ...options.apiOptions,
    },
    ...options
  });
}

`;

fs.mkdirSync(path.dirname(formFile), { recursive: true });
fs.mkdirSync(path.dirname(hookFile), { recursive: true });

fs.writeFileSync(formFile, formCode);
fs.writeFileSync(hookFile, hookCode);

// console.log(`✅ ${pascal}Form generated successfully at:📁 ${formFile}📁 ${hookFile});

console.log(`✅ ${pascal}Form created successfully:
    📁 Form Component: ${formFile}
    📁 Hook: ${hookFile}
  
    `);