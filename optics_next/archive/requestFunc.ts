import { toast } from "sonner";
import { useFormRequest } from "@/lib/hooks/useFormRequest";


type DropProps = {
  alias: string;
  successMessage: string;
  errorMessage: string;
}

export function useDeleteRequest({ alias, successMessage, errorMessage }: DropProps) {

  const { submitForm, isLoading } = useFormRequest({
    alias,
    onSuccess: (response) => {
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(errorMessage);
    }
  });

  const deleteRequest = async (userId: string | number) => {
    return await submitForm({ id: userId });
  };


  return { deleteRequest, isLoading };
}


export function useUpdateRequest({ alias, successMessage, errorMessage }: DropProps) {

  const { submitForm, isLoading } = useFormRequest({
    alias,
    onSuccess: (response) => {
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(errorMessage);
    }
  });

  const updateRequest = async (userId: string | number) => {
    return await submitForm({ id: userId });
  };


  return { updateRequest, isLoading };
}

export function useCreateRequest({ alias, successMessage, errorMessage }: DropProps) {

  const { submitForm, isLoading } = useFormRequest({
    alias,
    onSuccess: (response) => {
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(errorMessage);
    }
  });

  const createRequest = async (userId: string | number) => {
    return await submitForm({ id: userId });
  };


  return { createRequest, isLoading };
}


export function useListRequest({ alias, successMessage, errorMessage }: DropProps) {

  const { submitForm, isLoading } = useFormRequest({
    alias,
    onSuccess: (response) => {
      toast.success(successMessage);
      return response;
    },
    onError: (error) => {
      toast.error(errorMessage);
      return error;
    }
  });

  const listRequest = async () => {
    return await submitForm();

  };


  return { listRequest, isLoading };
}