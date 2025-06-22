const fs = require('fs');
const path = require('path');
console = require('console');
const schemas = require('./dist-src/api-zod'); // ← عدل حسب اسم مجلدك أو ملفك

const z = require('zod');

// 1. قراءة اسم السكيمه من الطرفية
const schemaName = process.argv[2];
if (!schemaName || !schemas[schemaName]) {
  console.error('❌ أدخل اسم schema صحيح موجود في zodSchemas.ts');
  process.exit(1);
}


const schema = schemas[schemaName];
const shape = schema.shape;
const fields = Object.keys(shape);

// 2. تنسيقات الأسماء
const pascal = schemaName.replace(/(^\w|_\w)/g, m => m.replace('_', '').toUpperCase());

// 3. تحديد المسارات
const formFile = `components/forms/${pascal}Form.tsx`;
const hookFile = `lib/forms/use${pascal}Form.ts`;

// 4. توليد الحقول تلقائيًا
function getFieldCode(field, fieldSchema) {
  let inputType = 'text';
  let inputElement = '';
  const baseClasses = `"w-full border border-gray-300 rounded-md px-3 py-2"`;

  if (fieldSchema instanceof z.ZodNumber) {
    inputType = 'number';
    inputElement = `<input id="${field}" type="${inputType}" {...register("${field}")} className=${baseClasses} />`;
  } else if (fieldSchema instanceof z.ZodString) {
    const checks = fieldSchema._def.checks || [];
    const hasEmail = checks.some(c => c.kind === 'email');
    const hasMinLength = checks.some(c => c.kind === 'min' && c.value >= 6);
    if (hasEmail) inputType = 'email';
    else if (hasMinLength) inputType = 'password';
    inputElement = `<input id="${field}" type="${inputType}" {...register("${field}")} className=${baseClasses} />`;
  } else if (fieldSchema instanceof z.ZodEnum) {
    const options = fieldSchema.options
      .map(opt => `<option value="${opt}">${opt}</option>`)
      .join('\n    ');
    inputElement = `
    <select id="${field}" {...register("${field}")} className=${baseClasses}>
      <option value="">اختر...</option>
      ${options}
    </select>
    `;
  } else {
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

// 5. كود الفورم النهائي
const formCode = `import { use${pascal}Form } from '@/lib/forms/use${pascal}Form';

export default function ${pascal}Form({ defaultValues, onSuccess }) {
  const { register, handleSubmit, formState: { errors }, handleServerErrors } = use${pascal}Form(defaultValues);

  const onSubmit = async (data) => {
    try {
      await api.post('/api/YOUR_ENDPOINT/', data);
      onSuccess?.();
    } catch (e) {
      if (e.response?.status === 400) {
        handleServerErrors(e.response.data);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      ${fields.map(f => getFieldCode(f, shape[f])).join('\n')}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">حفظ</button>
    </form>
  );
}
`;

// 6. كود hook
const hookCode = `import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemas } from '@/api-zod/zodSchemas';

const schema = schemas.${schemaName};

export function use${pascal}Form(defaultValues) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleServerErrors = (apiErrors) => {
    Object.entries(apiErrors).forEach(([field, messages]) => {
      methods.setError(field, {
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

// 7. إنشاء المجلدات وحفظ الملفات
fs.mkdirSync(path.dirname(formFile), { recursive: true });
fs.mkdirSync(path.dirname(hookFile), { recursive: true });

fs.writeFileSync(formFile, formCode);
fs.writeFileSync(hookFile, hookCode);

console.log(`✅ Form and hook files generated successfully!:
- ${formFile}
- ${hookFile}`);


//  npx tsx scripts/generate-zod-form.ts UserRequest
