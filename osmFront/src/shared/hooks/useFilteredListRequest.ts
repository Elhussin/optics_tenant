import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { IteamInPage } from "@/src/shared/constants"; 
import { useEffect, useState } from "react";
export function useFilteredListRequest(alias: string, defaultPage = 1) {
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const dataRequest = useApiForm({ alias });

  // ✨ حوّل searchParams إلى object
  const paramsObj = useMemo(() => {
    const obj: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }, [searchParams]);

  const page = parseInt(paramsObj.page || defaultPage, 10);



  
  useEffect(() => {

    async function fetchData() {
      const res = await dataRequest.query.refetch();
      if (res?.data) {
        setData(res?.data?.results || []);
        setCount(res?.data?.count || 0);
        setTotalPages(Math.ceil(count / (IteamInPage || 10)));
      }

    }
    fetchData();
  }, []);


  // ✨ setter للفلاتر
  const setFilters = (filters: Record<string, string>) => {
    const params = new URLSearchParams({ ...filters, page: "1" });
    router.push(`?${params.toString()}`);
  };

  // ✨ setter للصفحة
  const setPage = (newPage: number) => {
    const params = new URLSearchParams({ ...paramsObj, page: String(newPage) });
    router.push(`?${params.toString()}`);
  };

  return {
    data: data,
    count,
    totalPages,
    page,
    isLoading:dataRequest.isLoading,
    isError:dataRequest.isError,
    error:dataRequest.error,
    setFilters,
    setPage,
  };
}



