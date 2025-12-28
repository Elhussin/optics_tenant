import React from "react";
import { Eye, Ruler, Activity } from "lucide-react";

type LensData = {
  SPH: string;
  CY?: string;
  ADD: string;
  "Exact SPH": string;
  "Exact CY"?: string;
  AX: string;
  BV: number;
};

type Props = {
  leftSphere: LensData;
  rightSphere: LensData;
  leftToric: LensData;
  rightToric: LensData;
};

const ContactLensViewer: React.FC<Props> = ({
  rightSphere,
  leftSphere,
  rightToric,
  leftToric,
}) => {
  const renderSection = (title: string, data: LensData, side: "right" | "left") => {
    const isRight = side === "right";
    const bgClass = isRight ? "bg-blue-50/50 dark:bg-blue-900/10" : "bg-green-50/50 dark:bg-green-900/10";
    const borderClass = isRight ? "border-blue-100 dark:border-blue-800" : "border-green-100 dark:border-green-800";
    const textClass = isRight ? "text-blue-700 dark:text-blue-300" : "text-green-700 dark:text-green-300";

    return (
      <div className={`rounded-2xl border ${borderClass} ${bgClass} overflow-hidden`}>
        <div className={`px-4 py-3 border-b ${borderClass} flex items-center gap-2`}>
           <Eye className={`w-4 h-4 ${textClass}`} />
           <h3 className={`font-semibold text-sm ${textClass}`}>{title}</h3>
        </div>
        <div className="p-4 space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wide">{key}</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 px-1">
         <Activity className="w-5 h-5 text-primary" />
         <h2 className="text-lg font-bold text-gray-900 dark:text-white">Calculated Contact Lens Values</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderSection("OD (Right) Sphere", rightSphere, "right")}
        {renderSection("OS (Left) Sphere", leftSphere, "left")}
        {renderSection("OD (Right) Toric", rightToric, "right")}
        {renderSection("OS (Left) Toric", leftToric, "left")}
      </div>
    </div>
  );
};

export default ContactLensViewer;
