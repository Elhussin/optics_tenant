import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFormRequest } from "@/lib/hooks/useFormRequest";

export function useListRequest(alias: string, defaultPage = 1) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>(null);

  const dataRequest = useFormRequest({ alias });

  // ✨ حوّل searchParams ل object
  const paramsObj = useMemo(() => {
    const obj: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }, [searchParams]);

  const page = parseInt(paramsObj.page || defaultPage, 10);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrors(null);

      const res = await dataRequest.submitForm(paramsObj);

      setData(res.data.results || []);
      setCount(res.data.count || 0);
    } catch (err: any) {
      setErrors(err);
    } finally {
      setIsLoading(false);
    }
  }, [alias, JSON.stringify(paramsObj)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    data,
    count,
    page,
    isLoading,
    errors,
    setFilters,
    setPage,
  };
}
