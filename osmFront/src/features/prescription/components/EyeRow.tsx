import { EyeRowProps, errorInputClass } from "../types";
import { handleEyeTestFormat } from "../utils/handleEyeTestFormat";

const EyeRow: React.FC<EyeRowProps> = (props) => {
  const { side, register, isView, fieldErrors, setFieldErrors, setValue, getValues } = props;
  const prefix = side === "right" ? "OD" : "OS"; // Using Medical Abbreviations OD (Right) / OS (Left)
  const colorClass = side === "right" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-green-600 bg-green-50 dark:bg-green-900/20";
  
  const baseInputClass = "w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-center font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300 disabled:opacity-50 disabled:bg-gray-50";

  return (
    <div className="grid grid-cols-[60px_repeat(4,1fr)] gap-3 items-center">
      <div className={`flex items-center justify-center h-10 w-10 rounded-full font-bold ${colorClass}`}>
        {prefix}
      </div>

      {["sphere", "cylinder", "axis", "reading_add"].map((field) => {
        const fieldName = `${side}_${field}`;
        const isError = fieldErrors[fieldName];
        
        // Custom placeholders/min/max per field
        let placeholder = "0.00";
        if (field === "axis") placeholder = "000";
        
        return (
          <div key={field} className="relative group">
            <input
              type={field === "axis" ? "number" : "text"}
              {...register(fieldName)}
              onBlur={(e) => handleEyeTestFormat({ field: fieldName, value: e.target.value, setFieldErrors, setValue, getValues })}
              className={`${baseInputClass} ${isError ? "border-red-500 ring-2 ring-red-500/20" : ""}`}
              placeholder={placeholder}
              min={field === "axis" ? "1" : undefined}
              max={field === "axis" ? "180" : undefined}
              step={field === "axis" ? "1" : "0.25"}
              disabled={isView}
            />
          </div>
        );
      })}
    </div>
  );
};

export default EyeRow;