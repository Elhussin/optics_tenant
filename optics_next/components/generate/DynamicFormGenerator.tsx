"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { schemas } from '@/lib/api/zodClient';
import { createFetcher } from '@/lib/hooks/useCrudFormRequest';
import { useCrudFormRequest } from '@/lib/hooks/useCrudFormRequest';
import { Loading4 } from '@/components/ui/loding';
import { DynamicFormProps } from '@/types/DynamicFormTypes';
import { defaultConfig,ignoredFields } from './dataConfig';
import { RenderField } from './renderField';
import { cn } from '@/lib/utils/cn';
import Button from '@/components/ui/buttons/Button';
import { CircleX, TimerReset, CirclePlus } from 'lucide-react';
import { useIsIframe } from '@/lib/hooks/useIsIframe';
import { BackButton } from '@/components/ui/buttons/ActionButtons';

export default function DynamicFormGenerator<T>(props: DynamicFormProps<T>) {
  const { schemaName, onSuccess, className = "", submitText, showCancelButton = true, mode = 'create', config: userConfig = {}, alias, id } = props;
  
  const isIframe = useIsIframe();
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const fetchData = createFetcher(alias!, setDefaultValues);
 
  const router = useRouter();

  const config = { ...defaultConfig, ...userConfig };
  const schema = (schemas as any)[schemaName] as z.ZodObject<any>;
  const shape = schema.shape;

  if (mode === 'edit') {
    ignoredFields.push('password');
  }
  const allFields = Object.keys(shape).filter((f) => !ignoredFields.includes(f));
  const visibleFields = config.fieldOrder || allFields;

  const { form, onSubmit } = useCrudFormRequest({
    alias: alias!,
    defaultValues,
    onSuccess: () => { onSuccess?.(); 
     }
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchData({ id: id });
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
      <div className="main-header">
        <h2 className="title-1" >{mode === 'edit' ? 'Edit' : 'Add'}{}</h2>
        <BackButton />
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className={config.containerClasses}>
        {visibleFields.map((fieldName) => (
          <RenderField
            key={fieldName}
            fieldName={fieldName}
            fieldSchema={shape[fieldName]}
            form={form}
            config={config}
            mode={mode}
          />
        ))}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            label={form.formState.isSubmitting ? 'Saving...' : (submitText || config.submitButtonText)}
            onClick={() => form.handleSubmit(onSubmit)}
            className={`${config.submitButtonClasses} ${form.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={form.formState.isSubmitting}
            variant="info"
            icon={<CirclePlus size={16} />}
          />

          {!isIframe && config.includeResetButton && (
            <Button
              label="Reset"
              onClick={() => form.reset()}
              variant="reset"
              icon={<TimerReset size={16} />}
            />
          )}

          {!isIframe && showCancelButton && (
            <Button
              label="Cancel"
              onClick={() => router.back()}
              variant="cancel"
              icon={<CircleX size={16} />}
            />
          )}
        </div>
        
      </form>
    </div>
  );
}