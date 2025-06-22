import fs from 'fs';
import path from 'path';
import { schemas } from '@/src/api-zod/zodSchemas'; // تأكد أن المسار صحيح
import { z } from 'zod';

// اسم schema من الطرفية
const [,, schemaName] = process.argv;

if (!schemaName || !(schemaName in schemas)) {
  console.error('❌ Please provide a valid schema name as an argument.');
  process.exit(1);
}

const schema = (schemas as any)[schemaName] as z.ZodObject<any>;

const pascal = schemaName.replace(/(^\w|_\w)/g, (m) => m.replace('_', '').toUpperCase());
const formFile = `components/forms/${pascal}Form.tsx`;
const hookFile = `lib/forms/use${pascal}Form.ts`;

const shape = schema.shape;
const fields = Object.keys(shape);

function getFieldCode(field: string, fieldSchema: z.ZodTypeAny): string {
  let inputType = 'text';
  let inputElement = '';
  const baseClasses = `"w-full border border-gray-300 rounded-md px-3 py-2"`;

  if (fieldSchema instanceof z.ZodNumber) {
    inputType = 'number';
    inputElement = `<input id="${field}" type="${inputType}" {...register("${field}")} className=${baseClasses} />`;
  } else if (fieldSchema instanceof z.ZodString) {
    // Check for email, password, etc. via refinements or description
    const checks = fieldSchema._def.checks || [];
    const hasEmail = checks.some((c: any) => c.kind === 'email');
    const hasMinLength = checks.some((c: any) => c.kind === 'min' && c.value >= 6);

    if (hasEmail) inputType = 'email';
    else if (hasMinLength) inputType = 'password';

    inputElement = `<input id="${field}" type="${inputType}" {...register("${field}")} className=${baseClasses} />`;
  } else if (fieldSchema instanceof z.ZodEnum) {
    const options = fieldSchema.options
      .map((opt: string) => `<option value="${opt}">${opt}</option>`)
      .join('\n    ');
    inputElement = `
    <select id="${field}" {...register("${field}")} className=${baseClasses}>
      <option value="">Seleact...</option>
      ${options}
    </select>
    `;
  } else {
    // fallback to default text input
    inputElement = `<input id="${field}" type="text" {...register("${field}")} className=${baseClasses} />`;
  }

  return `
  <div className="mb-4">
    <label htmlFor="${field}" className="block text-sm font-medium mb-1 capitalize">${field}</label>
    ${inputElement}
    {errors.${field} && <p className="text-red-500 text-sm">{errors.${field}.message}</p>}
  </div>
  `;
}

const formCode = `import { use${pascal}Form } from '@/lib/forms/use${pascal}Form';

export default function ${pascal}Form({ defaultValues, onSuccess }: any) {
  const { register, handleSubmit, formState: { errors }, handleServerErrors } = use${pascal}Form(defaultValues);

  const onSubmit = async (data: any) => {
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
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
    </form>
  );
}
`;

const hookCode = `import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemas } from '@/src/api-zod';

const schema = schemas.${schemaName};

export function use${pascal}Form(defaultValues?: Partial<z.infer<typeof schema>>) {
  const methods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleServerErrors = (apiErrors: any) => {
    Object.entries(apiErrors).forEach(([field, messages]) => {
      methods.setError(field as any, {
        type: 'server',
        message: messages[0],
      });
    });
  };

  return {
    ...methods,
    handleServerErrors,
  };
}
`;

fs.mkdirSync(path.dirname(formFile), { recursive: true });
fs.mkdirSync(path.dirname(hookFile), { recursive: true });

fs.writeFileSync(formFile, formCode);
fs.writeFileSync(hookFile, hookCode);

console.log(`✅Form and hook files generated successfully:
- ${formFile}
- ${hookFile}`);

//  npx tsx scripts/generate-zod-form.ts UserRequest