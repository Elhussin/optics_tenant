import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useFormRequest } from "@/src/shared/hooks/useFormRequest";
import { IteamInPage } from "@/src/shared/constants";

export function useFilteredListRequest(alias: string, defaultPage = 1) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const dataRequest = useFormRequest({ alias });

  // ✨ حوّل searchParams إلى object
  const paramsObj = useMemo(() => {
    const obj: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }, [searchParams]);

  const page = parseInt(paramsObj.page || defaultPage, 10);

  // ✨ React Query: جلب البيانات
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["filteredList", alias, paramsObj], // الكاش حسب alias + params
    queryFn: async () => {
      const res = await dataRequest.submitForm(paramsObj);
      return res.data;
    },
    // keepPreviousData: true, // يخلي البيانات القديمة لحد ما توصل الجديدة
    staleTime: 1000 * 60 * 5, // 5 دقايق كاش
  });

  const results = response?.results || [];
  const count = response?.count || 0;
  const totalPages = Math.ceil(count / (IteamInPage || 10));

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
    data: results,
    count,
    totalPages,
    page,
    isLoading,
    isError,
    error,
    setFilters,
    setPage,
  };
}
