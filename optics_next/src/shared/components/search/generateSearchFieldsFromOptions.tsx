import { useEffect, useState } from "react";
import { useFormRequest } from "@/src/shared/hooks/useFormRequest";
import { formatLabel } from "@/src/shared/utils/cardViewHelper";

export function useSearchFieldsFromOptions(alias: string) {
  const [fields, setFields] = useState<any[]>([]);
  const fetchData = useFormRequest({ alias });

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await fetchData.submitForm();

        if (result?.data) {
          const mapped = Object.keys(result.data).map((key) => ({
            name: key,
            label: formatLabel(key), // هنا تقدر تحط ترجمة
            type: "select" as const,
            options: result.data[key].map((val: string) => ({
              label: val,
              value: val,
            })),
          }));
          setFields(mapped);
        }
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };
    fetch();
  }, [alias]);

  return fields;
}
