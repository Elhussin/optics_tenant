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



export interface formRequestProps  {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  className?: string;
  submitText?: string;
  showCancelButton?: boolean;
  defaultValues?: any;
  mode?: 'create' 
  id?: string | number;
  alias?: string;
  submitForm?: (data?: any) => Promise<{ success: boolean; error?: any }>;
}

// export type FormRequest<T = any> = {
//   submitForm: (data?: any) => Promise<{ success: boolean; error?: any }>;
//   handleSubmit: any;
//   register: any;
//   errors: any;
//   isSubmitting: boolean;
// };
  

export type UserContextType = {
  user: any | null;
  setUser: (user: any | null) => void;
  loading: boolean;
  refreshUser: formRequestProps;  // ✅ هذا مهم جداً
  logout: () => Promise<void>;
};



export interface FormProps {
  onSuccess?: (res: any) => void;
  submitText?: string;
  className?: string;
  onCancel?: () => void;
  showCancelButton?: boolean;
  alias?: string;
  mode?: 'create' | 'edit';
  defaultValues?: any;
}


export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
};