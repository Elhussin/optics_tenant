import fs from 'fs';
import path from 'path';
import { schemas } from '../src/api-zod';
import { z } from 'zod';

// تحسينات TypeScript: تعريف نوع للـ schemas
type SchemaDictionary = Record<string, z.ZodObject<any>>;

// تحسينات الأمان: التحقق من وجود الدلائل
const ensureDirectoryExists = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// تحسينات الـ Form: تعريف أنواع الـ props
interface FormProps<T extends z.ZodObject<any>> {
  defaultValues?: Partial<z.infer<T>>;
  onSuccess?: () => void;
}

// تحسينات إدارة الأخطاء
interface ApiErrors {
  [key: string]: string[];
}

const [,, schemaName] = process.argv;

if (!schemaName || !(schemaName in schemas)) {
  console.error('❌ Please provide a valid schema name as an argument.');
  process.exit(1);
}
const schema = schemas[schemaName as keyof typeof schemas];
if (!(schema instanceof z.ZodObject)) {
  console.error(`❌ Schema ${schemaName} is not a valid ZodObject`);
  process.exit(1);
}

const pascal = schemaName.replace(/(^\w|_\w)/g, (m) => m.replace('_', '').toUpperCase());
const formFile = `components/forms/${pascal}Form.tsx`;
const hookFile = `lib/forms/use${pascal}Form.ts`;

const shape = schema.shape;
const fields = Object.keys(shape);

function getFieldCode(field: string, fieldSchema: z.ZodTypeAny): string {
  const baseClasses = "w-full border border-gray-300 rounded-md px-3 py-2";
  let inputElement = '';

  if (fieldSchema instanceof z.ZodNumber) {
    inputElement = `<input id="${field}" type="number" {...register("${field}", { valueAsNumber: true })} className="${baseClasses}" />`;
  } 
  else if (fieldSchema instanceof z.ZodString) {
    const checks = fieldSchema._def.checks || [];
    const type = checks.some((c: any) => c.kind === 'email') ? 'email' : 
                checks.some((c: any) => c.kind === 'min' && c.value >= 6) ? 'password' : 'text';
    
    inputElement = `<input id="${field}" type="${type}" {...register("${field}")} className="${baseClasses}" />`;
  }
  else if (fieldSchema instanceof z.ZodEnum) {
    const options = fieldSchema.options.map((opt) => 
      `<option key="${opt}" value="${opt}">${opt}</option>`
    ).join('\n      ');
    
    inputElement = `
      <select id="${field}" {...register("${field}")} className="${baseClasses}">
        <option value="">Select...</option>
        ${options}
      </select>
    `;
  }
  else if (fieldSchema instanceof z.ZodBoolean) {
    inputElement = `
      <div className="flex items-center">
        <input id="${field}" type="checkbox" {...register("${field}")} className="h-4 w-4 rounded" />
        <label htmlFor="${field}" className="ml-2 block text-sm">${field.replace(/_/g, ' ')}</label>
      </div>
    `;
  }
  else {
    inputElement = `<input id="${field}" type="text" {...register("${field}")} className="${baseClasses}" />`;
  }

  return `
    <div className="mb-4">
      <label htmlFor="${field}" className="block text-sm font-medium mb-1 capitalize">
        ${field.replace(/_/g, ' ')}
      </label>
      ${inputElement}
      {errors.${field} && <p className="text-red-500 text-sm mt-1">{errors.${field}.message}</p>}
    </div>
  `;
}

const formCode = `import { use${pascal}Form } from '@/lib/forms/use${pascal}Form';
import type { Use${pascal}FormReturn } from '@/lib/forms/use${pascal}Form';

interface ${pascal}FormProps {
  defaultValues?: Partial<${pascal}FormValues>;
  onSuccess?: () => void;
}

export type ${pascal}FormValues = z.infer<typeof schemas.${schemaName}>;

export default function ${pascal}Form({ defaultValues, onSuccess }: ${pascal}FormProps) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    handleServerErrors 
  } = use${pascal}Form(defaultValues);

  const onSubmit = async (data: ${pascal}FormValues) => {
    try {
      await api.post('/api/YOUR_ENDPOINT/', data);
      onSuccess?.();
    } catch (e: any) {
      if (e.response?.status === 400) {
        handleServerErrors(e.response.data);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      ${fields.map((f) => getFieldCode(f, shape[f])).join('\n')}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
`;

const hookCode = `import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemas } from '@/src/api-zod';

const schema = schemas.${schemaName};

export type ${pascal}FormValues = z.infer<typeof schema>;

export function use${pascal}Form(defaultValues?: Partial<${pascal}FormValues>) {
  const methods = useForm<${pascal}FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleServerErrors = (apiErrors: ApiErrors) => {
    Object.entries(apiErrors).forEach(([field, messages]) => {
      methods.setError(field as any, {
        type: 'server',
        message: Array.isArray(messages) ? messages[0] : messages,
      });
    });
  };

  return {
    ...methods,
    handleServerErrors,
  };
}

export type Use${pascal}FormReturn = ReturnType<typeof use${pascal}Form>;
`;

ensureDirectoryExists(formFile);
ensureDirectoryExists(hookFile);

fs.writeFileSync(formFile, formCode);
fs.writeFileSync(hookFile, hookCode);

console.log(`✅ Form and hook files generated successfully:
- ${formFile}
- ${hookFile}`);


// npx tsx scripts/generate-zod-form-1.ts UserRequest