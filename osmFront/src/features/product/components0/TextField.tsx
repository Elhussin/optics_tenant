import { useProductFormStore } from "../store/useProductFormStore";

export const TextField = ({ data ,register, errors }: { data: any, register: any, errors: any }) => {
  const { setVariantField,openVariantIndex } = useProductFormStore();
  return (
      <>
          <div className="mb-4">
            <label htmlFor={data.name} className="block text-sm font-medium text-gray-700 mb-1">
              {data.label}
            </label>
            {data.type==="textarea" ? 
            <textarea
              id={data.name}
              required={data.required}
              rows={data.rows}
              placeholder={data.placeholder||data.label + "..."}
              {...register(data.name)}
              className="input-text h-[100px]"
              onChange={(e) =>
                setVariantField(openVariantIndex!, data.name, e.target.value)
              }

              
            /> : <input
              id={data.name}
              type={data.type==="number" ? "number" : "text"}
              required={data.required}
              placeholder={data.placeholder||data.label + "..."}
              {...register(data.name)}
              className={data.type==="textarea" ? "textarea" : "input-text"}
              onChange={(e) =>
                setVariantField(openVariantIndex!, data.name, e.target.value)
              }      
            />
            }
            {errors[data.name] && <p className="text-red-500 text-sm mt-1">{errors[data.name]?.message}</p>}
          </div>
      </>
    );
  }
  

