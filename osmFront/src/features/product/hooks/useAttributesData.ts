import { useEffect, useState } from "react";
// import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";

export function useAttributesData() {
  // const fetchAttributes = useApiForm({ alias: "products_attributes_list" });
//   defaultPage = 1,
//   defaultPageSize = IteamInPage,
//   defaultAll = false
  const fetchAttributes = useFilteredListRequest({alias:"products_attributes_list",defaultAll:true});
  const [attributes, setAttributes] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchAttributes.query.refetch().then((res: any) => {
      if (res?.data?.results) {
        const grouped = res.data.results.reduce((acc: any, attr: any) => {
          acc[attr.name] = attr.values || [];
          return acc;
        }, {});
        setAttributes(grouped);
      }
    });
  }, [fetchAttributes]);

  return { attributes, loading: fetchAttributes.query.isLoading };
}
