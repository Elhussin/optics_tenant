export type ApiError = {
    [field: string]: string | string[];
  };

  export type ApiSuccess = {
    [field: string]: string | string[];
  };
  
export interface FormApiOptions<TInput = any> {
  endpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'GET' | 'DELETE';
  transform?: (data: TInput) => any;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}



export interface CreateUserType  {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  className?: string;
  submitText?: string;
  showCancelButton?: boolean;
  defaultValues?: any;
  mode?: 'create' | 'edit' | 'view' | 'delete';
  id?: string | number;
  endpoint?: string;
}


// UserContextType
export interface UserContextType {
  user: any | null;
  setUser: (user: any) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void; 
}