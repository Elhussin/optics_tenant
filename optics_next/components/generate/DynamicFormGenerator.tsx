"use client"
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { schemas } from '@/lib/api/zodClient';
import { Loading4 } from '@/components/ui/loding';
import { DynamicFormProps } from '@/types/DynamicFormTypes';
import { defaultConfig, ignoredFields } from './dataConfig';
import { RenderField } from './renderField';
import { cn } from '@/lib/utils/cn';
import { BackButton, RestButton, Button } from '@/components/ui/buttons/Button';
import { CirclePlus } from 'lucide-react';
import { useIsIframe } from '@/lib/hooks/useIsIframe';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { formsConfig } from '@/config/formsConfig';
import { useMemo } from 'react';
import { safeToast } from '@/lib/utils/toastService';

export default function DynamicFormGenerator(props: DynamicFormProps) {
  const isIframe = useIsIframe();
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const { entity, id } = props
  if (!entity) throw new Error('entity is required');
  const form = formsConfig[entity];
  const alias = useMemo(() => (id ? form.updateAlias : form.createAlias), [id, form]);
  const fetchAlias = useMemo(() => form.retrieveAlias, [form]);
  const submitText = useMemo(() => (id ? form.updateTitle : form.createTitle), [id, form]);
  const successMessage = useMemo(() => (id ? form.updateSuccessMessage : form.createSuccessMessage), [id, form]);
  const errorMessage = useMemo(() => (id ? form.updateErrorMessage : form.createErrorMessage), [id, form]);
  const title = useMemo(() => (id ? form.updateTitle : form.createTitle), [id, form]);
  const showResetButton = form.showResetButton ?? true;
  const showBackButton = form.showBackButton ?? true;
  const className = form.className || '';
  const userConfig: Record<string, any> = form.userConfig || {};

  const config = { ...defaultConfig, ...userConfig };
  const schema = (schemas as any)[form.schemaName] as z.ZodObject<any>;
  const shape = schema.shape;
  const effectiveIgnoredFields = useMemo(
  () => (id ? [...ignoredFields, "password"] : ignoredFields),
  [id, ignoredFields]
  );

  const allFields = useMemo(
    () => Object.keys(shape).filter((f) => !effectiveIgnoredFields.includes(f)),
    [shape, effectiveIgnoredFields]
  );

const visibleFields = config.fieldOrder || allFields;

  const formRequest = useFormRequest({ alias,defaultValues });
  const fetchDefaultData = useFormRequest({ alias: fetchAlias });
  const onSubmit = async (data: any) => {
    const result = await formRequest.submitForm(data);
    if (result?.success) {
      safeToast(successMessage || 'Submitted successfully',{type:"success"})
      setDefaultValues(result.data);
      formRequest.reset();
    } else if (errorMessage) {
      safeToast(errorMessage ,{type:"error"})
    }
  };

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        const result = await fetchDefaultData.submitForm({ id });
        setDefaultValues(result.data);
      };
      fetchData();
    }
  }, [id]);
  
  useEffect(() => {
  if (defaultValues) {
    formRequest.reset(defaultValues);
  }
  }, [defaultValues,formRequest]);

  if (id && !defaultValues) {
    return <Loading4 message="Loading form data..." />;
  }

  return (
    <div className={cn(className) + ' container'}>
      <div className="head">

        <h2 className="title" >{title ? title : form.schemaName}</h2>

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
            mode={id ? 'edit' : 'create'}
          />
        ))}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            label={formRequest.formState.isSubmitting ? 'Saving...' : (submitText || config.submitButtonText)}
            className={`${config.submitButtonClasses} ${formRequest.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={formRequest.formState.isSubmitting}
            variant="info"
            icon={<CirclePlus size={16} />}
          />

          {!isIframe && config.includeResetButton && showResetButton && (
            <RestButton
              onClick={() => formRequest.reset()}
            />
          )}

        </div>

      </form>
    </div>
  );
}
