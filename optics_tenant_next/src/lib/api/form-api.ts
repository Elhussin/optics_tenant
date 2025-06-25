// src/lib/api/form-api.ts
import api from '@/src/lib/api';

export interface FormApiOptions {
  endpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  transform?: (data: any) => any;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export class FormApiService {
  static async submit(data: any, options: FormApiOptions) {
    const {
      endpoint,
      method = 'POST',
      transform,
      onSuccess,
      onError
    } = options;

    try {
      const transformedData = transform ? transform(data) : data;
      
      const response = await api[method.toLowerCase() as 'post' | 'put' | 'patch'](
        `/api/${endpoint}/`,
        transformedData
      );
      
      onSuccess?.(response);
      return response;
    } catch (error: any) {
      onError?.(error);
      throw error;
    }
  }

  static async update(id: string | number, data: any, options: FormApiOptions) {
    return this.submit(data, {
      ...options,
      endpoint: `${options.endpoint}/${id}`,
      method: 'PUT'
    });
  }

  static async partialUpdate(id: string | number, data: any, options: FormApiOptions) {
    return this.submit(data, {
      ...options,
      endpoint: `${options.endpoint}/${id}`,
      method: 'PATCH'
    });
  }
}
