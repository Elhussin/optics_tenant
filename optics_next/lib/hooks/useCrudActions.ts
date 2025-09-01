
'use client';

import { useFormRequest } from './useFormRequest';


export function useFetchData(alias: string, onSuccess?: (res: any) => void, onError?: (err: any) => void) {
  const formRequest = useFormRequest({
    alias,
    onSuccess,
    onError: (err: any) => {
      onError?.(err);
    },
  });

  const submitForm = (data?: any) => formRequest.submitForm(data);

  return { submitForm, reset: formRequest.reset, data: formRequest.data };
}
