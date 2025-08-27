'use client';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState,useCallback } from 'react';


// export function useFilteredListRequest(alias: string) {
//   const searchParams = useSearchParams();
//   const [data, setData] = useState<any>([]);

//   const fetchData = useFormRequest({
//     alias,
//     onSuccess: (res:any) => {
//       setData(res);
//     },

//   });

//   const refetch = () => {
//     const paramsObj: Record<string, any> = {};
//     searchParams.forEach((value, key) => {
//       paramsObj[key] = value;
//     });
//     fetchData.submitForm(paramsObj);
//   };

//   useEffect(() => {
//     refetch();
//   }, [searchParams.toString(),refetch]);

//   return {
//     data,
//     refetch,  
//     isLoading: fetchData.isSubmitting,
//     errors: fetchData.errors,
//   };
// }
export function useFilteredListRequest(alias: string) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>([]);

  const fetchData = useFormRequest({
    alias,
    onSuccess: (res: any) => {
      setData(res);
    },
  });

  const refetch = useCallback(() => {
    const paramsObj: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    fetchData.submitForm(paramsObj);
  }, [fetchData, searchParams]); // 👈 متغلفة بـ useCallback

  const query = searchParams.toString(); // 👈 عشان dependency تبقى ثابتة

  useEffect(() => {
    refetch();
  }, [query, refetch]);

  return {
    data,
    refetch,
    isLoading: fetchData.isSubmitting,
    errors: fetchData.errors,
  };
}
