// TextField.tsx
import { useProductFormStore } from "../../../features/product/store/useProductFormStore";

export const TextField = ({ item, register, errors, variantNumber }: { item: any, register: any, errors: any, variantNumber?: number }) => {
  const { setVariantField } = useProductFormStore();

  const registerName = variantNumber !== undefined ? `variants.${variantNumber}.${item.name}` : item.name;

  const handleLocalChange = (e: any) => {
    if (typeof variantNumber === "number") {
      setVariantField(variantNumber, item.name, e.target.value);
    }
  };

  return (
    <div className="mb-4">
      <label className="label" htmlFor={registerName} title={item.title} >
        {item.label}
      </label>
      {item.type === "textarea" ? (
        <textarea
          id={registerName}
          required={item.required}
          rows={item.rows}
          placeholder={item.placeholder || item.label + "..."}
          {...register(registerName)}
          className="input-text h-[100px]"
          onChange={(e) => {
            handleLocalChange(e);
          }}
        />
      ) : (
        <input
          id={registerName}
          type={item.type === "number" ? "number" : "text"}
          required={item.required}
          placeholder={item.placeholder || item.label + "..."}
          {...register(registerName)}
          className={item.type === "textarea" ? "textarea" : "input-text"}
          onChange={(e) => {
            handleLocalChange(e);
          }}
        />
      )}
      {errors && errors[registerName] && <p className="text-red-500 text-sm mt-1">{errors[registerName]?.message}</p>}
    </div>
  );
};
