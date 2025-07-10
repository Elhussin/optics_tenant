// lib/hooks/useCrudFormRequest.ts
import { useFormRequest } from "./useFormRequest";
import { toast } from "sonner";
import { SubmitHandler } from "react-hook-form";
import { formRequestProps } from '@/types';


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
      toast.error("Something went wrong");
      console.error("Form error:", err);
    },
  });

  const onSubmit: SubmitHandler<any> = async (data) => {
    const result = await form.submitForm(data);
    if (!result || !result.success) {
      console.error("Form submission failed:", result?.error);
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
