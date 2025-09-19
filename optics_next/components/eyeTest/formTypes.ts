export const errorInputClass = "border-red-500 focus:ring-red-500";
export const normalInputClass = "border-gray-300 focus:ring-blue-500";


/* ======================
   🔹 EyeRow Component
   ====================== */
export interface EyeRowProps {
    side: "right" | "left";
    register: any;
    isView: boolean;
    fieldErrors: Record<string, boolean>;
    handleFormat: (field: string, value: string) => void;
  }



/* ======================
   🔹 EyeExtraRow Component
   ====================== */
export interface EyeExtraRowProps {
    side: "right" | "left";
    register: any;
    isView: boolean;
    fieldErrors: Record<string, boolean>;
    handleFormat: (field: string, value: string) => void;
  }
  