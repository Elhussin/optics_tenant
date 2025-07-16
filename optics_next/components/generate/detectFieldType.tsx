import { z } from 'zod';
import { relationshipConfigs } from './dataConfig';
import { useState, useEffect } from 'react';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import Link from 'next/link';
import Modal from "@/components/view/Modal";
import Button from "@/components/ui/buttons/Button";
import { CirclePlus } from 'lucide-react';

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


// استخراج خيارات Union
export function getUnionOptions(schema: z.ZodUnion<any>): string[] {
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


export function useForeignKeyData(fieldName: string, fieldType: string) {
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

export function ForeignKeyField({ 
  fieldName, 
  register, 
  config, 
  label, 
  required, 
  errors 
}: any) {
  const { data, loading } = useForeignKeyData(fieldName, 'foreignkey');
  const relationConfig = relationshipConfigs[fieldName];
  const [showModal, setShowModal] = useState(false);
  if (!relationConfig) return null;
  
  return (
    <div className={config.spacing}>
      <label htmlFor={fieldName} className={config.labelClasses}>
        {label}{required ? <span className="text-red-500">*</span> : ''}
       
      </label>
      <div className="flex items-center">
      <select
        id={fieldName}
        {...register(fieldName)}
        className={config.baseClasses}
        disabled={loading}
      >
        <option value="" className="option">
          {loading ? 'Loading...' : 'Select...'}
        </option>
        {data.map((item: any) => (
          <option className="option" key={item[relationConfig.valueField]} value={item[relationConfig.valueField]}>
            {item[relationConfig.labelField]}
          </option>
        ))}
      </select>

      
      <Button
      onClick={() => setShowModal(true)}
      variant="info"
      className="ml-2"
      icon={<CirclePlus size={16} />}
      label="Add"

      />
      </div>
      {showModal && (
        <Modal url={relationConfig.createPage || ''} onClose={() => setShowModal(false)} />
      )}

      {errors[fieldName] && (
        <p className={config.errorClasses}>
          {errors[fieldName]?.message}
        </p>
      )}
    </div>
  );
}

// مكون حقل Union
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
