import { useState } from 'react';
import { z, ZodType } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormApiService } from '@/lib/api/form-api';
import { FormApiOptions, ApiResponse } from '@/types';
import { DefaultValues } from 'react-hook-form';

interface UseFormRequestOptions<TSchema extends ZodType<any, any, any>> {
  defaultValues?: Partial<z.infer<TSchema>>;
  apiOptions?: Partial<FormApiOptions<z.infer<TSchema>>>;
  mode?: 'create' | 'update' | 'patch' | 'get' | 'delete';
  id?: string | number;
}

export function useFormRequest<TSchema extends ZodType<any, any, any>>(
  schema: TSchema,
  options: UseFormRequestOptions<TSchema> = {}
) {
  const { defaultValues, apiOptions, mode = 'create', id } = options;

  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<z.infer<TSchema>> | undefined,
    mode: 'onChange',
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

  const submitForm = async (
    data: z.infer<TSchema>
  ): Promise<ApiResponse<any>> => {
    const defaultApiOptions: FormApiOptions<z.infer<TSchema>> = {
      endpoint: '',
      onError: (error) => {
        if (error.response?.status === 400) {
          handleServerErrors(error.response.data);
        }
      },
      ...apiOptions,
    };

    setIsLoading(true);

    try {
      let response: ApiResponse<any>;

      switch (mode) {
        case 'update':
          if (!id) throw new Error('ID is required for update');
          response = await FormApiService.update(id, data, defaultApiOptions);
          break;

        case 'patch':
          if (!id) throw new Error('ID is required for patch');
          response = await FormApiService.partialUpdate(id, data, defaultApiOptions);
          break;

        case 'delete':
          if (!id) throw new Error('ID is required for delete');
          response = await FormApiService.delete(id, defaultApiOptions);
          break;

        case 'get':
          response = await FormApiService.get(id, defaultApiOptions);
          break;

        case 'create':
        default:
          response = await FormApiService.submit(data, defaultApiOptions);
          break;
      }

      if (response.success) {
        // reset form if success and not GET/DELETE
        if (!['get', 'delete'].includes(mode)) {
          methods.reset();
        }
      }

      return response;
    } catch (error: any) {
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...methods,
    handleServerErrors,
    submitForm,
    schema,
    isLoading,
  };
}
