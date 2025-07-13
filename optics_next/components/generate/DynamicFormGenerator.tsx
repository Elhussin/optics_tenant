import React from 'react';
import {FieldValues, Path } from 'react-hook-form';
import { GeneratorConfig } from '@/types';
import {useCrudFormRequest} from '@/lib/hooks/useCrudFormRequest';
import {useCrudHandlers} from '@/lib/hooks/useCrudHandlers';
import {schemas} from '@/lib/api/zodClient';
import {z} from 'zod';
import { defaultConfig,renderField } from './renderField';


interface DynamicFormProps<T extends FieldValues> {
  // schema: z.ZodSchema<T>;
  schemaName: string;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  defaultValues?: Partial<T>;
  className?: string;
  submitText?: string;
  showCancelButton?: boolean;
  mode?: 'create' | 'edit';
  config?: Partial<GeneratorConfig>;
  alias?: string;
  onSuccess?: () => void;
}



// ===== الوظائف المساعدة =====



// ===== المكون الرئيسي =====
export default function DynamicFormGenerator<T extends FieldValues>({
  schemaName,
  onSuccess,
  defaultValues,
  className = "",
  submitText,
  showCancelButton = false,
  mode = 'create',
  config: userConfig = {},
  alias
}: DynamicFormProps<T>) {
  
  const config = { ...defaultConfig, ...userConfig };
  console.log(schemaName);

  const schema = (schemas as any)[schemaName] as z.ZodObject<any>;
  const shape = schema.shape;
  
  // تصفية الحقول المتجاهلة
  const ignoredFields = ['id', 'created_at', 'updated_at', 'owner', 'tenant', 'group'];
  const allFields = Object.keys(shape).filter((f) => !ignoredFields.includes(f));
  const visibleFields = config.fieldOrder || allFields;
  const { handleCancel } = useCrudHandlers(alias!);

    const { form, onSubmit } = useCrudFormRequest({alias: alias!,defaultValues,
      onSuccess: (res) => { onSuccess?.(); console.log(res); }      
    });  // معالجة إرسال النموذج
 
  // توليد حقل النموذج


  return (
    <div className={className}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={config.containerClasses }>
        {visibleFields.map((fieldName: string) => renderField(fieldName, shape[fieldName], config,form,mode))}
        
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={`${config.submitButtonClasses} ${
              form.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {form.formState.isSubmitting ? 'Saving...' : (submitText || config.submitButtonText)}
          </button>
          
          {config.includeResetButton && (
            <button
              type="button"
              onClick={() => form.reset()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Reset
            </button>
          )}
          
          {showCancelButton && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}