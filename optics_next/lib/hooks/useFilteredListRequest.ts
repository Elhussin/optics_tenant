'use client';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useFilteredListRequest(alias: string) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>([]);
  const fetchData = useFormRequest({ alias: alias, onSuccess: (res) => { toast.success("fetchData"); setData(res); }, onError: (err) => { console.log("err",err); } });
  useEffect(() => {
    const paramsObj: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    fetchData.submitForm(paramsObj);
  }, [searchParams.toString()]);

  return {data};
}
