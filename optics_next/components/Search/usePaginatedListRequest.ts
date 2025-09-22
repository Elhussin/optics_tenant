import { useState, useEffect } from "react";
import { useFormRequest } from "@/lib/hooks/useFormRequest";

export function usePaginatedListRequest(alias: string, page = 1, filters: any = {}) {
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dataRequest = useFormRequest({ alias:alias });

  useEffect(() => {
    const fetchData = async () => {
      console.log(alias, page, filters);
      setIsLoading(true);
      const params = { ...filters, page };
      const res = await dataRequest.submitForm(params);
      setData(res.data.results);
      setCount(res.data.count);
      setIsLoading(false);
    };
    fetchData();
  }, [alias, page, JSON.stringify(filters)]);

  return { data, count, isLoading };
}
