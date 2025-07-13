// ===== الإعدادات الافتراضية =====
import React from 'react';
import {FieldValues, Path } from 'react-hook-form';
import { GeneratorConfig } from '@/types';

import {z} from 'zod';


interface FieldTemplate {
  component: string;
  type?: string;
  props?: Record<string, any>;
  wrapper?: string;
}

export const defaultConfig: GeneratorConfig = {
  baseClasses: "input-base",
  labelClasses: "label",
  errorClasses: "error-text",
  submitButtonClasses: "btn btn-primary",
  submitButtonText: "Save",
  includeResetButton: true,
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

function getFieldLabel(field: string, schema: z.ZodTypeAny): string {
  return schema.description || field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

function isFieldRequired(schema: z.ZodTypeAny): boolean {
  return !(schema instanceof z.ZodOptional);
}


export const renderField = <T extends FieldValues>(fieldName: string, fieldSchema: z.ZodTypeAny, config: GeneratorConfig,form: Form<T>,mode: 'create' | 'edit') => {
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
              {...form.register(fieldPath)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={fieldName} className={config.labelClasses}>
              {label}
            </label>
          </div>
          {form.formState.errors[fieldPath] && (
            <p className={config.errorClasses}>
              {form.formState.errors[fieldPath]?.message as string}
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
            {...form.register(fieldPath)}
            className={config.baseClasses}
          >
            <option value="">Select...</option>
            {unwrappedSchema.options.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {form.formState.errors[fieldPath] && (
            <p className={config.errorClasses}>
              {form.formState.errors[fieldPath]?.message as string}
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
            {...form.register(fieldPath)}
            className={config.baseClasses}
            rows={rows}
            placeholder={`${label}...`}
          />
          {form.formState.errors[fieldPath] && (
            <p className={config.errorClasses}>
              {form.formState.errors[fieldPath]?.message as string}
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
              {...form.register(fieldPath)}
              className={config.baseClasses}
              placeholder="Values separated by commas"
            />
            <p className="text-xs text-gray-500">
              Enter values separated by commas
            </p>
          </div>
          {form.formState.errors[fieldPath] && (
            <p className={config.errorClasses}>
              {form.formState.errors[fieldPath]?.message as string}
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
              {...form.register(fieldPath)}
              className={config.baseClasses}
              placeholder="JSON object"
            />
          </div>
          {form.formState.errors[fieldPath] && (
            <p className={config.errorClasses}>
              {form.formState.errors[fieldPath]?.message as string}
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
          {...form.register(fieldPath)}
          className={config.baseClasses}
          placeholder={`${label}...`}
          disabled={isDisabled}
          {...(template.props || {})}
        />
        { form.formState.errors[fieldPath] && (
          <p className={config.errorClasses}>
            {form.formState.errors[fieldPath]?.message as string}
          </p>
        )}
      </div>
    );
  };