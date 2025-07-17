// lib/hooks/useCrudFormRequest.ts
import { useFormRequest } from "./useFormRequest";
import { toast } from "sonner";
import { SubmitHandler } from "react-hook-form";
import { formRequestProps } from '@/types';
import { handleErrorStatus } from "@/lib/utils/error";

export function useCrudFormRequest({
  alias,
  defaultValues,
  onSuccess,
  onError,
}: formRequestProps) {
  const form = useFormRequest({
    alias,
    defaultValues,
    onError: (err) => {
      onError?.(err);
      toast.error(handleErrorStatus(err));
    },
  });

  const onSubmit: SubmitHandler<any> = async (data) => {
    const result = await form.submitForm(data);
    if (!result || !result.success) {
      return;
    }
    form.reset(result.data);
    onSuccess?.(result.data);
  };

  return {
    form,
    onSubmit,
  };
}


export function createFetcher(alias: string, onSuccess?: (res: any) => void, onError?: (err: any) => void) {
  return useFormRequest({
    alias,
    onSuccess,
    onError: (err) => {
      onError?.(err);
    },
    // isLoading: false,
  }).submitForm;
}
