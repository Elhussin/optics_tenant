import { errorInputClass, normalInputClass } from "./formTypes";
import { EyeExtraRowProps } from "./formTypes";



 const EyeExtraRow: React.FC<EyeExtraRowProps> = ({ side, register, isView, fieldErrors, handleFormat }) => {
  return (
    <div className="grid grid-cols-[80px_repeat(4,1fr)] md:grid-cols-5 gap-2">
      <div className="flex items-center md:hidden">
        <h3 className="text-lg font-semibold">{side === "right" ? "R" : "L"}</h3>
      </div>

      {/* PD */}
      <div>
        <input
          type="number"
          {...register(`${side}_pupillary_distance`)}
          onBlur={(e) => handleFormat(`${side}_pupillary_distance`, e.target.value)}
          // className={`input-text ${fieldErrors[`${side}_pupillary_distance`] ? errorInputClass : normalInputClass}`}
          placeholder="00"
          min="19"
          max="85"
          step="0.25"
          disabled={isView}
        />
      </div>

      {/* SG */}
      <div>
        <input
          type="number"
          {...register(`sigmant_${side}`)}
          onBlur={(e) => handleFormat(`sigmant_${side}`, e.target.value)}
          // className={`input-text ${fieldErrors[`sigmant_${side}`] ? errorInputClass : normalInputClass}`}
          placeholder="00"
          min="8"
          max="55"
          step="1"
          disabled={isView}
        />
      </div>

      {/* VA */}
      <div>
        <input
          type="text"
          {...register(`a_v_${side}`)}
          // className={`input-text ${fieldErrors[`a_v_${side}`] ? errorInputClass : normalInputClass}`}
          placeholder="V/A"
          disabled={isView}
        />
      </div>
    </div>
  );
};


export default EyeExtraRow;
