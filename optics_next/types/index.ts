export type ApiError = {
    [field: string]: string | string[];
  };

  export type ApiSuccess = {
    [field: string]: string | string[];
  };
  

export interface FormApiOptions<T = any> {
  alias: string;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  transform?: (data: any) => any;
}


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}

//  ues in crud
export interface CrudFormOptions {
  alias: string;
  defaultValues?: any;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  className?: string;
  submitText?: string;
}

//  ues in login and create and edit
export interface formRequestProps extends CrudFormOptions  {
  onCancel?: () => void;
  showCancelButton?: boolean;
  mode?: 'create' | 'edit'|'login';
  id?: string | number;
  submitForm?: (data?: any) => Promise<{ success: boolean; error?: any }>;
}


// ===== أنواع البيانات والواجهات =====
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


// ues in generated form
export interface GeneratedFormProps extends formRequestProps {
  schemaName: string;
  customConfig?: GeneratorConfig;
}

export type UserContextType = {
  user: any | null;
  setUser: (user: any | null) => void;
  fetchUser: formRequestProps;
  loading: boolean;
  refreshUser: formRequestProps;  // ✅ هذا مهم جداً
  logout: () => Promise<void>;
};

interface FieldMeta {
  key: string;
  label: string;
  zodType: any;
}
// ues in view card
export interface ViewCardProps {
  alias: string;
  fieldsAlias?: string;
  restoreAlias: string;
  hardDeleteAlias: string;
  path: string;
  viewFields?: string[]; 
  title?: string;
  fields?: FieldMeta[];
  item?: any;
}





export interface ButtonProps {
  label: string;
  onClick: () => void ;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
};


