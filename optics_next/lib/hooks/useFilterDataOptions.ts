import { useEffect, useState } from "react";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { formatLabel } from "@/utils/cardViewHelper";
import { detectFieldType } from "@/utils/generateSearchFields";

export function useFilterDataOptions(alias: string,) {
  const [fields, setFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>(null);

  const fetchData = useFormRequest({ alias,});

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        setErrors(null);
  
        const result = await fetchData.submitForm();
        console.log("useFilterDataOptions", result);
  
        if (Array.isArray(result?.data)) {
          const mapped = result.data.map((item: any) => {
            const type = detectFieldType(item.name); // helper لتحديد النوع
            return {
              name: item.name,         // الاسم الأصلي (key)
              label: item.label,       // الاسم المعروض
              type: item.values.length > 0 ? "select" : type,
              options: item.values.map((val: string) => ({
                label: val,
                value: val,
              })),
            };
          });
  
          setFields(mapped);
        }
      } catch (err) {
        setErrors(err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetch();
  }, [alias]);
  

  return { fields, isLoading, errors };
}
