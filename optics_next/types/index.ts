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
}


export type UseFormRequestReturn = {
  isLoading: boolean;
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
  fetchUser:UseFormRequestReturn;
  loading: boolean;
  logout: () => Promise<void>;
};

interface FieldMeta {
  key: string;
  label: string;
  zodType: any;
}
// ues in view card
export interface ViewCardProps {

  entity?: string;
  id?: string | number | undefined;
}



export interface BaseButtonProps {
  onClick?: (e?: React.MouseEvent) => void ;
  label?: string;

};

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'outline' | 'link' | 'reset' | 'cancel' | 'close';

export interface ButtonProps extends BaseButtonProps  {
  label: string;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset" 
  title?: string;
  disabled?: boolean;
  onCrud?: () => void;
  navigateTo?: string;
};




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
