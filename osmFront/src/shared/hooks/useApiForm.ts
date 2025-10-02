"use client";
import { useMemo } from "react";
import { ZodType, ZodObject } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/src/shared/api/axios";
import { useFormRequestProps, UseApiFormReturn } from "@/src/shared/types";
import { handleServerErrors, handleErrorStatus } from "@/src/shared/utils/error";

function hasParameters(
  endpoint: any
): endpoint is { parameters: { body?: ZodType<any>; query?: ZodType<any> } } {
  return "parameters" in endpoint;
}

export function useApiForm(options: useFormRequestProps): UseApiFormReturn {
  const {
    alias,
    defaultValues,
    onSuccess,
    onError,
    transform,
    showToast = true,
  } = options;

  const queryClient = useQueryClient();

  // 🎯 جلب الـ endpoint من الـ API client
  const endpoint = useMemo(() => {
    const found = api.api.find((e) => e.alias === alias);
    if (!found) return null;
    return found;
  }, [alias]);

  // 🎯 استخراج Schema الخاص بالـ endpoint
  const schema: ZodType<any> | undefined =
         endpoint && hasParameters(endpoint)
      ? endpoint.parameters?.body ?? endpoint.parameters?.query
      : undefined;

  const resolver =
    schema instanceof ZodObject
      ? zodResolver(schema)
      : (values: any) => ({ values, errors: {} });

  // 🎯 إعداد react-hook-form
  const methods = useForm<any>({
    resolver,
    defaultValues,
    mode: "onChange",
  });
//   if (!endpoint) {
//     return { success: false, error: `Endpoint "${alias}" not found.` };
//   }

  // 🎯 لو endpoint = GET → نستخدم useQuery
  const query = useQuery({
    queryKey: [alias, defaultValues],
    queryFn: () => api.customRequest(alias as string, defaultValues),
    enabled: !!alias && endpoint?.method === "get",
  });

  // 🎯 Mutation لعمليات POST / PUT / DELETE
  const mutation = useMutation({
    mutationFn: async (payload: any) =>{
        if (!endpoint?.alias) {
          throw new Error(`Endpoint alias is undefined for alias "${alias}"`);
        }
        return api.customRequest(endpoint.alias, payload);
      },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [alias as string] });     
       onSuccess?.(data);
    },
    onError: (error: any) => {
      // توزيع الأخطاء على الفورم
      handleServerErrors(error, methods.setError, { showToast });
      const normalized = handleErrorStatus(error);
      onError?.(normalized);
    },
  });

  const submitForm = async (data?: any) => {
    // ✅ تحقق من الـ validation
    const isValid = await methods.trigger();
    if (!isValid) {
      const fieldErrors = Object.values(methods.formState.errors).map(
        (err: any) => err?.message
      );
      return {
        success: false,
        error: fieldErrors.join(", ") || "Validation failed",
      };
    }
  
    const values = data ?? methods.getValues();
    const payload = transform ? transform(values) : values;
  
    try {
      // ✅ هنا هتاخد Response وترجعه
      const response = await mutation.mutateAsync(payload);
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error };
    }
  };
  

    return useMemo(() => ({

      ...methods, // فورم
      query, // للـ GET
      mutation, // للـ POST/PUT/DELETE
      submitForm, // دالة submit موحدة
      isSubmitting: methods.formState.isSubmitting || mutation.isPending,
      errors: methods.formState.errors,
      formErrors: { ...methods.formState.errors, root: methods.formState.errors.root?.message },
    }), [methods, submitForm]);
  }
