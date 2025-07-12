import React from 'react';
import { useForm, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GeneratorConfig } from '@/types';
import {useCrudFormRequest} from '@/lib/hooks/useCrudFormRequest';
import {useCrudHandlers} from '@/lib/hooks/useCrudHandlers';
interface FieldTemplate {
  component: string;
  type?: string;
  props?: Record<string, any>;
  wrapper?: string;
}

interface DynamicFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>;
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

// ===== الإعدادات الافتراضية =====
const defaultConfig: GeneratorConfig = {
  baseClasses: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  labelClasses: "block text-sm font-medium text-gray-700 mb-1",
  errorClasses: "text-red-500 text-sm mt-1",
  submitButtonClasses: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors",
  submitButtonText: "حفظ",
  includeResetButton: false,
  spacing: "mb-4",
  containerClasses: "space-y-4"
};

const fieldTemplates: Record<string, FieldTemplate> = {
  'email': { component: 'input', type: 'email' },
  'password': { component: 'input', type: 'password' },
  'url': { component: 'input', type: 'url' },
  'tel': { component: 'input', type: 'tel' },
  'number': { component: 'input', type: 'number' },
  'date': { component: 'input', type: 'date' },
  'datetime': { component: 'input', type: 'datetime-local' },
  'time': { component: 'input', type: 'time' },
  'textarea': { component: 'textarea', props: { rows: 3 } },
  'select': { component: 'select' },
  'checkbox': { component: 'input', type: 'checkbox', wrapper: 'checkbox' },
  'radio': { component: 'input', type: 'radio', wrapper: 'radio' },
  'file': { component: 'input', type: 'file' },
  'color': { component: 'input', type: 'color' },
  'range': { component: 'input', type: 'range' }
};

// ===== الوظائف المساعدة =====
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

function detectFieldType(field: string, rawSchema: z.ZodTypeAny): string {
  const schema = unwrapSchema(rawSchema);
  
  // تحليل اسم الحقل
  const fieldLower = field.toLowerCase();
  if (fieldLower.includes('email')) return 'email';
  if (fieldLower.includes('password')) return 'password';
  if (fieldLower.includes('phone') || fieldLower.includes('tel')) return 'tel';
  if (fieldLower.includes('url') || fieldLower.includes('website')) return 'url';
  if (fieldLower.includes('color')) return 'color';
  if (fieldLower.includes('date')) return 'date';
  if (fieldLower.includes('time')) return 'time';
  if (fieldLower.includes('description') || fieldLower.includes('content') || fieldLower.includes('notes')) return 'textarea';
  
  // تحليل نوع الـ schema
  if (schema instanceof z.ZodBoolean) return 'checkbox';
  if (schema instanceof z.ZodEnum) return 'select';
  if (schema instanceof z.ZodNumber) return 'number';
  
  if (schema instanceof z.ZodString) {
    const checks = schema._def.checks || [];
    const hasEmail = checks.some((c: any) => c.kind === 'email');
    const hasUrl = checks.some((c: any) => c.kind === 'url');
    const hasMinLength = checks.some((c: any) => c.kind === 'min' && c.value >= 6);
    const hasMaxLength = checks.some((c: any) => c.kind === 'max' && c.value > 100);
    
    if (hasEmail) return 'email';
    if (hasUrl) return 'url';
    if (hasMinLength && fieldLower.includes('password')) return 'password';
    if (hasMaxLength) return 'textarea';
  }
  
  if (schema instanceof z.ZodArray) return 'array';
  if (schema instanceof z.ZodObject) return 'object';
  
  return 'text';
}

function getFieldLabel(field: string, schema: z.ZodTypeAny): string {
  return schema.description || field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

function isFieldRequired(schema: z.ZodTypeAny): boolean {
  return !(schema instanceof z.ZodOptional);
}

// ===== المكون الرئيسي =====
export default function DynamicFormGenerator<T extends FieldValues>({
  schema,
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
  
  const shape = (schema as any).shape || {};
  
  // تصفية الحقول المتجاهلة
  const ignoredFields = ['id', 'created_at', 'updated_at', 'owner', 'tenant', 'group'];
  const allFields = Object.keys(shape).filter((f) => !ignoredFields.includes(f));
  const visibleFields = config.fieldOrder || allFields;
  const { handleCancel, handleRefresh, handleReset } = useCrudHandlers(alias!);

    const { form, onSubmit } = useCrudFormRequest({alias: alias!,defaultValues,
      onSuccess: (res) => { onSuccess?.(); console.log(res); }      
    });  // معالجة إرسال النموذج
 
  // توليد حقل النموذج
  const renderField = (fieldName: string, fieldSchema: z.ZodTypeAny) => {
    const fieldType = detectFieldType(fieldName, fieldSchema);
    const template = fieldTemplates[fieldType] || fieldTemplates['text'] || { component: 'input', type: 'text' };
    const unwrappedSchema = unwrapSchema(fieldSchema);
    const label = getFieldLabel(fieldName, fieldSchema);
    const required = isFieldRequired(fieldSchema);
    const fieldPath = fieldName as Path<T>;

    // معالجة checkbox
    if (template.wrapper === 'checkbox') {
      return (
        <div key={fieldName} className={config.spacing}>
          <div className="flex items-center space-x-2">
            <input
              id={fieldName}
              type="checkbox"
              {...register(fieldPath)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={fieldName} className={config.labelClasses}>
              {label}
            </label>
          </div>
          {errors[fieldPath] && (
            <p className={config.errorClasses}>
              {errors[fieldPath]?.message as string}
            </p>
          )}
        </div>
      );
    }

    // معالجة select
    if (fieldType === 'select' && unwrappedSchema instanceof z.ZodEnum) {
      return (
        <div key={fieldName} className={config.spacing}>
          <label htmlFor={fieldName} className={config.labelClasses}>
            {label}{required ? ' *' : ''}
          </label>
          <select
            id={fieldName}
            {...register(fieldPath)}
            className={config.baseClasses}
          >
            <option value="">اختر...</option>
            {unwrappedSchema.options.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors[fieldPath] && (
            <p className={config.errorClasses}>
              {errors[fieldPath]?.message as string}
            </p>
          )}
        </div>
      );
    }

    // معالجة textarea
    if (fieldType === 'textarea') {
      const rows = template.props?.rows || 3;
      return (
        <div key={fieldName} className={config.spacing}>
          <label htmlFor={fieldName} className={config.labelClasses}>
            {label}{required ? ' *' : ''}
          </label>
          <textarea
            id={fieldName}
            {...register(fieldPath)}
            className={config.baseClasses}
            rows={rows}
            placeholder={`${label}...`}
          />
          {errors[fieldPath] && (
            <p className={config.errorClasses}>
              {errors[fieldPath]?.message as string}
            </p>
          )}
        </div>
      );
    }

    // معالجة array
    if (fieldType === 'array') {
      return (
        <div key={fieldName} className={config.spacing}>
          <label htmlFor={fieldName} className={config.labelClasses}>
            {label}{required ? ' *' : ''}
          </label>
          <div className="space-y-2">
            <input
              id={fieldName}
              type="text"
              {...register(fieldPath)}
              className={config.baseClasses}
              placeholder="قيم مفصولة بفواصل"
            />
            <p className="text-xs text-gray-500">
              أدخل القيم مفصولة بفواصل
            </p>
          </div>
          {errors[fieldPath] && (
            <p className={config.errorClasses}>
              {errors[fieldPath]?.message as string}
            </p>
          )}
        </div>
      );
    }

    // معالجة object
    if (fieldType === 'object') {
      return (
        <div key={fieldName} className={config.spacing}>
          <label htmlFor={fieldName} className={config.labelClasses}>
            {label}{required ? ' *' : ''}
          </label>
          <div className="border border-gray-200 rounded-md p-3">
            <input
              id={fieldName}
              type="text"
              {...register(fieldPath)}
              className={config.baseClasses}
              placeholder="JSON object"
            />
          </div>
          {errors[fieldPath] && (
            <p className={config.errorClasses}>
              {errors[fieldPath]?.message as string}
            </p>
          )}
        </div>
      );
    }

    // معالجة input عادي
    const inputType = template.type || 'text';
    const isDisabled = mode === 'edit' && (fieldName === 'email' || fieldName === 'username' || fieldName === 'password');
    
    return (
      <div key={fieldName} className={config.spacing}>
        <label htmlFor={fieldName} className={config.labelClasses}>
          {label}{required ? ' *' : ''}
        </label>
        <input
          id={fieldName}
          type={inputType}
          {...register(fieldPath)}
          className={config.baseClasses}
          placeholder={`${label}...`}
          disabled={isDisabled}
          {...(template.props || {})}
        />
        {errors[fieldPath] && (
          <p className={config.errorClasses}>
            {errors[fieldPath]?.message as string}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={config.containerClasses}>
        {visibleFields.map((fieldName: string) => renderField(fieldName, shape[fieldName]))}
        
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={`${config.submitButtonClasses} ${
              form.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {form.formState.isSubmitting ? 'جاري الحفظ...' : (submitText || config.submitButtonText)}
          </button>
          
          {config.includeResetButton && (
            <button
              type="button"
              onClick={() => handleReset()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              إعادة تعيين
            </button>
          )}
          
          {showCancelButton && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>
    </div>
  );
}