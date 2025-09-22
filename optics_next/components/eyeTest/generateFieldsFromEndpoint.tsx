// تعريف موحد للحقل


import { endpoints } from '@/lib/api/zodClient';
import { SearchField } from '@/types/search';
import { formatLabel} from '@/utils/cardViewHelper'


export type FieldDefinition = {
    name: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date';
    options?: { label: string; value: string }[];
  };
  
  // دالة واحدة لتوليد الـ fields
  export function generateFieldsFromEndpoint(
    alias: string,
    labels?: Record<string, string>
  ): FieldDefinition[] {
    const endpoint = endpoints.find((e) => e.alias === alias);
    if (!endpoint || !Array.isArray(endpoint.parameters)) return [];
  
    return endpoint.parameters.map((param: any) => {
      const schemaDef: any = param.schema._def;
      const isEnum = schemaDef.typeName === 'ZodEnum';
  
      return {
        name: param.name,
        label: labels?.[param.name] || formatLabel(param.name),
        type: isEnum ? 'select' : 'text',
        options: isEnum
          ? schemaDef.values.map((v: string) => ({ label: v, value: v }))
          : undefined,
      };
    });
  }
  
