import React from 'react';
import { FieldValues } from 'react-hook-form';
import { schemas } from '@/lib/api/zodClient';
import { z } from 'zod';
import { CircleX, TimerReset } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GeneratorConfig, FieldTemplate } from '@/types/DynamicFormTypes';
import { defaultConfig } from './DynamicFormhelper';
import { renderField } from './renderField';
import Button from '@/components/ui/button/Button';
import { cn } from '@/lib/utils/cn';
import { useCrudFormRequest } from "@/lib/hooks/useCrudFormRequest";
import { createFetcher } from '@/lib/hooks/useCrudFormRequest';
import { Loading4 } from '@/components/ui/loding';
import { DynamicFormProps } from '@/types/DynamicFormTypes';


// main component
export default function DynamicFormGenerator<T extends FieldValues>({
  schemaName,
  onSuccess,
  className = "",
  submitText,
  showCancelButton = true,
  mode = 'create',
  config: userConfig = {},
  alias,
  id
}: DynamicFormProps<T>) {
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const fetchUser = createFetcher(alias!, setDefaultValues);
  const router = useRouter();

  const config = { ...defaultConfig, ...userConfig };
  const schema = (schemas as any)[schemaName] as z.ZodObject<any>;
  const shape = schema.shape;
  const ignoredFields = ['id', 'created_at', 'updated_at', 'owner', 'tenant', 'group','is_active','is_deleted','deleted_at'];
  if (mode === 'edit') {
    ignoredFields.push('password');
  }
  const allFields = Object.keys(shape).filter((f) => !ignoredFields.includes(f));
  const visibleFields = config.fieldOrder || allFields;

  const { form, onSubmit } = useCrudFormRequest({
    alias: alias!, defaultValues,
    onSuccess: (res) => { onSuccess?.();}
  });


  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchUser({ id: id });
    }
  }, [mode, id]);

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues]);


  if (mode === 'edit' && !defaultValues) {
    return <Loading4 />;
  }


  return (
    <div className={cn(className, "container")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={config.containerClasses} >
        {visibleFields.map((fieldName: string) => renderField(fieldName, shape[fieldName], config, form, mode))}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            label={form.formState.isSubmitting ? 'Saving...' : (submitText || config.submitButtonText)}
            onClick={() => form.handleSubmit(onSubmit)}
            className={`${config.submitButtonClasses} ${form.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={form.formState.isSubmitting}
            variant="success"
            icon={<TimerReset size={16} />}
          />

          {config.includeResetButton && (
            <Button
              label="Reset"
              onClick={() => form.reset()}
              variant="info"
              icon={<TimerReset size={16} />}
            />
          )}

          {showCancelButton && (
            <Button
              label="Cancel"
              onClick={() => router.back()}
              variant="secondary"
              icon={<CircleX size={16} />}
            />
          )}
        </div>
      </form>
    </div>
  );
}