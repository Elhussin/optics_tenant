"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { schemas } from '@/lib/api/zodClient';
import { createFetcher } from '@/lib/hooks/useCrudFormRequest';

import { Loading4 } from '@/components/ui/loding';
import { DynamicFormProps } from '@/types/DynamicFormTypes';
import { defaultConfig,ignoredFields } from './dataConfig';
import { RenderField } from './renderField';
import { cn } from '@/lib/utils/cn';
import {BackButton,RestButton,Button} from '@/components/ui/buttons/Button';
import { CirclePlus } from 'lucide-react';
import { useIsIframe } from '@/lib/hooks/useIsIframe';
import { useFormRequest } from '@/lib/hooks/useFormRequest';


export default function DynamicFormGenerator<T>(props: DynamicFormProps<T>) {
  const { title, schemaName, onSuccess, className = "", submitText, showCancelButton = true,
     mode = 'create', config: userConfig = {}, alias, id, 
    showResetButton=true, showBackButton=true
    } = props;

  const isIframe = useIsIframe();
  const [defaultValues, setDefaultValues] = useState<any>(null);

  const router = useRouter();
  const config = { ...defaultConfig, ...userConfig };
  const schema = (schemas as any)[schemaName] as z.ZodObject<any>;
  const shape = schema.shape;

  if (mode === 'edit') {
    ignoredFields.push('password');
  }
  const allFields = Object.keys(shape).filter((f) => !ignoredFields.includes(f));
  const visibleFields = config.fieldOrder || allFields;

  const fetchData = createFetcher(alias!, setDefaultValues);
  const formRequest=useFormRequest({alias:alias!,defaultValues});

  const onSubmit=async(data:any)=>{
    const result=await formRequest.submitForm(data);
    if(result?.success){
      onSuccess?.();
      formRequest.reset();
    }
  }

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchData({ id: id });
    }
  }, [mode, id]);

  useEffect(() => {
    if (defaultValues) {
      formRequest.reset(defaultValues);
    }
  }, [defaultValues]);

  if (mode === 'edit' && !defaultValues) {
    return <Loading4 />;
  }


  return (
    <div className={cn(className)}>
      <div className="head">
        <h2 className="title" >{mode === 'edit' ? 'Edit ' : ''}{title?title:schemaName}</h2>
        {showBackButton && <BackButton />}

      </div>

      <form onSubmit={formRequest.handleSubmit(onSubmit)} className={config.containerClasses}>
        {visibleFields.map((fieldName) => (
          <RenderField
            key={fieldName}
            fieldName={fieldName}
            fieldSchema={shape[fieldName]}
            form={formRequest}
            config={config}
            mode={mode}
          />
        ))}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            label={formRequest.formState.isSubmitting ? 'Saving...' : (submitText || config.submitButtonText)}
            onClick={() => formRequest.handleSubmit(onSubmit)}
            className={`${config.submitButtonClasses} ${formRequest.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={formRequest.formState.isSubmitting}
            variant="info"
            icon={<CirclePlus size={16} />}
          />

          {!isIframe && config.includeResetButton && showResetButton && (
            <RestButton
              onClick={() =>formRequest.reset()}
            />
          )}

        </div>
        
      </form>
    </div>
  );
}