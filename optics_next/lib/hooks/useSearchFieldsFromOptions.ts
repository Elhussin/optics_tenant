import { useEffect, useState } from "react";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { formatLabel } from "@/utils/cardViewHelper";

export function useSearchFieldsFromOptions(alias: string) {
  const [fields, setFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>(null);

  const fetchData = useFormRequest({ alias });

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        setErrors(null);

        const result = await fetchData.submitForm();

        if (result?.data) {
          const mapped = Object.keys(result.data).map((key) => ({
            name: key,
            label: formatLabel(key),
            type: "select" as const,
            options: result.data[key].map((val: string) => ({
              label: val,
              value: val,
            })),
          }));
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
