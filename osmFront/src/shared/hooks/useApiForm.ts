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
    skipCache = false,
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

  // 🎯 لو endpoint = GET → نستخدم useQuery
  const queryKey = useMemo(() => [alias, JSON.stringify(defaultValues || {})], [alias, defaultValues]);
  // const query = useQuery({
  //   queryKey,
  //   queryFn: () => api.customRequest(alias as string, defaultValues),
  //   enabled: !!alias && endpoint?.method === "get" &&
  //         !Object.values(defaultValues || {}).includes(undefined),
  // });
  const query = useQuery({
    queryKey,
    queryFn: () => api.customRequest(alias as string, defaultValues),
    // enabled: !!alias && endpoint?.method === "get" && !Object.values(defaultValues || {}).includes(undefined),
    enabled: Boolean(alias && endpoint?.method === "get"),
    // force refresh عند الحاجة
    staleTime: skipCache ? 0 : 5 * 60 * 1000,
  });

  const prefetch = async (newValues: any) => {
    const prefetchKey = [alias, JSON.stringify(newValues || {})];
    if (!queryClient.getQueryData(prefetchKey)) {
      await queryClient.prefetchQuery({
        queryKey: prefetchKey,
        queryFn: () => api.customRequest(alias as string, newValues),
      });
    }
  };

  const fetchDirect = async () => {
    await queryClient.invalidateQueries({ queryKey });
    return api.customRequest(alias as string, defaultValues);
  };

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
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

  const resetForm = () => {
    methods.reset(defaultValues);
    queryClient.invalidateQueries({ queryKey });
  };


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
    let payload = transform ? transform(values) : values;

    try {

      if (!transform && Object.values(values).some(v => v instanceof File)) {
        const fd = new FormData();
        Object.entries(values).forEach(([k, v]) => {
          if (v instanceof File) fd.append(k, v);
          else fd.append(k, JSON.stringify(v));
        });
        payload = fd;
      }

      const response = await mutation.mutateAsync(payload);
      onSuccess?.(response);
      return { success: true, data: response };
    } catch (error: any) {
      console.log(error);
      handleServerErrors(error, methods.setError, { showToast });
      const normalized = handleErrorStatus(error);
      onError?.(normalized);
      return { success: false, error: normalized };
    }
  };


  const isBusy = query.isLoading || query.isFetching || methods.formState.isSubmitting || mutation.isPending;
  return {
    ...methods,
    query,
    mutation,
    submitForm,
    resetForm,
    fetchDirect,
    prefetch,
    isBusy: isBusy,
    errors: { ...methods.formState.errors, root: methods.formState.errors.root?.message },
  };

}
