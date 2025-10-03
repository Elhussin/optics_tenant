"use client"
import { z } from 'zod';
import { relationshipConfigs } from '@/src/features/dashboard/api/generatFormConfig';
import { useState, useEffect } from 'react';
import { useApiForm } from '@/src/shared/hooks/useApiForm';
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from 'lucide-react';
import ReactSelect from 'react-select';
import { Controller } from 'react-hook-form';
import { formsConfig } from '@/src/features/dashboard/api/entityConfig';

export function unwrapSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  while (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodNullable ||
    schema instanceof z.ZodDefault
  ) {
    schema = schema._def.innerType;
  }
  return schema;
}

export function detectFieldType(field: string, rawSchema: z.ZodTypeAny): string {
  const schema = unwrapSchema(rawSchema);
  if (field.endsWith('_id') && relationshipConfigs[field]) {
    return 'foreignkey';
  }
  // check field name
  const fieldLower = field.toLowerCase();
  if (fieldLower.includes('email')) return 'email';
  if (fieldLower.includes('password')) return 'password';
  if (fieldLower.includes('phone') || fieldLower.includes('tel')) return 'tel';
  if (fieldLower.includes('url') || fieldLower.includes('website')) return 'url';
  if (fieldLower.includes('color')) return 'color';
  if (fieldLower.includes('date')) return 'date';
  if (fieldLower.includes('time')) return 'time';
  if (fieldLower.includes('description') || fieldLower.includes('content') || fieldLower.includes('notes')) return 'textarea';

  // check schema type
  if (schema instanceof z.ZodBoolean) return 'checkbox';
  if (schema instanceof z.ZodEnum) return 'select';
  if (schema instanceof z.ZodUnion) return 'union';
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

export function getUnionOptions(schema: z.ZodUnion<any>): string[] {
  const options: string[] = [];
  schema._def.options.forEach((option: any) => {
    if (option instanceof z.ZodLiteral) {
      options.push(option.value);
    } else if (option instanceof z.ZodString) {
      options.push('string');
    }
  });
  return options;
}

export function useForeignKeyData(entityName: string, setData: any) {
  const [loading, setLoading] = useState(false);
  const alias = formsConfig[entityName]?.listAlias;
  const fetchForeignKeyData = useApiForm({ alias: alias });
  useEffect(() => {
    (async () => {
      if (alias) {
        setLoading(true);
        const res = await fetchForeignKeyData.query.refetch();
        if (res?.data?.results) {
          setData(res.data.results.reverse());
          setLoading(false);
        }
      }
    })();
  }, [entityName, alias]);
}

export function ForeignKeyField({
  fieldName,
  register,
  config,
  label,
  required,
  errors,
  form,
  setShowModal,

}: any) {


  const [data, setData] = useState<any[]>([]);

  const relationConfig = relationshipConfigs[fieldName];


  useForeignKeyData(relationConfig.entityName!, setData);

  if (!relationConfig) return null;

  return (

    <div className={config.spacing}>

      <label htmlFor={fieldName} className={config.labelClasses}>
        {label}{required ? <span className="text-red-500">*</span> : ''}

      </label>
      <div className="flex items-center w-full">
        <Controller
          name={fieldName}
          control={form.control}
          render={({ field }) => (
            <ReactSelect

              {...field}
              options={data.map((item: any) => ({
                value: item?.[relationConfig?.valueField],
                label: item?.[relationConfig?.labelField],
              }))}
              onChange={(selected: any) => field.onChange(selected?.value)}
              value={data
                .map((item: any) => ({
                  value: item?.[relationConfig?.valueField],
                  label: item?.[relationConfig?.labelField],
                }))
                .find((opt: any) => opt.value === field.value) || null}
              placeholder="Select..."
              isClearable
              classNamePrefix="rs"
              className="w-full"

            />
          )}
        />



        <ActionButton
          onClick={() => setShowModal(true)}
          variant="outline"
          className="ml-2 p-4"
          icon={<CirclePlus size={18} color="green" />}
          title="Add"
        />
      </div>
      {errors[fieldName] && (
        <p className={config.errorClasses}>
          {errors[fieldName]?.message}
        </p>
      )}
    </div>
  );
}

export function UnionField({
  fieldName,
  fieldSchema,
  register,
  config,
  label,
  required,
  errors
}: any) {
  const unwrappedSchema = unwrapSchema(fieldSchema);
  const options =
    unwrappedSchema instanceof z.ZodUnion
      ? getUnionOptions(unwrappedSchema)
      : [];




  return (
    <div className={config.spacing}>
      <label htmlFor={fieldName} className={config.labelClasses}>
        {label}{required ? ' *' : ''}
      </label>
      <select
        id={fieldName}
        {...register(fieldName)}
        className={config.baseClasses}
      >
        <option value="" className="option">Select...</option>
        {options.map((option: string) => (
          <option className="option" key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors[fieldName] && (
        <p className={config.errorClasses}>
          {errors[fieldName]?.message}
        </p>
      )}
    </div>
  );
}

export function useFieldOptions(fieldName: string, fieldType: string, schema?: z.ZodEnum<any>) {
  if (fieldType === "select" && schema) {
    return {
      data: schema.options.map((opt: any) => ({ label: opt, value: opt })),
      loading: false,
    };
  }

  return { data: [], loading: false };
}
