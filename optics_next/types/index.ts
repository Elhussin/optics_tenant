import { AnyActionArg } from "react";

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
  onSuccess?: () => void;
  onError?: (err: any) => void;
  className?: string;
  submitText?: string;
}

//  ues in login and create and edit
export interface formRequestProps extends CrudFormOptions  {
  onCancel?: () => void;
  showCancelButton?: boolean;
  mode?: 'create' | 'edit'|'login';
  id?: string | number | undefined;
  submitForm?: (data?: any) => Promise<{ success: boolean; error?: any }>;
  istenant?: boolean;
  title?: string;
  message?: string;
  
}




export interface useFormRequestProps {
  alias: string;
  defaultValues?: any;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  transform?: (data: any) => any;
  showToast?: boolean;
}


export type UseFormRequestReturn = {
  isSubmitting: boolean;
  errors: any;
  formErrors: any;
  submitForm: any;
  retry: () => Promise<any>;
  reset: (defaultValues?: any) => void;
  [key: string]: any; // للسماح بخصائص إضافية مثل methods الأخرى
};



export type UserContextType = {
  user: any | null;
  setUser: (user: any | null) => void;
  // fetchUser:UseFormRequestReturn;
  refetchUser: () => Promise<{ success: boolean; error?: any }>;
  loading: boolean;
  logout: () => Promise<void>;
};

export interface Permission {
  id: number;
  code: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  role: Role;
  is_deleted: boolean;
  deleted_at: string | null;
  phone: string;
  client: number;
}




interface FieldMeta {
  key: string;
  label: string;
  zodType: any;
}
// ues in view card
export interface ViewCardProps {

  entity: string;
  id?: string | number | undefined;
}



export interface BaseButtonProps {
  // onClick?: (e?: React.MouseEvent) => void ;
    onClick?: (e?: React.SyntheticEvent) => void | Promise<void>;

  label?: string;

};

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'outline' | 'link' | 'reset' | 'cancel' | 'close'| 'warning';


export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
  disabled?: boolean;
  onCrud?: (e?: React.SyntheticEvent) => void | Promise<void>; // يقبل أي event
  navigateTo?: string;
  onClick?: (e?: React.SyntheticEvent) => void | Promise<void>; // يقبل أي event
}
// use in payment page
export interface PayPalButtonProps {
  clientId?: string;
  planId?: string;
  planDirection?: string;
  label?: string;
  method?: string;
  amount?: string;
  planName?: string;
};
