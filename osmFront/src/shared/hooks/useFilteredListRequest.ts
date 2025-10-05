// import { useMemo } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { useApiForm } from "@/src/shared/hooks/useApiForm";
// import { IteamInPage } from "@/src/shared/constants"; 
// import { useEffect, useState } from "react";
// export function useFilteredListRequest(alias: string, defaultPage = 1,page_size = 10,all = false) {
//   const [data, setData] = useState<any[]>([]);
//   const [count, setCount] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
  
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const dataRequest = useApiForm({ alias,defaultValues:{page_size,all,page:defaultPage} });

//   // ✨ حوّل searchParams إلى object
//   const paramsObj = useMemo(() => {
//     const obj: Record<string, any> = {};
//     searchParams.forEach((value, key) => {
//       obj[key] = value;
//     });
//     return obj;
//   }, [searchParams]);

//   const page = parseInt(paramsObj.page || defaultPage, 10);



//   // page_size,all
//   useEffect(() => {

//     async function fetchData() {
//       const res = await dataRequest.query.refetch();
//       if (res?.data) {
//         console.log("useFilteredListRequest", res.data);
//         setData(res?.data?.results || []);
//         setCount(res?.data?.count || 0);
//         setTotalPages(Math.ceil(count / (IteamInPage || 10)));
//       }

//     }
//     fetchData();
//   }, [page_size,all,defaultPage]);


//   // ✨ setter للفلاتر
//   const setFilters = (filters: Record<string, string>) => {
//     const params = new URLSearchParams({ ...filters, page: "1" });
//     router.push(`?${params.toString()}`);
//   };

//   // ✨ setter للصفحة
//   const setPage = (newPage: number) => {
//     const params = new URLSearchParams({ ...paramsObj, page: String(newPage) });
//     router.push(`?${params.toString()}`);
//   };

//   return {
//     data: data,
//     count,
//     totalPages,
//     page,
//     isLoading:dataRequest.isLoading,
//     isError:dataRequest.isError,
//     error:dataRequest.error,
//     setFilters,
//     setPage,
//   };
// }



import { useMemo, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { IteamInPage } from "@/src/shared/constants";

export function useFilteredListRequest(
  alias: string,
  defaultPage = 1,
  defaultPageSize = IteamInPage,
  defaultAll = false
) {
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ تحويل searchParams إلى object
  const paramsObj = useMemo(() => {
    const obj: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }, [searchParams]);


  const page = parseInt(paramsObj.page || defaultPage, 10);
  const page_size = parseInt(paramsObj.page_size || defaultPageSize, 10);
  const all = paramsObj.all === "true" || defaultAll;

  // ✅ إنشاء hook الطلب وتمرير كل الفلاتر والبحث داخله
  const dataRequest = useApiForm({
    alias,
    defaultValues: {
      page,
      page_size,
      all,
      ...paramsObj, // ← نمرر جميع الفلاتر والبحث أيضًا
    },
  });

  // ✅ جلب البيانات عند تغير أي من المعاملات
  useEffect(() => {
    async function fetchData() {
      const res = await dataRequest.query.refetch();
      if (res?.data) {
        setData(res.data.results || res.data || []);
        setCount(res.data.count || 0);
        setTotalPages(Math.ceil((res.data.count || 0) / page_size));
      }
    }
    fetchData();
  }, [page, page_size, all, JSON.stringify(paramsObj)]); // ← react يستجيب لتغير أي فلتر

  // ✅ تغيير الفلاتر (بما فيهم البحث)
  const setFilters = (filters: Record<string, string>) => {
    const params = new URLSearchParams({ ...paramsObj, ...filters, page: "1" });
    router.push(`?${params.toString()}`);
  };

  // ✅ تغيير الصفحة
  const setPage = (newPage: number) => {
    const params = new URLSearchParams({ ...paramsObj, page: String(newPage) });
    router.push(`?${params.toString()}`);
  };

  // ✅ تغيير حجم الصفحة (اختياري)
  const setPageSize = (newSize: number) => {
    const params = new URLSearchParams({ ...paramsObj, page_size: String(newSize), page: "1" });
    router.push(`?${params.toString()}`);
  };

  return {
    data,
    count,
    totalPages,
    page,
    page_size,
    all,
    isLoading: dataRequest.isLoading,
    isError: dataRequest.isError,
    error: dataRequest.error,
    setFilters,
    setPage,
    setPageSize,
  };
}
