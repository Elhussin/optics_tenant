"use client"
import { z } from 'zod';

export function getFieldLabel(field: string, schema?: z.ZodTypeAny): string {
  return schema?.description || field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

export function isFieldRequired(schema: z.ZodTypeAny): boolean {
  return !(schema instanceof z.ZodOptional);
}