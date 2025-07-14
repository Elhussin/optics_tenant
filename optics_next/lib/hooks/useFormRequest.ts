import { useState } from "react";
import { ZodType, ZodObject } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api/axios";
import { handleErrorStatus } from "@/lib/utils/error";

interface useFormRequestPropsType {
  alias: string;
  defaultValues?: any;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  transform?: (data: any) => any;
}

export function useFormRequest(
  options: useFormRequestPropsType
) {
  const {alias,  defaultValues, onSuccess,onError,transform, } = options;

  const [isLoading, setIsLoading] = useState(false);

  const endpoint = api.api.find((e) => e.alias === alias);
  const schema : ZodType<any> = endpoint?.parameters?.body ?? endpoint?.parameters?.query ?? undefined;
  
  const methods = useForm<any>({
    resolver:
      schema instanceof ZodObject
        ? zodResolver(schema)
        : undefined,
    defaultValues,
    mode: "onChange",
  });

  const submitForm = async (data: any = undefined) => {
    setIsLoading(true);
    try {
      const endpoint = api.api.find((e) => e.alias === alias);
      if (!endpoint) {
        throw new Error(`Endpoint with alias "${alias}" not found.`);
      }

      const payload = transform ? transform(data) : data;

      // استخدام الـ customRequest للتعامل مع path parameters
      const response = await api.customRequest(alias, payload);

      console.log("response", response);
      onSuccess?.(response);
      return { success: true, data: response };
    } catch (error: any) {
      console.error("API Error:", error);
      
      const serverErrors = error?.response?.data;

      if (serverErrors && typeof serverErrors === "object") {
        // معالجة أخطاء الحقول
        for (const [field, messages] of Object.entries(serverErrors)) {
          if (Array.isArray(messages)) {
            methods.setError(field as string, {
              type: "server",
              message: messages.join(" "),
            });
          }
        }
        
        // معالجة الأخطاء العامة
        const nonFieldError =
          (Array.isArray(serverErrors?.non_field_errors) && serverErrors.non_field_errors.join(" ")) ||
          serverErrors?.detail ||
          handleErrorStatus(error);
        
        if (nonFieldError) {
          methods.setError("root", {
            type: "server",
            message: nonFieldError,
          });
        }
      } else {
        // معالجة الأخطاء غير المتوقعة
        methods.setError("root", {
          type: "server",
          message: handleErrorStatus(error),
        });
      }

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
    errors: methods.formState.errors,
    isSubmitting: methods.formState.isSubmitting,

  };
}