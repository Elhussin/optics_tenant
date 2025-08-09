import { error } from "console";

export interface FieldTemplate {
  component: string;
  type?: string;
  props?: Record<string, any>;
  wrapper?: string;
}

export interface GeneratorConfig {
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


export interface DynamicFormProps<T> {
  schemaName: string;
  onSuccess?: () => void;
  className?: string;
  submitText?: string;
  showCancelButton?: boolean;
  showResetButton?: boolean;
  showBackButton?: boolean;
  mode?: 'create' | 'edit';
  config?: Partial<GeneratorConfig>;
  alias?: string;
  id?: string;
  title?: string;
  successMessage?: string;
  errorMessage?: string;
  
}

export interface ForeignKeyConfig {
  endpoint: string;
  labelField: string;
  valueField: string;
  searchField?: string;
  createPage?: string;
}

export interface RelationshipConfig {
  [fieldName: string]: ForeignKeyConfig;
}
