"use client"
import { useState,useMemo, useRef, useCallback } from "react";
import { ZodType, ZodObject } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api/axios";
import { useFormRequestProps } from "@/types";
import { UseFormRequestReturn } from "@/types";
import { handleServerErrors ,handleErrorStatus} from "@/lib/utils/error";
import { safeToast } from "@/lib/utils/toastService";
function hasParameters(
  endpoint: any
): endpoint is { parameters: { body?: ZodType<any>; query?: ZodType<any> } } {
  return 'parameters' in endpoint;
}





export function useFormRequest(options: useFormRequestProps): UseFormRequestReturn {
  const { alias, defaultValues, onSuccess, onError, transform,showToast = true } = options;
  console.log("defaultValues",defaultValues);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const lastPayloadRef = useRef<any>(null);

    const endpoint = useMemo(() => {
    const found = api.api.find((e) => e.alias === alias);
    if (!found) {
      return null;
    }
    return found;
  }, [alias]);



  const schema: ZodType<any> | undefined =endpoint && hasParameters(endpoint)
  ? endpoint.parameters?.body ?? endpoint.parameters?.query
  : undefined;

  const resolver =
    schema instanceof ZodObject
      ? zodResolver(schema)
      : (values: any) => ({ values, errors: {} });

  const methods = useForm<any>({
    resolver,
    defaultValues,
    mode: "onChange",
  });

  const submitForm = useCallback(async (data: any  ) => {

    if (!endpoint) {
      return { success: false, error: `Endpoint "${alias}" not found.` };
    }
    if (isLoading) return { success: false, error: "Already submitting" };

    setIsLoading(true);
    try {
      const values = data ?? methods.getValues();

      const isValid = await methods.trigger(); 

      if (!isValid) {
        setIsLoading(false);
        const fieldErrors = Object.values(methods.formState.errors).map((err: any) => err?.message );
        return { success: false, error: fieldErrors.join(", ") || "Validation failed",};
      }
  
      const payload = transform ? transform(values) : values;
      lastPayloadRef.current = payload;

      const response = await api.customRequest(endpoint.alias, payload);


      onSuccess?.(response);
      return { success: true, data: response };

    } catch (error: any) {
      handleServerErrors(error, methods.setError, { showToast });
      const normalized = handleErrorStatus(error);
      onError?.(normalized);
      return { success: false, error: normalized };
    } finally {
      setIsLoading(false);
    }
  
  }, [endpoint, alias, transform, onSuccess, onError, methods, isLoading]);


  const retry = useCallback(() => {
    if (!lastPayloadRef.current) return { success: false, error: "No previous payload to retry" };
    return submitForm(lastPayloadRef.current);
  }, [submitForm]);

  const isSubmitting = methods.formState.isSubmitting || isLoading;
  
  return useMemo(() => ({
    ...methods,
    submitForm,
    retry,
    errors: methods.formState.errors,
    formErrors: { ...methods.formState.errors, root: methods.formState.errors.root?.message },
    reset: methods.reset,
    isSubmitting
  }), [methods, submitForm, retry, isSubmitting]);
}

