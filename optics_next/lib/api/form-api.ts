// lib/api/form-api.ts
import { api } from '@/lib/zod-client/zodios-client';
import { FormApiOptions, ApiResponse } from '@/types';


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
      const apiMethod = method.toLowerCase() as 'post' | 'put' | 'patch';

      const response = await (api[apiMethod] as any)(
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

  static async get(idOrParams: string | number | undefined, options: Omit<FormApiOptions, 'method' | 'transform'>) {
    try {
      const endpoint = idOrParams ? `${options.endpoint}/${idOrParams}` : options.endpoint;
      const response = await api.get(`/api/${endpoint}/` as any, { params: {} });

      options.onSuccess?.(response);
      return response;
    } catch (error: any) {
      options.onError?.(error);
      throw error;
    }
  }


  static async delete(id: string | number, options: Omit<FormApiOptions, 'method' | 'transform'>) {
    try {
      const response = await api.delete(`/api/${options.endpoint}/${id}/` as any, options as any,options as any);
      options.onSuccess?.(response);
      return response;
    } catch (error: any) {
      options.onError?.(error);
      throw error;
    }
  }
}
