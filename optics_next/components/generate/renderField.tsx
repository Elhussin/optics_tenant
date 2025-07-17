"use client"
import React, { useState } from 'react';
import { z } from 'zod';
import { detectFieldType, unwrapSchema } from './detectFieldType';
import { getFieldLabel, isFieldRequired } from './DynamicFormhelper';
import { ForeignKeyField, UnionField } from './detectFieldType';
import { fieldTemplates } from './dataConfig';
import { Controller } from "react-hook-form";
import ReactSelect from "react-select";

export const RenderField = ({ fieldName, fieldSchema, form, config }: any) => {
  const fieldType = detectFieldType(fieldName, fieldSchema);
  const template = fieldTemplates[fieldType] || fieldTemplates['text'] || { component: 'input', type: 'text' };
  const unwrappedSchema = unwrapSchema(fieldSchema);
  const label = getFieldLabel(fieldName, fieldSchema);
  const required = isFieldRequired(fieldSchema);


  if (fieldType === 'foreignkey') {
    return (
      <ForeignKeyField
        key={fieldName}
        fieldName={fieldName}
        register={form.register}
        config={config}
        label={label}
        required={required}
        errors={form.formState.errors}
        form={form}
      />
    );
  }

  // معالجة Union
  if (fieldType === 'union') {
    return (
      <UnionField
        key={fieldName}
        fieldName={fieldName}
        fieldSchema={fieldSchema}
        register={form.register}
        config={config}
        label={label}
        required={required}
        errors={form.formState.errors}
      />
    );
  }

  // معالجة checkbox
  if (template.wrapper === 'checkbox') {
    return (
      <div key={fieldName} className={config.spacing}>
        <div className="flex items-center space-x-2">
          <input
            id={fieldName}
            type="checkbox"
            {...form.register(fieldName)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={fieldName} className={config.labelClasses}>
            {label}
          </label>
        </div>
        {form.formState.errors[fieldName] && (
          <p className={config.errorClasses}>
            {form.formState.errors[fieldName]?.message as string}
          </p>
        )}
      </div>
    );
  }

  // معالجة select عادي (enum)
  if (fieldType === 'select' && unwrappedSchema instanceof z.ZodEnum) {
    return (
  
      <div key={fieldName} className={config.spacing}>
      <label htmlFor={fieldName} className={config.labelClasses}>
        {label}
        {required ? <span className="text-red-500">*</span> : ''}
      </label>
    
      <Controller
        name={fieldName}
        control={form.control}
        rules={{ required: required ? `${label} is required` : false }}
        render={({ field }) => (
          <ReactSelect
              menuPortalTarget={document.body}
            id={fieldName}
            options={unwrappedSchema.options.map((opt: string) => ({
              label: getFieldLabel(opt, unwrappedSchema),
              value: opt
            }))}
            onChange={(selectedOption) => field.onChange(selectedOption?.value)}
            onBlur={field.onBlur}
            value={
              unwrappedSchema.options
                .map((opt: string) => ({ label: opt, value: opt }))
                .find((opt : any) => opt.value === field.value) || null
            }
            placeholder="Select..."
            isClearable
              classNamePrefix="rs"

          />
        )}
      />
    
      {form.formState.errors[fieldName] && (
        <p className={config.errorClasses}>
          {form.formState.errors[fieldName]?.message as string}
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
          {label}{required ? <span className="text-red-500">*</span> : ''}
        </label>
        <textarea
          id={fieldName}
          {...form.register(fieldName)}
          className={config.baseClasses}
          rows={rows}
          placeholder={`${label}...`}
        />
        {form.formState.errors[fieldName] && (
          <p className={config.errorClasses}>
            {form.formState.errors[fieldName]?.message as string}
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
          {label}{required ? <span className="text-red-500">*</span> : ''}
        </label>
        <div className="space-y-2">
          <input
            id={fieldName}
            type="text"
            {...form.register(fieldName)}
            className={config.baseClasses}
            placeholder="add values separated by commas"
          />
          <p className="text-xs text-gray-500">
            add values separated by commas
          </p>
        </div>
        {form.formState.errors[fieldName] && (
          <p className={config.errorClasses}>
            {form.formState.errors[fieldName]?.message as string}
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
          {label}{required ? <span className="text-red-500">*</span> : ''}
        </label>
        <div className="border border-gray-200 rounded-md p-3">
          <input
            id={fieldName}
            type="text"
            {...form.register(fieldName)}
            className={config.baseClasses}
            placeholder="JSON object"
          />
        </div>
        {form.formState.errors[fieldName] && (
          <p className={config.errorClasses}>
            {form.formState.errors[fieldName]?.message as string}
          </p>
        )}
      </div>
    );
  }

  // معالجة input عادي
  const inputType = template.type || 'text';
  const mode = form.formState.defaultValues ? 'edit' : 'create'; // A way to infer mode
  const isDisabled = mode === 'edit' && (fieldName === 'email' || fieldName === 'username' || fieldName === 'password');

  return (
    <div key={fieldName} className={config.spacing}>
      <label htmlFor={fieldName} className={config.labelClasses}>
        {label}{required ? <span className="text-red-500">*</span> : ''}
      </label>
      <input
        id={fieldName}
        type={inputType}
        {...form.register(fieldName)}
        className={config.baseClasses}
        placeholder={`${label}...`}
        disabled={isDisabled}
        {...(template.props || {})}
      />
      {form.formState.errors[fieldName] && (
        <p className={config.errorClasses}>
          {form.formState.errors[fieldName]?.message as string}
        </p>
      )}
    </div>
  );
};
