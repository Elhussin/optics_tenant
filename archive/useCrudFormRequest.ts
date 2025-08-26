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
    onError: (err: any) => {
      onError?.(err);
      const statusError : string = handleErrorStatus(err);
      console.log(statusError);
      toast.error(`${statusError}`);
    },
  });



  const onSubmit: SubmitHandler<any> = async (data) => {
    const result = await form.submitForm(data);
    if (!result || !result.success) {
      return;
    }
    form.reset();
    onSuccess?.();
  };

  return {
    form,
    onSubmit,
  };
}


