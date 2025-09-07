"use client"
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { schemas } from '@/lib/api/zodClient';
import { Loading3 } from '@/components/ui/loding';
import { DynamicFormProps } from '@/types/DynamicFormTypes';
import { defaultConfig, ignoredFields } from '../../config/dataConfig';
import { RenderField } from './renderField';
import { cn } from '@/lib/utils/cn';
import { CirclePlus, RefreshCw,ArrowLeft } from 'lucide-react';
import { useIsIframe } from '@/lib/hooks/useIsIframe';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { formsConfig } from '@/config/formsConfig';
import { useMemo } from 'react';
import { safeToast } from '@/lib/utils/toastService';
import {useTranslations} from 'next-intl';
import { ActionButton } from '../ui/buttons';
import { useRouter } from '@/app/i18n/navigation';

export default function DynamicFormGenerator(props: DynamicFormProps,) {
  const isIframe = useIsIframe();
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const router = useRouter();

  const { entity, id } = props
  if (!entity) throw new Error('entity is required');
  const t = useTranslations('formsConfig');
  const form = formsConfig[entity];
  const alias = useMemo(() => (id ? form.updateAlias : form.createAlias), [id, form]);
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
  const schema = (schemas as any)[form.schemaName] as z.ZodObject<any>;
  const shape = schema.shape;
  const effectiveIgnoredFields = useMemo(
  () => (id ? [...ignoredFields, "password"] : ignoredFields),
  [id]
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
    return <Loading3/>;
  }

  return (
    <div className={cn(className) + ' container'}>
      <div className="head">

        <h2 className="title" >{title ? title : form.schemaName}</h2>

        {showBackButton &&
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
            className={`${config.submitButtonClasses} ${formRequest.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={formRequest.formState.isSubmitting}
            variant="info"
            icon={<CirclePlus size={16} />}
          />

          {!isIframe && config.includeResetButton && showResetButton && (
            <ActionButton
              onClick={() => formRequest.reset()}
              label={t('reset')}
              icon={<RefreshCw size={16} />}
              variant="outline"
            />
          )}

        </div>

      </form>
    </div>
  );
}