import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import { GeneratorConfig } from '@/types/DynamicFormTypes';
import { fieldTemplates } from './DynamicFormhelper';
import { z } from 'zod';
import { detectFieldType ,unwrapSchema} from './detectFieldType';



function getFieldLabel(field: string, schema: z.ZodTypeAny): string {
  return schema.description || field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

function isFieldRequired(schema: z.ZodTypeAny): boolean {
  return !(schema instanceof z.ZodOptional);
}


export const renderField = <T extends FieldValues>(fieldName: string, fieldSchema: z.ZodTypeAny, config: GeneratorConfig, form: Form<T>, mode: 'create' | 'edit') => {
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
          <option className="select-option" value="">Select...</option>
          {unwrappedSchema.options.map((option: string) => (
            <option className="select-option" key={option} value={option}>
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
  const isHidden = mode === 'edit' && fieldName === 'password';

  return (
    <div key={fieldName} className={config.spacing}>
      {!isHidden && (
        <label htmlFor={fieldName} className={config.labelClasses}>
          {label}{required ? ' *' : ''}
        </label>
      )}
      <input
        id={fieldName}
        type={inputType}
        {...form.register(fieldPath)}
        className={config.baseClasses}
        placeholder={`${label}...`}
        disabled={isDisabled}
        hidden={isHidden}
        {...(template.props || {})}
      />
      {form.formState.errors[fieldPath] && (
        <p className={config.errorClasses}>
          {form.formState.errors[fieldPath]?.message as string}
        </p>
      )}
    </div>
  );
};