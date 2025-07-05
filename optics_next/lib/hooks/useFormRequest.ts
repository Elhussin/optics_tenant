
// lib/hooks/useFormRequest.ts
import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api/axios";
import { handleErrorStatus } from "@/utils/error";

type Maybe<T> = T | undefined;

interface UseFormRequestOptions<TSchema extends ZodType<any, any, any>> {
  defaultValues?: Partial<z.infer<TSchema>>;
  alias: string;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  transform?: (data: any) => any;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any; // For GET/refresh/simple POST
}

export function useFormRequest<TSchema extends ZodType<any, any, any> = any>(
  schema?: TSchema,
  options?: UseFormRequestOptions<TSchema>
) {
  const {
    defaultValues,
    alias,
    onSuccess,
    onError,
    transform,
    method = "POST",
    body,
  } = options || {};

  const [isLoading, setIsLoading] = useState(false);

  const methods: Maybe<UseFormReturn<z.infer<TSchema>>> = schema
    ? useForm<z.infer<TSchema>>({
        resolver: zodResolver(schema),
        defaultValues,
        mode: "onChange",
      })
    : undefined;

  const submitForm = async (data?: z.infer<TSchema>) => {
    setIsLoading(true);
    try {
      const payload = transform
        ? transform(data ?? {})
        : data ?? body ?? {};

      const requestFn = api[alias as keyof typeof api] as unknown as (
        args?: any
      ) => Promise<any>;

      if (!requestFn) {
        throw new Error(`API function for alias "${alias}" not found.`);
      }

      console.log(payload, alias);
      const response = await requestFn(payload);

      onSuccess?.(response);
      return { success: true, data: response };
    } catch (error: any) {
      methods?.setError?.("root", {
        message: handleErrorStatus(error),
      });
      onError?.(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...(methods || {}),
    submitForm,
    isLoading,
  };
}
