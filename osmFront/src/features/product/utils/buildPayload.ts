/**
 * يبني payload لأي كيان (product أو variant)
 * @param {Array} config - إعدادات الحقول (ProductConfig أو ProductVariantConfig)
 * @param {Object} formData - البيانات من form (product أو variants)
 * @param {Object} options - خيارات إضافية للتحكم في السلوك
 * @returns {Object|Array} - payload جاهز للإرسال
 */
type BuildPayloadOptions= {
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

export function buildPayload({config, formData, options = {}}: BuildPayloadProps) {
  const {
    role,               // role لتصفية الحقول (optional)
    prefix = "",        // مسار داخل formData (مثلاً "variants")
    include = [],       // حقول إضافية تضاف دايمًا
    multiple = false,   // لو true => يرجع Array (لـ variants)
  } = options;

  // دالة داخلية لتجميع البيانات من كائن واحد
  const buildSingle = (data : any) =>
    config
      .filter(
        (field : any) =>
          field.role === "all" ||
          (role && field.role === role)
      )
      .reduce((acc : any, field : any) => {
        const name = field.name;
        acc[name] = data?.[name] ?? "";
        return acc;
      }, {});

  // إضافة include fields لو موجودة
  const addInclude = (payload : any, data : any) => {
    include.forEach((name : any) => {
      payload[name] = data?.[name] ?? "";
    });
    return payload;
  };

  // لو الحقول متعددة (variants)
  if (multiple) {
    const dataArray = prefix ? formData[prefix] || [] : formData || [];
    return dataArray.map((item : any) => addInclude(buildSingle(item), item));
  }

  // لو الحقول مفردة (product)
  const targetData = prefix ? formData[prefix] || {} : formData;
  return addInclude(buildSingle(targetData), formData);
}
