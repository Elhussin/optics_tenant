
import { z } from "zod";
import { unwrapSchema } from "@/lib/utils/generateForm";
import { formatLabel } from "@/lib/utils/cardView";
import { schemas } from "@/lib/api/zodClient";

// ===== configuration and settings =====
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

const defaultConfig: GeneratorConfig = {
  baseClasses: "input-base",
  labelClasses: "label",
  errorClasses: "error-text",
  submitButtonClasses: "btn btn-primary",
  submitButtonText: "Save",
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
  'range': { component: 'input', type: 'range' }
};


function detectFieldType(field: string, rawSchema: z.ZodTypeAny): string {
  const schema = unwrapSchema(rawSchema);


  // analyze field name
  const fieldLower = field.toLowerCase();
  if (fieldLower.includes('email')) return 'email';
  if (fieldLower.includes('password')) return 'password';
  if (fieldLower.includes('phone') || fieldLower.includes('tel')) return 'tel';
  if (fieldLower.includes('url') || fieldLower.includes('website')) return 'url';
  if (fieldLower.includes('color')) return 'color';
  if (fieldLower.includes('date')) return 'date';
  if (fieldLower.includes('time')) return 'time';
  if (fieldLower.includes('description') || fieldLower.includes('content') || fieldLower.includes('notes')) return 'textarea';
  
  // analyze schema type
  if (schema instanceof z.ZodBoolean) return 'checkbox';
  if (schema instanceof z.ZodEnum) return 'select';
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

const ignoredFields = ['id', 'created_at', 'updated_at', 'owner', 'tenant', 'is_superuser', 'group', 'is_deleted'];

const schemaName = "users";
const schema = (schemas as any)[schemaName] as z.ZodObject<any>;
const shape = schema.shape;
const visibleFields = Object.keys(shape).filter((f) => !ignoredFields.includes(f));


function getFieldCode(field: string, rawSchema: z.ZodTypeAny, form: any,) {
  const fieldType = detectFieldType(field, rawSchema);
  const template = fieldTemplates[fieldType] || fieldTemplates['text'] || { component: 'input', type: 'text' };
  const schema = unwrapSchema(rawSchema);
  const description = rawSchema.description || field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
  const isRequired = !(rawSchema instanceof z.ZodOptional);
  let inputElement = '';
  let wrapperStart = '';
  let wrapperEnd = '';

  
    if (schema instanceof z.ZodBoolean) {
      return (
        <div className="mb-4" key={field}>
          <label htmlFor={field} className="label">
            <input id={field} type="checkbox" {...form.register(field)} />
            <span>{description}</span>
          </label>
          {form.formState.errors[field] && (
            <p className="text-red-500 text-sm">{form.formState.errors[field]?.message as string}</p>
          )}
        </div>
      );
    } else if (schema instanceof z.ZodEnum) {
      return (
        <div className="mb-4" key={field}>
          <label htmlFor={field} className="label">{description}</label>
          <select id={field} {...form.register(field)} className={baseClasses}>
            {schema.options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {form.formState.errors[field] && (
            <p className="text-red-500 text-sm">{form.formState.errors[field]?.message as string}</p>
          )}
        </div>
      );
    } else {
      // Text or Number inputs
      let inputType = 'text';
      if (schema instanceof z.ZodNumber) inputType = 'number';
      else if (schema instanceof z.ZodString) {
        const checks = schema._def.checks || [];
        const hasEmail = checks.some((c: any) => c.kind === 'email');
        const hasMinLength = checks.some((c: any) => c.kind === 'min' && c.value >= 6);
        const date = checks.some((c: any) => c.kind === 'date');
        if (hasEmail) inputType = 'email';
        else if (date) inputType = 'date';
        else if (hasMinLength) inputType = 'password';

      }
  
      return (
        <div className="mb-4" key={field}>
          <label htmlFor={field} className="label">{description}</label>
          <input id={field} type={inputType} {...form.register(field)} className={baseClasses} />
          {form.formState.errors[field] && (
            <p className="error">{form.formState.errors[field]?.message as string}</p>
          )}
        </div>
      );
    }
  }


  export default getFieldCode;