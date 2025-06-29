// src/lib/hooks/useUserRequest.ts
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemas } from '@/src/lib/zod-api';
import { FormApiService, FormApiOptions } from '@/src/lib/api/form-api';
import { ApiError } from '@/src/types';

const schema = schemas.UserRequest;

export interface UseUserRequestFormOptions {
  defaultValues?: Partial<z.infer<typeof schema>>;
  apiOptions?: Partial<FormApiOptions>;
  mode?: 'create' | 'update';
  id?: string | number;
}

export function useUserRequestForm(options: UseUserRequestFormOptions = {}) {
  const { defaultValues, apiOptions, mode = 'create', id } = options;
  
  const methods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  });

  const handleServerErrors = (apiErrors: ApiError) => {
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
      endpoint: 'users/register',
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
