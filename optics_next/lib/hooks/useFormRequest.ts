"use client"
import { useState,useMemo} from "react";
import { ZodType, ZodObject } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api/axios";
import { useFormRequestProps } from "@/types";
import { UseFormRequestReturn } from "@/types";

import { handleServerErrors } from "@/lib/utils/error";
function hasParameters(
  endpoint: any
): endpoint is { parameters: { body?: ZodType<any>; query?: ZodType<any> } } {
  return 'parameters' in endpoint;
}





export function useFormRequest(options: useFormRequestProps): UseFormRequestReturn {

  const { alias, defaultValues, onSuccess, onError, transform } = options;

  const [isLoading, setIsLoading] = useState<boolean>(false);

    const endpoint = useMemo(() => {
    const found = api.api.find((e) => e.alias === alias);
    if (!found) {

      throw new Error(`Endpoint with alias "${alias}" not found.`);
    }
    return found;
  }, [alias]);



  const schema: ZodType<any> | undefined = hasParameters(endpoint)
  ? endpoint.parameters?.body ?? endpoint.parameters?.query
  : undefined;


  const methods = useForm<any>({
    resolver: schema instanceof ZodObject ? zodResolver(schema) : undefined,
    defaultValues,
    mode: "onChange",
  });

  const submitForm = async (data: any = undefined) => {
    setIsLoading(true);
    try {
      const values = data ?? methods.getValues();

      const isValid = await methods.trigger(); // ✅ تحقق من صحة البيانات قبل الإرسال
      if (!isValid) {
        setIsLoading(false);
        return { success: false, error: "Validation failed" };
      }

      const payload = transform ? transform(values) : values;

      const endpoint = api.api.find((e) => e.alias === alias);
      if (!endpoint) {
        throw new Error(`Endpoint with alias "${alias}" not found.`);
      }

      const response = await api.customRequest(alias, payload);


      if (response && onSuccess) {
        onSuccess(response);
      }
      return { success: true, data: response };


    } catch (error: any) {
      handleServerErrors(error, methods.setError);
      if (onError) {
        onError(error);
      }

      console.log(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => submitForm(methods.getValues());
  // console.log("retry", retry);

  return {
    ...methods,
    submitForm,
    retry,
    errors: methods.formState.errors,
    formErrors: {
      ...methods.formState.errors,
      root: methods.formState.errors.root?.message,
    },
    isSubmitting: methods.formState.isSubmitting,
    isLoading,
    reset: methods.reset,
  };
}
