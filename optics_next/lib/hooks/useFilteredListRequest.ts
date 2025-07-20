'use client';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useFilteredListRequest(alias: string) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>([]);

  const fetchData = useFormRequest({
    alias,
    onSuccess: (res:any) => {
      setData(res);
    },
    onError: (err:any) => {
      toast.error(err);
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
