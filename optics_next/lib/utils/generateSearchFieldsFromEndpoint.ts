
// ✅ utils/generateSearchFieldsFromEndpoint.ts
import { endpoints } from '@/lib/api/zodClient';
import { SearchField } from '@/types/search';

export function generateSearchFieldsFromEndpoint(alias: string): SearchField[] {
  const endpoint = endpoints.find((e) => e.alias === alias);
  if (!endpoint) return [];

  return endpoint.parameters?.map((param) => {
    const schemaDef: any = param.schema._def;
    const isEnum = schemaDef.typeName === 'ZodEnum';

    return {
      name: param.name,
      label: param.name,
      type: isEnum ? 'select' : 'text',
      options: isEnum
        ? schemaDef.values.map((v: string) => ({ label: v, value: v }))
        : undefined,
    };
  }) ?? [];
}

