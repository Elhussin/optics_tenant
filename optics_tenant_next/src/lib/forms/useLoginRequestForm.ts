import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemas } from '@/src/api-zod/zodSchemas';

const schema = schemas.LoginRequest;

export function useLoginRequestForm(defaultValues?: Partial<z.infer<typeof schema>>) {
  const methods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleServerErrors = (apiErrors: any) => {
    Object.entries(apiErrors).forEach(([field, messages]) => {
      methods.setError(field as any, {
        type: 'server',
        message: messages[0],
      });
    });
  };

  return {
    ...methods,
    handleServerErrors,
  };
}
