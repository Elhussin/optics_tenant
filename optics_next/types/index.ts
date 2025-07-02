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
