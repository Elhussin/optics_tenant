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
}


// UserContextType
export interface UserContextType {
  user: any | null;
  setUser: (user: any) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void; 
} 




export interface FormProps {
  onSuccess?: (res: any) => void;
  submitText?: string;
  className?: string;
  onCancel?: () => void;
  showCancelButton?: boolean;
  alias?: string;
  mode?: 'create' | 'edit';
}


export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
};