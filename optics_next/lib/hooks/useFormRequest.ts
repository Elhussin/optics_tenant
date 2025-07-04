// lib/hooks/useFormRequest.ts
import { useState } from "react";
import { z, ZodType } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api/axios";
import { handleErrorStatus } from "@/utils/error";
import type { Zodios } from "@zodios/core";
import type { ZodiosApi } from "@zodios/core";

interface UseFormRequestOptions<TSchema extends ZodType<any, any, any>> {
  defaultValues?: Partial<z.infer<TSchema>>;
  alias: string;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  transform?: (data: any) => any;
}

export function useFormRequest<TSchema extends ZodType<any, any, any>>(
  schema: TSchema,
  options: UseFormRequestOptions<TSchema>
) {
  const {
    defaultValues,
    alias,
    onSuccess,
    onError,
    transform,
  } = options;

  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  const submitForm = async (data: z.infer<TSchema>) => {
    setIsLoading(true);
    try {

      const payload = transform ? transform(data) : data;
      console.log("alias useFormRequest", alias);
      console.log("data useFormRequest", data);
      const response = await api.request(alias, { body: payload });
      
      console.log("response useFormRequest", response);

      onSuccess?.(response);
      return { success: true, data: response };
    } catch (error: any) {
      methods.setError("root", {
        message: handleErrorStatus(error),
      });
      onError?.(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...methods,
    submitForm,
    isLoading,
  };
}
