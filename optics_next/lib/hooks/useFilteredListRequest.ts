'use client';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { handleErrorStatus } from '@/lib/utils/error';

export function useFilteredListRequest(alias: string) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>([]);

  const fetchData = useFormRequest({
    alias: alias,
    onSuccess: (res) => {
      setData(res);
    },
    onError: (err) => {
      toast.error(handleErrorStatus(err));
      // console.error("fetch error", err);
    },
  });

  const refetch = () => {
    const paramsObj: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    fetchData.submitForm(paramsObj);
  };

  useEffect(() => {
    refetch();
  }, [searchParams.toString()]);

  return {
    data,
    refetch,  
    isLoading: fetchData.isSubmitting,
    errors: fetchData.errors,
  };
}
