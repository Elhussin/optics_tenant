"use client"
import { useState,useMemo, useRef } from "react";
import { ZodType, ZodObject } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api/axios";
import { useFormRequestProps } from "@/types";
import { UseFormRequestReturn } from "@/types";
import { handleServerErrors } from "@/lib/utils/error";
// import { formatError } from "@/lib/utils";

function hasParameters(
  endpoint: any
): endpoint is { parameters: { body?: ZodType<any>; query?: ZodType<any> } } {
  return 'parameters' in endpoint;
}





export function useFormRequest(options: useFormRequestProps): UseFormRequestReturn {
  const { alias, defaultValues, onSuccess, onError, transform } = options;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const lastPayloadRef = useRef<any>(null);

    const endpoint = useMemo(() => {
    const found = api.api.find((e) => e.alias === alias);
    if (!found) {
      console.error(`❌ Endpoint with alias "${alias}" not found.`);
      return null;
    }
    return found;
  }, [alias]);



  const schema: ZodType<any> | undefined =endpoint && hasParameters(endpoint)
  ? endpoint.parameters?.body ?? endpoint.parameters?.query
  : undefined;

  if (!schema) {
    console.warn(`⚠️ No schema defined for endpoint "${alias}". Validation skipped.`);
  }

  // if schema  
  const resolver =
    schema instanceof ZodObject
      ? zodResolver(schema)
      : (values: any) => ({ values, errors: {} });

  const methods = useForm<any>({
    resolver,
    defaultValues,
    mode: "onChange",
  });

  const submitForm = async (data: any = undefined) => {
    if (!endpoint) {
      return { success: false, error: `Endpoint "${alias}" not found.` };
    }

    setIsLoading(true);
    try {
      const values = data ?? methods.getValues();

      const isValid = await methods.trigger(); 

      if (!isValid) {
        setIsLoading(false);

        // ترجع كل الأخطاء بشكل واضح
        const fieldErrors = Object.values(methods.formState.errors).map(
          (err: any) => err?.message
        );
        return {
          success: false,
          error: fieldErrors.join(", ") || "Validation failed",
        };
      }
      // if transform  applay
      const payload = transform ? transform(values) : values;
      // save current payload
      lastPayloadRef.current = payload;


      const response = await api.customRequest(endpoint.alias, payload);



      if (response && onSuccess) {
        onSuccess(response);
      }
      return { success: true, data: response };


    } catch (error: any) {
      handleServerErrors(error, methods.setError);
      if (onError) {
        onError(error);
      }

      console.error("❌ API Request Error:", error);
      return { success: false, error: formatError(error) };
    } finally {
      setIsLoading(false);
    }
  };

  // const retry = () => submitForm(methods.getValues());
  // console.log("retry", retry);
  const retry = () =>
    lastPayloadRef.current && submitForm(lastPayloadRef.current);

  const isSubmitting = methods.formState.isSubmitting || isLoading;
  
  return {
    ...methods,
    submitForm,
    retry,
    errors: methods.formState.errors,
    formErrors: {
      ...methods.formState.errors,
      root: methods.formState.errors.root?.message,
    },
    reset: methods.reset,
    isSubmitting
  };
}
