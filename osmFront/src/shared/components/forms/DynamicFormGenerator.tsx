"use client"
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { schemas } from '@/src/shared/api/schemas';
import { Loading3 } from '@/src/shared/components/ui/loding';
import { DynamicFormProps } from '@/src/shared/types/DynamicFormTypes';
import { defaultConfig, ignoredFields } from '@/src/config/generatFormConfig';
import { RenderField } from './renderField';
import { cn } from '@/src/shared/utils/cn';
import { CirclePlus, ArrowLeft } from 'lucide-react';
import { useFormRequest } from '@/src/shared/hooks/useFormRequest';
import { formsConfig } from '@/src/config/formsConfig';
import { useMemo } from 'react';
import { safeToast } from '@/src/shared/utils/toastService';
import {useTranslations} from 'next-intl';
import { ActionButton } from '../ui/buttons';
import { useRouter } from '@/src/app/i18n/navigation';

export default function DynamicFormGenerator(props: DynamicFormProps,) {
  // const isIframe = useIsIframe();
  const [defaultValues, setDefaultValues,] = useState<any>(null);
  const router = useRouter();

  const { entity, id,setData} = props

  if (!entity) throw new Error('entity is required');
  const t = useTranslations('formsConfig');
  const form = formsConfig[entity];
  const alias = useMemo(() => (id ? form.updateAlias : form.createAlias ), [id, form]);
  const fetchAlias = useMemo(() => form.retrieveAlias, [form]);
  const showResetButton = form.showResetButton ?? true;
  const showBackButton = form.showBackButton ?? true;
  const className = form.className || '';

  const action = id ? 'update' : 'create';

  const submitText = useMemo(
    () => `${t(action)} ${t(entity)}`,
    [id, t, entity]
  );

  const successMessage = useMemo(
    () => `${t('success')} ${t(action)} ${t(entity)}`,
    [id, t, entity]
  );

  const errorMessage = useMemo(
    () => `${t('failed')} ${t(action)} ${t(entity)}`,
    [id,t,entity]
  );

  const title = useMemo(() => `${t(action)} ${t(entity)}`, [id,t,entity]);


  const userConfig: Record<string, any> = form.userConfig || {};

  const config = { ...defaultConfig, ...userConfig };
  // Guard against optional schemaName being undefined in some forms
  const schema = form.schemaName
    ? ((schemas as any)[form.schemaName] as z.ZodObject<any> | undefined)
    : undefined;
  const shape = (schema as any)?.shape || {};
  const effectiveIgnoredFields = useMemo(
  () => (id ? [...ignoredFields, "password"] : ignoredFields),
  [id]
  );

  const allFields = useMemo(
    () => Object.keys(shape).filter((f) => !effectiveIgnoredFields.includes(f)),
    [shape, effectiveIgnoredFields]
  );

const visibleFields = config.fieldOrder || allFields;

  // Ensure alias and fetchAlias are always strings to satisfy type requirements
  const safeAlias: string = alias ?? '';
  const safeFetchAlias: string = fetchAlias ?? '';
  const canSubmit = Boolean(safeAlias);

  const formRequest = useFormRequest({ alias: safeAlias, defaultValues });
  const fetchDefaultData = useFormRequest({ alias: safeFetchAlias });


  const onSubmit = async (data: any, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    const result = await formRequest.submitForm(data);
    if (result?.success) {
      safeToast(successMessage || 'Submitted successfully',{type:"success"})
      if(setData){
        setData(result.data);
        return;
      }else{
      setDefaultValues(result.data);
      // formRequest?.reset();
      }
        // to returen dat when cull from anothe mdule

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
  // if (defaultValues) {
  //   formRequest?.reset(defaultValues);
  // }
  }, [defaultValues,formRequest]);

  if (id && !defaultValues) {
    return <Loading3/>;
  }

  return (
    <div className={cn(className) + ' container'}>
      <div className="head">

        <h2 className="title" >{title ? title : form.schemaName}</h2>

        {showBackButton && !setData &&
          <ActionButton icon={<ArrowLeft size={16} />} variant="success" title={t("back")} onClick={() => router.back()}/>}

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
          <ActionButton
            type="submit"
            label={formRequest.formState.isSubmitting ? `${t('saving')}...` : (submitText || t('create'))}
            className={`${config.submitButtonClasses} ${formRequest.formState.isSubmitting || !canSubmit ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={formRequest.formState.isSubmitting || !canSubmit}
            variant="info"
            title={submitText || t('create')}
            icon={<CirclePlus size={16} />}
          />

          {/* {!isIframe && config.includeResetButton && showResetButton && (
            <ActionButton
              onClick={() => formRequest.reset()}
              label={t('reset')}
              icon={<RefreshCw size={16} />}
              variant="outline"
            />
          )} */}

        </div>

      </form>
    </div>
  );
}