import { generateSearchFieldsFromEndpoint } from "@/utils/generateSearchFields";
import { useSearchFieldsFromOptions } from "@/lib/hooks/useFilterDataOptions";

export function mergeSearchFields({
    filterAlias,
    listAlias,
    labels
}: {
    filterAlias: string,
    listAlias: string,
    labels?: Record<string, string>
}) {
    const { fields: optionFields, isLoading, errors } = useSearchFieldsFromOptions(filterAlias);

    const endpointFields = generateSearchFieldsFromEndpoint(listAlias, labels);
    console.log("generateSearchFieldsFromEndpoint",endpointFields)
    // من الـ API (options للقيم الموجودة)
   
    console.log("useSearchFieldsFromOptions",optionFields)
  // دمج القائمتين
  const merged = endpointFields.map((ef) => {
    // لو عندنا نفس الحقل في optionFields نضيف الـ options
    const matchingOpt = optionFields.find((of) => of.name === ef.name);

    return {
      ...ef,
      // لو فيه options من الـ API نستخدمها
      options: matchingOpt?.options ?? ef.options,
      // لو الحقل من النوع select والـ options موجودة
      type: (matchingOpt?.options?.length ?? 0) > 0 ? "select" : ef.type,
    };
  });

  // كمان نضيف أي حقل موجود في optionFields ومش موجود في endpointFields
  optionFields.forEach((of) => {
    if (!merged.find((m) => m.name === of.name)) {
      merged.push(of);
    }
  });

  return { fields: merged, isLoading, errors };
}
