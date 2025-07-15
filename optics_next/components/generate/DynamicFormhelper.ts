
import { GeneratorConfig, FieldTemplate } from '@/types/DynamicFormTypes';

export const defaultConfig: GeneratorConfig = {
  baseClasses: "input-base",
  labelClasses: "label",
  errorClasses: "error-text",
  submitButtonClasses: "btn btn-primary",
  submitButtonText: "Save",
  includeResetButton: true,
  spacing: "mb-4",
  containerClasses: "space-y-4"
};


export const fieldTemplates: Record<string, FieldTemplate> = {
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