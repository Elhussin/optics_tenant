// src/lib/forms/useLoginRequestForm.ts
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemas } from '@/src/api-zod/gin-api';
import { FormApiService, FormApiOptions } from '@/src/lib/api/form-api';

const schema = schemas.LoginRequest;

export interface UseLoginRequestFormOptions {
  defaultValues?: Partial<z.infer<typeof schema>>;
  apiOptions?: Partial<FormApiOptions>;
  mode?: 'create' | 'update';
  id?: string | number;
}

export function useLoginRequestForm(options: UseLoginRequestFormOptions = {}) {
  const { defaultValues, apiOptions, mode = 'create', id } = options;
  
  const methods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  });

  const handleServerErrors = (apiErrors: any) => {
    if (typeof apiErrors === 'object' && apiErrors !== null) {
      Object.entries(apiErrors).forEach(([field, messages]) => {
        const messageArray = Array.isArray(messages) ? messages : [messages];
        methods.setError(field as any, {
          type: 'server',
          message: messageArray[0] as string,
        });
      });
    }
  };

  const submitForm = async (data: z.infer<typeof schema>) => {
    const defaultApiOptions: FormApiOptions = {
      endpoint: 'users/login',
      onError: (error) => {
        if (error.response?.status === 400) {
          handleServerErrors(error.response.data);
        }
      },
      ...apiOptions
    };

    try {
      if (mode === 'update' && id) {
        return await FormApiService.update(id, data, defaultApiOptions);
      } else {
        return await FormApiService.submit(data, defaultApiOptions);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    ...methods,
    handleServerErrors,
    submitForm,
    schema
  };
}
