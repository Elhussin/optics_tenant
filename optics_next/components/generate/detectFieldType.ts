import { z } from 'zod';
import { RelationshipConfig } from '@/types/DynamicFormTypes';


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
  
  // فحص إذا كان الحقل foreign key
  if (field.endsWith('_id') && relationshipConfigs[field]) {
    return 'foreignkey';
  }
  
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
