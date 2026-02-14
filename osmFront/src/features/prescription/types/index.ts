import { formRequestProps } from "@/src/shared/types";
/* ======================
   🔹 UI Helpers
   ====================== */
export const errorInputClass = "border-red-500 bg-red-500 text-white focus:ring-red-500";
export const normalInputClass = "border-gray-300 focus:ring-blue-500";



/* ======================
   🔹 EyeRow Component
   ====================== */
export interface EyeRowProps {
   side: "right" | "left";
   register: any;
   isView: boolean;
   fieldErrors: Record<string, boolean>;
   setFieldErrors: (fieldErrors: Record<string, boolean>) => void;
   setValue: (field: string, value: string) => void;
   getValues: (field: string) => string;
}


/* ======================
   🔹 Main Form Component
   ====================== */
export interface PrescriptionFormProps extends formRequestProps {
   isView?: boolean;
   showContactLens?: boolean;
   customerId?: number | string; // تعيين العميل من الخارج
   onSaveSuccess?: (data: any) => void; // callback بعد الحفظ الناجح
   compact?: boolean; // عرض مضغوط بدون العناوين الكبيرة
   disableCustomerSelect?: boolean;
   hideBackButton?: boolean;
}

export interface OtherFailedProps {
   register: any;
   customers: Record<string, any>[];
   setShowModal: (value: boolean) => void;
   errors: any;
   isView?: boolean;
   disableCustomerSelect?: boolean;

}
