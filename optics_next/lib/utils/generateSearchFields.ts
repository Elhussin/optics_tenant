
import { endpoints } from '@/lib/api/zodClient';
import { SearchField } from '@/types/search';
import { formatLabel} from './cardViewHelper'

export function generateSearchFieldsFromEndpoint(alias: string): SearchField[] {
  const endpoint = endpoints.find((e) => e.alias === alias);
  console.log("endpoint",endpoint);
  if (!endpoint || !('parameters' in endpoint) || !Array.isArray(endpoint.parameters)) {
    return [];
  }
  console.log("endpoint.parameters",endpoint.parameters);
   
    
  return endpoint.parameters?.map((param: any) => {
    const schemaDef: any = param.schema._def;
    const isEnum = schemaDef.typeName === 'ZodEnum';
    
    return {
      name: param.name,
      label: formatLabel(param.name),
      type: isEnum ? 'select' : 'text',
      options: isEnum 
        ? schemaDef.values.map((v: string) => ({ label: v, value: v }))
        : undefined,
    };
  }) ?? [];
}


