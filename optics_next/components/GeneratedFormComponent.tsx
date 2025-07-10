// components/forms/detectInputType.ts
import { ZodTypeAny } from 'zod';

import { schemas } from '@/lib/api/zodClient';
import { z } from 'zod';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SubmitHandler } from "react-hook-form";
import { SearchFilterForm } from '@/components/Search/SearchFilterForm';
import { generateSearchFieldsFromEndpoint } from '@/lib/utils/generateSearchFieldsFromEndpoint';


export function formatLabel(field: string): string {
  // إزالة الرموز الغريبة (إذا كانت موجودة)
  const cleaned = field.replace(/[_\-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // تحويل أول حرف من كل كلمة إلى Capital
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}



interface Props {
    schemaName: string;

    alias: string;
    onSuccess?: (res: any) => void;
    onCancel?: () => void;
    className?: string;
    submitText?: string;
    showCancelButton?: boolean;
    defaultValues?: any;
}

export const ignoredFields = ['id', 'created_at', 'updated_at', 'owner', 'tenant', 'is_superuser','group','is_deleted'];


function unwrapSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  while (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodNullable ||
    schema instanceof z.ZodDefault
  ) {
    schema = schema._def.innerType;
  }
  return schema;
}



function getFieldCode(field: string, rawSchema: z.ZodTypeAny, form: any,) {
  const baseClasses = "input-base";
  const schema = unwrapSchema(rawSchema);
  const description = rawSchema.description || formatLabel(field);

  if (schema instanceof z.ZodBoolean) {
    return (
      <div className="mb-4" key={field}>
        <label htmlFor={field} className="label">
          <input id={field} type="checkbox" {...form.register(field)} />
          <span>{description}</span>
        </label>
        {form.formState.errors[field] && (
          <p className="text-red-500 text-sm">{form.formState.errors[field]?.message as string}</p>
        )}
      </div>
    );
  } else if (schema instanceof z.ZodEnum) {
    return (
      <div className="mb-4" key={field}>
        <label htmlFor={field} className="label">{description}</label>
        <select id={field} {...form.register(field)} className={baseClasses}>
          {schema.options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {form.formState.errors[field] && (
          <p className="text-red-500 text-sm">{form.formState.errors[field]?.message as string}</p>
        )}
      </div>
    );
  } else {
    // Text or Number inputs
    let inputType = 'text';
    if (schema instanceof z.ZodNumber) inputType = 'number';
    else if (schema instanceof z.ZodString) {
      const checks = schema._def.checks || [];
      const hasEmail = checks.some((c: any) => c.kind === 'email');
      const hasMinLength = checks.some((c: any) => c.kind === 'min' && c.value >= 6);
      if (hasEmail) inputType = 'email';
      else if (hasMinLength) inputType = 'password';
    }

    return (
      <div className="mb-4" key={field}>
        <label htmlFor={field} className="block text-sm font-medium mb-1">{description}</label>
        <input id={field} type={inputType} {...form.register(field)} className={baseClasses} />
        {form.formState.errors[field] && (
          <p className="text-red-500 text-sm">{form.formState.errors[field]?.message as string}</p>
        )}
      </div>
    );
  }
}


export function GeneratedFormComponent(props: Props) {
  const fields = generateSearchFieldsFromEndpoint(props.alias);
    const { schemaName,alias, onSuccess, onCancel, className = "", submitText = "Save", showCancelButton = true, defaultValues } = props;

    if (!schemaName || !(schemaName in schemas)) {
      console.error('❌ Please provide a valid schema name from zodSchemas.ts');
            return;
    }
    if (!alias) {
      console.error('❌ Please provide an alias');
            return;
    }

    const schema = (schemas as any)[schemaName] as z.ZodObject<any>;
    const shape = schema.shape;

    // 👇 تجاهل الحقول غير الضرورية
    const visibleFields = Object.keys(shape).filter((f) => !ignoredFields.includes(f));

    const pascal = schemaName.replace(/(^\w|_\w)/g, (m) => m.replace('_', '').toUpperCase());
   





const router = useRouter();

const form = useFormRequest({
      alias:alias,
      onSuccess: (res) => {
        onSuccess?.(res);
      },
      onError: (err) => {
        toast.error("User creation failed");
        console.log("error", err);
      },
      defaultValues
    });
    

  const onSubmit: SubmitHandler<any> = async (data) => {
    const result = await form.submitForm(data);
    if (!result || !result.success) {
      console.log("error", result?.error);
      return;
    }
    if (result.success) {
      form.reset(result.data); 
    }
    onSuccess?.(result);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    form.reset();
    router.push('/users');
  };
  return (
    <div className="body-container">
      <aside className="aside">
        <SearchFilterForm fields={fields} />
      </aside>
      <main className="main">

    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {visibleFields.map((f) => getFieldCode(f, shape[f], form))}

      <div className="flex gap-2">

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{submitText}</button>
        {showCancelButton && (
          <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
        )}
      </div>
    </form>
    </main>
    </div>
  );
  
}


