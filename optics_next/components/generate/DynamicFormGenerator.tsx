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
import { toast } from 'sonner';
import { formsConfig,FormConfig } from '@/config/formsConfig';
import { useMemo } from 'react';
import { safeToast } from '@/lib/utils/toastService';
export default function DynamicFormGenerator(props: DynamicFormProps) {
  const isIframe = useIsIframe();
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const { entity, id, mode = 'create' } = props
  if (!entity) throw new Error('entity is required');
  if (mode === 'edit' && !id) throw new Error('id is required in edit mode');
  const form = formsConfig[entity];
  const alias = useMemo(() => (mode === 'edit' ? form.updateAlias : form.createAlias), [mode, form]);
  const fetchAlias = useMemo(() => form.retrieveAlias, [form]);
  const submitText = useMemo(() => (mode === 'edit' ? form.updateTitle : form.createTitle), [mode, form]);
  const successMessage = useMemo(() => (mode === 'edit' ? form.updateSuccessMessage : form.createSuccessMessage), [mode, form]);
  const errorMessage = useMemo(() => (mode === 'edit' ? form.updateErrorMessage : form.createErrorMessage), [mode, form]);
  const title = useMemo(() => (mode === 'edit' ? form.updateTitle : form.createTitle), [mode, form]);
  const showResetButton = form.showResetButton ?? true;
  const showBackButton = form.showBackButton ?? true;
  const className = form.className || '';
  const userConfig: Record<string, any> = form.userConfig || {};

  const config = { ...defaultConfig, ...userConfig };
  const schema = (schemas as any)[form.schemaName] as z.ZodObject<any>;
  const shape = schema.shape;

  const allFields = Object.keys(shape).filter((f) => !ignoredFields.includes(f));
  const effectiveIgnoredFields = useMemo(() => (mode === 'edit' ? [...ignoredFields, 'password'] : ignoredFields), [mode]);
  const visibleFields = config.fieldOrder || allFields;
  const formRequest = useFormRequest({ alias, defaultValues });
  const fetchDefaultData = useFormRequest({ alias: fetchAlias });
  const onSubmit = async (data: any) => {
    const result = await formRequest.submitForm(data);
    if (result?.success) {
      safeToast(successMessage || 'Submitted successfully',{type:"success"})
      formRequest.reset();
    } else if (errorMessage) {
      safeToast(errorMessage ,{type:"error"})
    }
  };

  useEffect(() => {
    if (mode === 'edit' && id) {
      const fetchData = async () => {
        const result = await fetchDefaultData.submitForm({ id });
        setDefaultValues(result.data);
      };
      fetchData();
    }
  }, [mode, id]);


  useEffect(() => {
    if (defaultValues) {
      formRequest.reset(defaultValues);
    }
  }, []);

  if (mode === 'edit' && !defaultValues) {
    return <Loading4 message="Loading form data..." />;
  }
  return (
    <div className={cn(className) + ' container'}>
      <div className="head">
        {/* <h2 className="title" >{mode === 'edit' ? 'Edit ' : ''}{title?title:schemaName}</h2> */}
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
              onClick={() => formRequest.reset()}
            />
          )}

        </div>

      </form>
    </div>
  );
}