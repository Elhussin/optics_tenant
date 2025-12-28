import { EyeRowProps } from "../types";
import { handleEyeTestFormat } from "../utils/handleEyeTestFormat";

const EyeExtraRow: React.FC<EyeRowProps> = (props) => {
  const { side, register, isView, fieldErrors, setFieldErrors, setValue, getValues } = props;
  const baseInputClass = "w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-center font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300 disabled:opacity-50 disabled:bg-gray-50";

  return (
    <div className="grid grid-cols-[60px_repeat(4,1fr)] md:grid-cols-5 gap-3 items-center">
      <div className="flex items-center md:hidden justify-center h-10 w-10 rounded-full font-bold bg-gray-100 dark:bg-gray-800">
        <h3 className="text-lg font-semibold">{side === "right" ? "R" : "L"}</h3>
      </div>

      {[
        { name: `${side}_pupillary_distance`, placeholder: "00", title: "PD" },
        { name: `sigmant_${side}`, placeholder: "00", title: "SG" },
        { name: `vertical_distance_${side}`, placeholder: "00", title: "VD" },
        { name: `a_v_${side}`, placeholder: "V/A", title: "VA", type: "text" }
      ].map((field) => {
        const isError = fieldErrors[field.name];
        return (
          <div key={field.name} className="relative">
            <input
              type={field.type || "number"}
              {...register(field.name)}
              onBlur={(e) => handleEyeTestFormat({ field: field.name, value: e.target.value, setFieldErrors, setValue, getValues })}
              className={`${baseInputClass} ${isError ? "border-red-500 ring-2 ring-red-500/20" : ""}`}
              placeholder={field.placeholder}
              disabled={isView}
              title={field.title}
              step={field.type === "text" ? undefined : "0.25"}
            />
          </div>
        );
      })}
    </div>
  );
};
export default EyeExtraRow;
