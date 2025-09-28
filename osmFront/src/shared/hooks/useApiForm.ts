"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/shared/api/axios";
import { ZodType, ZodObject } from "zod";

interface UseApiFormProps<T> {
  alias: string;                       // endpoint key
  defaultValues?: T;
  transform?: (data: any) => any;      // تحويل البيانات قبل الإرسال
  showToast?: boolean;
}

// export function useApiForm<T extends Record<string, any>>(options: UseApiFormProps<T>) {
//   const { alias, defaultValues, transform, showToast = true } = options;
//   const queryClient = useQueryClient();
//   const lastPayloadRef = useRef<any>(null);

//   // العثور على endpoint
//   const endpoint = useMemo(() => api.api.find(e => e.alias === alias) || null, [alias]);

//   // تحديد الـ schema من endpoint
//   const schema: ZodType<any> | undefined = endpoint?.parameters?.body ?? endpoint?.parameters?.query;

//   // Resolver
//   const resolver = schema instanceof ZodObject ? zodResolver(schema) : undefined;

//   // React Hook Form
//   const formMethods = useForm<T>({
//     resolver,
//     defaultValues,
//     mode: "onChange",
//   });

//   // 🔹 Query لجلب البيانات
//   const query = useQuery({
//     queryKey: [alias],
//     queryFn: async () => {
//       if (!endpoint) throw new Error(`Endpoint "${alias}" not found`);
//       const res = await api.customRequest(endpoint.alias, { method: "GET" });
//       return res;
//     },
//     staleTime: 1000 * 60 * 5,
//     enabled: !!endpoint,
//   });

//   // 🔹 Mutation لإرسال البيانات
//   const mutation = useMutation({
//     mutationFn: async (data: any) => {
//       if (!endpoint) throw new Error(`Endpoint "${alias}" not found`);
//       const payload = transform ? transform(data) : data;
//       lastPayloadRef.current = payload;
//       return await api.customRequest(endpoint.alias, payload);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries([alias]);
//     },
//   });

//   const submitForm = useCallback(async (data?: any) => {
//     const values = data ?? formMethods.getValues();
//     const isValid = await formMethods.trigger();
//       console.log("isValid",isValid);
//       console.log("values",formMethods);
//     if (!isValid) return { success: false, error: "Validation failed" };
//     return mutation.mutateAsync(values);
//   }, [formMethods, mutation]);

//   const retry = useCallback(() => {
//     if (!lastPayloadRef.current) return { success: false, error: "No previous payload" };
//     return submitForm(lastPayloadRef.current);
//   }, [submitForm]);

//   return {
//       ...formMethods,
//       submitForm,
//       retry,
//       isSubmitting: formMethods.formState.isSubmitting || mutation.isLoading,
//       formErrors: formMethods.formState.errors,
//       query, // الوصول للبيانات، isLoading, isError
//       mutation, // الوصول لحالة الـ mutation
//   } 
// }


// // as unknown as UseFormReturn<T> & { query: typeof query; mutation: typeof mutation; submitForm: any; retry: any };

interface useFormRequestProps {
  alias: string;
  defaultValues?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  transform?: (data: any) => any;
}

export function useApiForm(options: useFormRequestProps) {
  const { alias, defaultValues, onSuccess, onError, transform } = options;
  const queryClient = useQueryClient();

  // mutation باستخدام React Query
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.customRequest(alias, payload);
    },
    onSuccess: (data) => {
      // queryClient.invalidateQueries([alias]); // تحديث الكاش بعد العملية
      onSuccess?.(data);
    },
    onError,
  });

  const methods = useForm({
    defaultValues,
    mode: "onChange",
  });

  const submitForm = async (data: any) => {
    const values = transform ? transform(data) : data;
    mutation.mutate(values); // ← استخدام React Query mutation
  };

  return {
    ...methods,
    submitForm,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
