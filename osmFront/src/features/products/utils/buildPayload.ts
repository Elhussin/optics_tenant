// buildPayload.ts
type BuildPayloadOptions = {
  role?: string;
  prefix?: string;
  include?: string[];
  multiple?: boolean;
};

interface BuildPayloadProps {
  config: any;
  formData: any;
  options?: BuildPayloadOptions;
}

export function buildPayload({ config, formData, options = {} }: BuildPayloadProps) {
  const {
    role,
    prefix = "",
    include = [],
    multiple = false,
  } = options;

  console.log("🔧 buildPayload called with:");
  console.log("  - formData:", formData);
  console.log("  - config fields:", config?.map((c: any) => c.name));
  console.log("  - options:", options);

  const buildSingle = (data: any) => {
    console.log("  🔨 buildSingle processing:", data);
    const result = config
      .filter((field: any) => field.role === "all" || !role || field.role === role)
      .reduce((acc: any, field: any) => {
        const name = field.name;
        acc[name] = data?.[name] ?? "";
        return acc;
      }, {
        ...(data?.id ? { id: data.id } : {}) // Always include ID if present
      });
    console.log("  🔨 buildSingle result:", result);
    return result;
  };

  const addInclude = (payload: any, data: any) => {
    include.forEach((name: any) => {
      payload[name] = data?.[name] ?? "";
    });
    return payload;
  };

  // Support: formData could be an array, or an object that contains prefix array, or object for single entity
  if (multiple) {
    let dataArray: any[] = [];
    if (Array.isArray(formData)) dataArray = formData;
    else if (prefix && formData && Array.isArray(formData[prefix])) dataArray = formData[prefix];
    else if (Array.isArray(formData?.variants)) dataArray = formData.variants;
    console.log("  📝 dataArray to process:", dataArray);
    const result = dataArray.map((item: any) => addInclude(buildSingle(item), item));
    console.log("  ✅ buildPayload multiple result:", result);
    return result;
  }

  const targetData = prefix ? (formData?.[prefix] || {}) : formData || {};
  const result = addInclude(buildSingle(targetData), targetData);
  console.log("  ✅ buildPayload single result:", result);
  return result;
}

