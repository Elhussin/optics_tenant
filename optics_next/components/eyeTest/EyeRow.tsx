
import { EyeRowProps,errorInputClass,normalInputClass } from "./formTypes";

const EyeRow: React.FC<EyeRowProps> = ({ side, register, isView, fieldErrors, handleFormat }) => {
  const prefix = side === "right" ? "R" : "L";
  return (
    <div className="grid grid-cols-[80px_repeat(4,1fr)] gap-2">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold">{prefix}</h3>
      </div>

      {/* SPH */}
      <div>
        <input
          type="text"
          {...register(`${side}_sphere`)}
          onBlur={(e) => handleFormat(`${side}_sphere`, e.target.value)}
          // className={`input-text ${!fieldErrors[`${side}_sphere`] ? errorInputClass : normalInputClass}`}
          placeholder="-00.00"
          min="-60"
          max="60"
          step="0.25"
          disabled={isView}
        />
      </div>

      {/* CYL */}
      <div>
        <input
          type="text"
          {...register(`${side}_cylinder`)}
          onBlur={(e) => handleFormat(`${side}_cylinder`, e.target.value)}
          // className={`input-text ${!fieldErrors[`${side}_cylinder`] ? errorInputClass : normalInputClass}`}
          placeholder="-00.00"
          min="-15"
          max="15"
          step="0.25"
          disabled={isView}
        />
      </div>

      {/* AXIS */}
      <div>
        <input
          type="number"
          {...register(`${side}_axis`)}
          onBlur={(e) => handleFormat(`${side}_axis`, e.target.value)}
          // className={`input-text ${!fieldErrors[`${side}_axis`] ? errorInputClass : normalInputClass}`}
          placeholder="000"
          min="1"
          max="180"
          step="1"
          disabled={isView}
        />
      </div>

      {/* ADD */}
      <div>
        <input
          type="text"
          {...register(`${side}_reading_add`)}
          onBlur={(e) => handleFormat(`${side}_reading_add`, e.target.value)}
          // className={`input-text ${!fieldErrors[`${side}_reading_add`] ? errorInputClass : normalInputClass}`}
          placeholder="+00.00"
          min="0.25"
          max="4"
          step="0.25"
          disabled={isView}
        />
      </div>
    </div>
  );
};

export default EyeRow;