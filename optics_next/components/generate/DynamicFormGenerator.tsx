// import React from 'react';
// import { FieldValues } from 'react-hook-form';
// import { schemas } from '@/lib/api/zodClient';
// import { z } from 'zod';
// import { CircleX, TimerReset } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { GeneratorConfig, FieldTemplate } from '@/types/DynamicFormTypes';
// import { defaultConfig } from './DynamicFormhelper';
// import { renderField } from './renderField';
// import Button from '@/components/ui/button/Button';
// import { cn } from '@/lib/utils/cn';
// import { useCrudFormRequest } from "@/lib/hooks/useCrudFormRequest";
// import { createFetcher } from '@/lib/hooks/useCrudFormRequest';
// import { Loading4 } from '@/components/ui/loding';
// import { DynamicFormProps } from '@/types/DynamicFormTypes';


// // main component
// export default function DynamicFormGenerator<T extends FieldValues>({
//   schemaName,
//   onSuccess,
//   className = "",
//   submitText,
//   showCancelButton = true,
//   mode = 'create',
//   config: userConfig = {},
//   alias,
//   id
// }: DynamicFormProps<T>) {
//   const [defaultValues, setDefaultValues] = useState<any>(null);
//   const fetchUser = createFetcher(alias!, setDefaultValues);
//   const router = useRouter();

//   const config = { ...defaultConfig, ...userConfig };
//   const schema = (schemas as any)[schemaName] as z.ZodObject<any>;
//   const shape = schema.shape;
//   const ignoredFields = ['id', 'created_at', 'updated_at', 'owner', 'tenant', 'group','is_active','is_deleted','deleted_at'];
//   if (mode === 'edit') {
//     ignoredFields.push('password');
//   }
//   const allFields = Object.keys(shape).filter((f) => !ignoredFields.includes(f));
//   const visibleFields = config.fieldOrder || allFields;

//   const { form, onSubmit } = useCrudFormRequest({
//     alias: alias!, defaultValues,
//     onSuccess: (res) => { onSuccess?.();}
//   });


//   useEffect(() => {
//     if (mode === 'edit' && id) {
//       fetchUser({ id: id });
//     }
//   }, [mode, id]);

//   useEffect(() => {
//     if (defaultValues) {
//       form.reset(defaultValues);
//     }
//   }, [defaultValues]);


//   if (mode === 'edit' && !defaultValues) {
//     return <Loading4 />;
//   }


//   return (
//     <div className={cn(className, "container")}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className={config.containerClasses} >
//         {visibleFields.map((fieldName: string) => renderField(fieldName, shape[fieldName], config, form, mode))}

//         <div className="flex gap-3 pt-4">
//           <Button
//             type="submit"
//             label={form.formState.isSubmitting ? 'Saving...' : (submitText || config.submitButtonText)}
//             onClick={() => form.handleSubmit(onSubmit)}
//             className={`${config.submitButtonClasses} ${form.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//               }`}
//             disabled={form.formState.isSubmitting}
//             variant="success"
//             icon={<TimerReset size={16} />}
//           />

//           {config.includeResetButton && (
//             <Button
//               label="Reset"
//               onClick={() => form.reset()}
//               variant="info"
//               icon={<TimerReset size={16} />}
//             />
//           )}

//           {showCancelButton && (
//             <Button
//               label="Cancel"
//               onClick={() => router.back()}
//               variant="secondary"
//               icon={<CircleX size={16} />}
//             />
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }

"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { schemas } from '@/lib/api/zodClient';
import { createFetcher } from '@/lib/hooks/useCrudFormRequest';
import { useCrudFormRequest } from '@/lib/hooks/useCrudFormRequest';
import { Loading4 } from '@/components/ui/loding';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
// ===== أنواع البيانات والواجهات =====
interface GeneratorConfig {
  baseClasses: string;
  labelClasses: string;
  errorClasses: string;
  submitButtonClasses: string;
  submitButtonText: string;
  includeResetButton: boolean;
  fieldOrder?: string[];
  spacing: string;
  containerClasses: string;
}

interface FieldTemplate {
  component: string;
  type?: string;
  props?: Record<string, any>;
  wrapper?: string;
}

interface DynamicFormProps<T> {
  schemaName: string;
  onSuccess?: () => void;
  className?: string;
  submitText?: string;
  showCancelButton?: boolean;
  mode?: 'create' | 'edit';
  config?: Partial<GeneratorConfig>;
  alias?: string;
  id?: string;
}

interface ForeignKeyConfig {
  endpoint: string;
  labelField: string;
  valueField: string;
  searchField?: string;
}

interface RelationshipConfig {
  [fieldName: string]: ForeignKeyConfig;
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
  'range': { component: 'input', type: 'range' },
  'foreignkey': { component: 'select' },
  'union': { component: 'select' }
};

// إعدادات العلاقات - يجب تخصيصها حسب التطبيق
const relationshipConfigs: RelationshipConfig = {
  employee_id: {
    endpoint: 'hrm_employees_list',
    labelField: 'name',
    valueField: 'id',
    searchField: 'name'
  },
  user_id: {
    endpoint: 'users_users_list',
    labelField: 'username',
    valueField: 'id',
    searchField: 'username'
  },
  category_id: {
    endpoint: 'hrm_categories_list',
    labelField: 'name',
    valueField: 'id',
    searchField: 'name'
  },
  department_id: {
    endpoint: 'hrm_departments_list',
    labelField: 'name',
    valueField: 'id',
    searchField: 'name'
  },
  role_id: {
    endpoint: 'hrm_roles_list',
    labelField: 'name',
    valueField: 'id',
    searchField: 'name'
  }
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
  if (field.endsWith('_id') && relationshipConfigs[field]) {
    return 'foreignkey';
  }
  
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

function getFieldLabel(field: string, schema: z.ZodTypeAny): string {
  return schema.description || field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

function isFieldRequired(schema: z.ZodTypeAny): boolean {
  return !(schema instanceof z.ZodOptional);
}

// استخراج خيارات Union
function getUnionOptions(schema: z.ZodUnion<any>): string[] {
  const options: string[] = [];
  
  schema._def.options.forEach((option: any) => {
    if (option instanceof z.ZodLiteral) {
      options.push(option.value);
    } else if (option instanceof z.ZodString) {
      // يمكن إضافة logic إضافي هنا للتعامل مع string enums
      options.push(option._def.value || 'string');
    }
  });
  
  return options;
}

// مكون لتحميل البيانات المرتبطة
function useForeignKeyData(fieldName: string, fieldType: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const alies = relationshipConfigs[fieldName].endpoint;
  const fetchForeignKeyData = useFormRequest({
    alias: alies,
    onSuccess: (res) => {
      setData(Array.isArray(res) ? res : res.data || []);
      setLoading(false);
    },
    onError: (err) => {
      console.error("Error", err);
      setLoading(false);
    },
  });
  
  // ثم تستخدمه داخل useEffect
  useEffect(() => {
    if (fieldType === 'foreignkey' && relationshipConfigs[fieldName]) {
      setLoading(true);
      fetchForeignKeyData.submitForm(); // حسب طريقة استخدام hook
    }
  }, [fieldName, fieldType]);
  

  return { data, loading };
}

// مكون حقل Foreign Key
function ForeignKeyField({ 
  fieldName, 
  register, 
  config, 
  label, 
  required, 
  errors 
}: any) {
  const { data, loading } = useForeignKeyData(fieldName, 'foreignkey');
  const relationConfig = relationshipConfigs[fieldName];
  
  if (!relationConfig) return null;
  
  return (
    <div className={config.spacing}>
      <label htmlFor={fieldName} className={config.labelClasses}>
        {label}{required ? ' *' : ''}
      </label>
      <select
        id={fieldName}
        {...register(fieldName)}
        className={config.baseClasses}
        disabled={loading}
      >
        <option value="">
          {loading ? 'جاري التحميل...' : 'اختر...'}
        </option>
        {data.map((item: any) => (
          <option key={item[relationConfig.valueField]} value={item[relationConfig.valueField]}>
            {item[relationConfig.labelField]}
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

// مكون حقل Union
function UnionField({ 
  fieldName, 
  fieldSchema,
  register, 
  config, 
  label, 
  required, 
  errors 
}: any) {
  const unwrappedSchema = unwrapSchema(fieldSchema);
  const options = getUnionOptions(unwrappedSchema);
  
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
        <option value="">اختر...</option>
        {options.map((option: string) => (
          <option key={option} value={option}>
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

// ===== المكون الرئيسي =====

// تم تحويل renderField إلى مكون مستقل لضمان الاستدعاء الصحيح للـ Hooks
const RenderFieldComponent = ({ fieldName, fieldSchema, form, config }: any) => {
  const fieldType = detectFieldType(fieldName, fieldSchema);
  const template = fieldTemplates[fieldType] || fieldTemplates['text'] || { component: 'input', type: 'text' };
  const unwrappedSchema = unwrapSchema(fieldSchema);
  const label = getFieldLabel(fieldName, fieldSchema);
  const required = isFieldRequired(fieldSchema);

  // معالجة Foreign Key
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
          {label}{required ? ' *' : ''}
        </label>
        <select
          id={fieldName}
          {...form.register(fieldName)}
          className={config.baseClasses}
        >
          <option value="">اختر...</option>
          {unwrappedSchema.options.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
          {label}{required ? ' *' : ''}
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
          {label}{required ? ' *' : ''}
        </label>
        <div className="space-y-2">
          <input
            id={fieldName}
            type="text"
            {...form.register(fieldName)}
            className={config.baseClasses}
            placeholder="قيم مفصولة بفواصل"
          />
          <p className="text-xs text-gray-500">
            أدخل القيم مفصولة بفواصل
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
          {label}{required ? ' *' : ''}
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
        {label}{required ? ' *' : ''}
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

export default function DynamicFormGenerator<T>({
  schemaName,
  onSuccess,
  className = "",
  submitText,
  showCancelButton = true,
  mode = 'create',
  config: userConfig = {},
  alias,
  id
}: DynamicFormProps<T>) {
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const fetchUser = createFetcher(alias!, setDefaultValues);
  const router = useRouter();

  const config = { ...defaultConfig, ...userConfig };
  const schema = (schemas as any)[schemaName] as z.ZodObject<any>;
  const shape = schema.shape;
  
  const ignoredFields = ['id', 'created_at', 'updated_at', 'owner', 'tenant', 'group','is_active','is_deleted','deleted_at'];
  if (mode === 'edit') {
    ignoredFields.push('password');
  }
  const allFields = Object.keys(shape).filter((f) => !ignoredFields.includes(f));
  const visibleFields = config.fieldOrder || allFields;

  const { form, onSubmit } = useCrudFormRequest({
    alias: alias!, 
    defaultValues,
    onSuccess: (res) => { onSuccess?.(); }
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchUser({ id: id });
    }
  }, [mode, id]);

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues]);

  if (mode === 'edit' && !defaultValues) {
    return <Loading4 />;
  }

  return (
    <div className={className}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={config.containerClasses}>
        {visibleFields.map((fieldName) => (
          <RenderFieldComponent
            key={fieldName}
            fieldName={fieldName}
            fieldSchema={shape[fieldName]}
            form={form}
            config={config}
          />
        ))}
        
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
              onClick={() => form.reset()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              إعادة تعيين
            </button>
          )}
          
          {showCancelButton && (
            <button
              type="button"
              onClick={() => router.back()}
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