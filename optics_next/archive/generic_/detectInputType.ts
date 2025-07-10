// components/forms/detectInputType.ts
import { ZodTypeAny } from 'zod';

export function detectInputType(field: string, schema: ZodTypeAny): string {
  const type =
    schema._def?.typeName || schema._def?.innerType?._def?.typeName;

  const fieldLower = field.toLowerCase();

  if (fieldLower.includes('email')) return 'email';
  if (fieldLower.includes('password')) return 'password';
  if (fieldLower.includes('phone') || fieldLower.includes('tel')) return 'tel';
  if (fieldLower.includes('url')) return 'url';
  if (type === 'ZodNumber') return 'number';
  if (type === 'ZodBoolean') return 'checkbox';
  if (type === 'ZodEnum') return 'select';
  if (type === 'ZodDate') return 'date';
  if (type === 'ZodString') return 'text';
  return 'text';
}
