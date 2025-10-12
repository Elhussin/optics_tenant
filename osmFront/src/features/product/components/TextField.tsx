// TextField.tsx
import { useProductFormStore } from "../store/useProductFormStore";

export const TextField = ({ data, register, errors, variantNumber }: { data: any, register: any, errors: any, variantNumber?: number }) => {
  const { setVariantField } = useProductFormStore();

  const registerName = variantNumber !== undefined ? `variants.${variantNumber}.${data.name}` : data.name;

  const handleLocalChange = (e: any) => {
    if (typeof variantNumber === "number") {
      setVariantField(variantNumber, data.name, e.target.value);
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={registerName} className="block text-sm font-medium text-gray-700 mb-1">
        {data.label}
      </label>
      {data.type === "textarea" ? (
        <textarea
          id={registerName}
          required={data.required}
          rows={data.rows}
          placeholder={data.placeholder || data.label + "..."}
          {...register(registerName)}
          className="input-text h-[100px]"
          onChange={(e) => {
            handleLocalChange(e);
          }}
        />
      ) : (
        <input
          id={registerName}
          type={data.type === "number" ? "number" : "text"}
          required={data.required}
          placeholder={data.placeholder || data.label + "..."}
          {...register(registerName)}
          className={data.type === "textarea" ? "textarea" : "input-text"}
          onChange={(e) => {
            handleLocalChange(e);
          }}
        />
      )}
      {errors && errors[registerName] && <p className="text-red-500 text-sm mt-1">{errors[registerName]?.message}</p>}
    </div>
  );
};
