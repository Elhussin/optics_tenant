// utils/detectFieldType.ts
import { z } from 'zod';
import { unwrapSchema } from '@/lib/utils/generateForm';

export function detectFieldType(field: string, rawSchema: z.ZodTypeAny): string {
  const schema = unwrapSchema(rawSchema);
  const fieldLower = field.toLowerCase();

  if (fieldLower.includes('email')) return 'email';
  if (fieldLower.includes('password')) return 'password';
  if (fieldLower.includes('phone') || fieldLower.includes('tel')) return 'tel';
  if (fieldLower.includes('url') || fieldLower.includes('website')) return 'url';
  if (fieldLower.includes('color')) return 'color';
  if (fieldLower.includes('date')) return 'date';
  if (fieldLower.includes('time')) return 'time';
  if (fieldLower.includes('description') || fieldLower.includes('content') || fieldLower.includes('notes')) return 'textarea';

  if (schema instanceof z.ZodBoolean) return 'checkbox';
  if (schema instanceof z.ZodEnum) return 'select';
  if (schema instanceof z.ZodNumber) return 'number';
  if (schema instanceof z.ZodString) return 'text';
  if (schema instanceof z.ZodArray) return 'array';
  if (schema instanceof z.ZodObject) return 'object';

  return 'text';
}
