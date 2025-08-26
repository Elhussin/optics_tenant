"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { schemas } from '@/lib/api/zodClient';

import { Loading4 } from '@/components/ui/loding';
import { DynamicFormProps } from '@/types/DynamicFormTypes';
import { defaultConfig,ignoredFields } from './dataConfig';
import { RenderField } from './renderField';
import { cn } from '@/lib/utils/cn';
import {BackButton,RestButton,Button} from '@/components/ui/buttons/Button';
import { CirclePlus } from 'lucide-react';
import { useIsIframe } from '@/lib/hooks/useIsIframe';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';
import { formsConfig } from '@/config/formsConfig';

/**
 * DynamicFormGenerator is a generic React component for dynamically generating forms
 * based on a provided Zod schema. It supports both "create" and "edit" modes, handles
 * form submission, data fetching for editing, and allows for extensive configuration
 * via props.
 *
 * @template T - The type of the form data, inferred from the Zod schema.
 *
 * @param props - The properties for configuring the dynamic form.
 * @param props.title - Optional title to display at the top of the form.
 * @param props.schemaName - The key name of the schema to use from the schemas object.
 * @param props.onSuccess - Callback function to execute after successful form submission.
 * @param props.className - Optional additional CSS classes for the form container.
 * @param props.submitText - Optional custom text for the submit button.
 * @param props.showCancelButton - Whether to show a cancel button (default: true).
 * @param props.mode - The form mode, either 'create' or 'edit' (default: 'create').
 * @param props.config - Optional configuration object to override default form settings.
 * @param props.alias - The API alias or resource identifier for fetching/submitting data.
 * @param props.id - The identifier of the entity to edit (required in 'edit' mode).
 * @param props.showResetButton - Whether to show a reset button (default: true).
 * @param props.showBackButton - Whether to show a back button (default: true).
 *
 * @returns A JSX element rendering the dynamic form UI.
 *
 * @remarks
 * - The component automatically fetches data and populates the form in 'edit' mode.
 * - Fields can be reordered or hidden via the config prop.
 * - Integrates with Zod for schema validation and react-hook-form for form state management.
 */

export default function DynamicFormGenerator(props: DynamicFormProps) {

      const {entity,id,mode='create'}=props
    if(!entity || mode==='edit' && !id){
      throw new Error('entity is required');
    }

 
      const form = formsConfig[entity];
      if (!form) return <div>Invalid entity</div>;
    

    if(mode==='edit' && !id){
      throw new Error('id is required in edit mode');
    }
    let alias:string
    let submitText:string
    let successMessage:string
    let errorMessage:string
    let title:string
    let schemaName:string=form.schemaName
    let fetchAlias:string=form.retrieveAlias
    let showResetButton:boolean=form.showResetButton || true
    let showBackButton:boolean=form.showBackButton || true
    let className:string=form.className || ""
    let userConfig:{}=form.userConfig || {}
    
    if(mode==='edit'){
      alias=form.updateAlias
      submitText=form.updateTitle
      successMessage=form.updateSuccessMessage
      errorMessage=form.updateErrorMessage
      title=form.updateTitle

    }else{
      alias=form.createAlias
      submitText=form.createTitle
      successMessage=form.createSuccessMessage
      errorMessage=form.createErrorMessage
      title=form.createTitle
    }


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

  const formRequest=useFormRequest({alias:alias!,defaultValues});

  const fetchDefaultData= useFormRequest({alias:fetchAlias!});

  const onSubmit=async(data:any)=>{
    const result=await formRequest.submitForm(data);
    if(result?.success){
      // onSuccess?.();
      if(successMessage) {
        toast.success(successMessage);
      } else {
        toast.success('submitted successfully');
      }
      formRequest.reset();
    }
  }

  useEffect(() => {
    if (mode === 'edit' && id) {
      const fetchData = async () => {
        const result=await fetchDefaultData.submitForm({ id: id });
        console.log('Fetched data:', result.data);
        setDefaultValues(result.data);
      };
      fetchData();
    }
  }, [mode, id]);

  console.log('Fetched data for editing:', defaultValues);

  useEffect(() => {
    if (defaultValues) {
      formRequest.reset(defaultValues);
    }
  }, [defaultValues]);

  if (mode === 'edit' && !defaultValues) {
    return (<Loading4 message="loading form data..." />);
  }


  return (
    <div className={cn(className) + ' container'}>
      <div className="head">
        {/* <h2 className="title" >{mode === 'edit' ? 'Edit ' : ''}{title?title:schemaName}</h2> */}
        <h2 className="title" >{title ? title : schemaName}</h2>

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