// "use client";
// import React from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";
// import { z } from "zod";
// import { PrescriptionRecordRequest } from "@/lib/api/zodClient"; // schema اللي عندك
// import { EyeTestValidator } from "@/lib/utils/EyeTestValidator"; // الكلاس اللي كتبناه
// import { useFormRequest } from "@/lib/hooks/useFormRequest";
// import { formRequestProps } from "@/types";
// import { useState } from "react";
// import { useEffect } from "react";

// type PrescriptionFormData = z.infer<typeof PrescriptionRecordRequest>;
// const validator = new EyeTestValidator();


// export default function PrescriptionForm(props: formRequestProps) {
//   const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

//   const {
//     register,
//     watch,
//     setValue,
//     handleSubmit,
//     formState: { errors,isSubmitting },
//   } = useForm<PrescriptionFormData>();

//   const values = watch(["right_sphere", "right_cylinder", "right_axis"]);
//   useEffect(() => {
//     const [sph, cyl, axis] = values.map((v) => (v ? parseFloat(v) : null));
//     const newErrors: Record<string, string> = {};

//     // --- SPH ---
//     if (sph !== null) {
//       const formatted = validator.validateSPH(sph);
//       if (formatted) {
//         setValue("right_sphere", formatted);
//       } else {
//         newErrors["right_sphere"] = "SPH غير صالح (من مضاعفات 0.25 وبحد ±60)";
//       }
//     }

//     // --- CYL + AXIS ربط منطقي ---
//     if (cyl !== null && axis === null) {
//       newErrors["right_axis"] = "لو أدخلت CYL لازم تدخل AXIS";
//     }
//     if (axis !== null && cyl === null) {
//       newErrors["right_cylinder"] = "لو أدخلت AXIS لازم تدخل CYL";
//     }

//     // تحقق CYL
//     if (cyl !== null) {
//       const formatted = validator.validateCYL(cyl);
//       if (formatted) {
//         setValue("right_cylinder", formatted);
//       } else {
//         newErrors["right_cylinder"] =
//           "CYL غير صالح (من مضاعفات 0.25 وبحد ±10)";
//       }
//     }

//     // تحقق AXIS
//     if (axis !== null) {
//       if (!(axis >= 0 && axis <= 180)) {
//         newErrors["right_axis"] = "AXIS لازم يكون بين 0 و 180";
//       }
//     }

//     setFieldErrors(newErrors);
//   }, [values, setValue]);


//   const handleFormat = (field: string, value: string) => {
//     const num = parseFloat(value);
//     let formatted: string | null = null;

//     if (field.includes("sphere")) {
//       formatted = validator.validateSPH(num);
//     } else if (field.includes("cylinder")) {
//       formatted = validator.validateCYL(num);
//     } else if (field.includes("add")) {
//       formatted = validator.validateADD(num);
//     }else if (field.includes("sg")) {
//       formatted = validator.checkSG(num);
//     }else if (field.includes("a_v")) {
//       formatted = validator.checkVertexDistance(num);
//     }

//     if (formatted) {
//       // ✅ قيمة صحيحة → نخزنها بالفورم
//       setValue(field, formatted);
//       setFieldErrors(prev => ({ ...prev, [field]: false }));
//     } else {
//       // ❌ قيمة خاطئة → نعلم الخلية بالغلط
//       setFieldErrors(prev => ({ ...prev, [field]: true }));
//     }
//   };

//   const onSubmit = (data: any) => {
//     console.log("onSubmit", data);
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" >
//       {/* 👁 Right Eye */}
//         {/* mian continear */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-1 ">
//           {/*first block */}
//           <div className="grid grid-cols-1 gap-1 ">
//             {/* label row */}
//             <div className="grid grid-cols-5 gap-1 ">
//               <label className="w-1 flex items-center justify-center"></label>
//               <label>SPH</label>
//               <label>CYL</label>
//               <label>AXIS</label>
//               <label>ADD</label>
//             </div>
//             {/* right row */}
//             <div className="grid grid-cols-5 gap-1">
//               {/* Eye R */}
//               <div className="flex items-center justify-center">
//                 <h3 className="text-lg font-semibold text-gray-900 ">R</h3>
//               </div>
//               {/* SPH r */}
//               <div>
//                 <input
//                   type="text"
//                   {...register("right_sphere")}
//                   onBlur={(e) => handleFormat("right_sphere", e.target.value)}
     
//                   className={`input-text 
//                     ${fieldErrors["right_sphere"]
//                       ? {errorClass} // ❌ لو غلط
//                       : {successClass} // ✅ عادي
//                     }`}
//                   placeholder="-00.00"
//                 />
//                 {fieldErrors["right_sphere"] && (
//                   <p className="text-error">
//                     القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                   </p>
//                 )}
//                 {/* {errors.right_sphere && <p className="error">{errors.right_sphere.message}</p>} */}
//               </div>
//               {/* CYL r */}
//               <div>
//                 <input
//                   type="text"
//                   {...register("right_cylinder")}
//                   onBlur={(e) => handleFormat("right_cylinder", e.target.value)}
//                   className="input-text"
//                   placeholder="-00.25"
//                 />
//                 {fieldErrors["right_cylinder"] && (
//                   <p className="text-error">
//                     القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                   </p>
//                 )}
//               </div>
//               {/* AXIS r */}
//               <div>
//                 <input
//                   type="number"
//                   {...register("right_axis")}
//                   onBlur={(e) => handleFormat("right_axis", e.target.value)}
//                   className="input-text"
//                   placeholder="0:180"
//                 />
//                 {fieldErrors["right_axis"] && (
//                   <p className="text-error">
//                     القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                   </p>
//                 )}
//               </div>
//               {/* ADD r */}
//               <div>
//                 <input
//                   type="text"
//                   {...register("right_reading_add")}
//                   onBlur={(e) => handleFormat("right_reading_add", e.target.value)}
//                   className="input-text"
//                   placeholder="+1.00"
//                 />
//                 {errors.right_reading_add && <p className="error">{errors.right_reading_add.message}</p>}
//               </div>
//             </div>

//             {/* left row */}
//             <div className="grid grid-cols-5 gap-1">
//               {/* Eye L */}
//               <div className="flex items-center justify-center">
//               <h3 className="text-lg font-semibold text-gray-900">L</h3>
//               </div>
//               {/* SPH l */}
//               <div>
//                 <input
//                   type="text"
//                   {...register("left_sphere")}
//                   onBlur={(e) => handleFormat("left_sphere", e.target.value)}
//                   className="input-text"
//                   placeholder="+0.00"
//                 />
//                 {errors.left_sphere && <p className="error">{errors.left_sphere.message}</p>}
//               </div>
//               {/* CYL l */}
//               <div>
//                 <input
//                   type="text"
//                   {...register("left_cylinder")}
//                   onBlur={(e) => handleFormat("left_cylinder", e.target.value)}
//                   className="input-text"
//                   placeholder="-0.25"
//                 />
//                 {fieldErrors["left_cylinder"] && (
//                   <p className="text-error">
//                     القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                   </p>
//                 )}
//               </div>

//               {/* AXIS l */}
//               <div>
//                 <input
//                   type="number"
//                   {...register("left_axis")}
//                   onBlur={(e) => handleFormat("left_axis", e.target.value)}
//                   className="input-text"
//                   placeholder="0-180"
//                 />
//                 {fieldErrors["left_axis"] && (
//                   <p className="text-error">
//                     القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                   </p>
//                 )}
//               </div>

//               {/* ADD l */}
//               <div>
//                 <input
//                   type="text"
//                   {...register("left_reading_add")}
//                   onBlur={(e) => handleFormat("left_reading_add", e.target.value)}
//                   className="input-text"
//                   placeholder="+1.00"
//                 />
//                 {fieldErrors["left_reading_add"] && (
//                   <p className="text-error">
//                     القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//           {/*second block */}
          
//           <div className="grid grid-cols-1 gap-1 ">
//             {/* label row */}
//             <div className="grid grid-cols-5 gap-1 ">
//               <label className="block md:hidden"></label>
//               <label>PD</label>
//               <label>SG</label>
//               <label>VA</label>
//             </div>
//             {/* right row */}
//             <div className="grid grid-cols-5 gap-1 ">
//               {/* Eye R */}
//               <div className="flex  items-center justify-center md:hidden ">
//                 <h3 className="text-lg font-semibold text-gray-900 ">R</h3>
//               </div>
//               {/* PD r */}
//               <div>
//                 <input
//                   type="number"
//                   {...register("right_pupillary_distance")}
//                   className="input-text"
//                   placeholder="64"
//                 />
//                 {fieldErrors["right_pupillary_distance"] && (
//                   <p className="text-error">
//                     القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                   </p>
//                 )}
//               </div>
//               {/* SG r */}
//               <div >
//                 <input
//                   id="sigmant_right"
//                   type="number"
//                   {...register("sigmant_right")}
//                   className="input-text"
//                   step="0.25"
//                   min="8"
//                   max="55"
//                   placeholder="8:55"
//                 />
//                 {fieldErrors["sigmant_right"] && (
//                   <p className="text-error">
//                     القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                   </p>
//                 )}
//               </div>
//               {/* AV r */}
//               <div>
//                 <input
//                   id="a_v_right"
//                   type="text"
//                   {...register("a_v_right")}
//                   className="input-text"
//                   placeholder="A v right..."

//                 />

//                 {fieldErrors["a_v_right"] && (
//                   <p className="text-error">
//                     القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                   </p>
//                 )}
//               </div>
//             </div>
//             {/* left row */}
//             <div className="grid grid-cols-5 gap-1 "> 
//               {/* PD l */}
//               {/* Eye L */}
//               <div className="flex  items-center justify-center md:hidden">
//                 <h3 className="text-lg font-semibold text-gray-900">L</h3>
//               </div>
//             <div>
//               <input
//                 type="number"
//                 {...register("left_pupillary_distance")}
//                 className="input-text"
//                 placeholder="64"
//               />
//               {fieldErrors["left_pupillary_distance"] && (
//                 <p className="text-error">
//                   القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                 </p>
//               )}
//             </div>  
//             {/* SG l */}
//             <div>
//               <input
//                 type="text"
//                 {...register("sigmant_left")}
//                 className="input-text"
//                 placeholder="8:55"
//               />
//               {fieldErrors["sigmant_left"] && (
//                 <p className="text-error">
//                   القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                 </p>
//               )}
//             </div>
//             {/* AV l */}
//             <div>
//               <input
//                 type="text"
//                 {...register("a_v_left")}
//                 className="input-text"
//                 placeholder="A v left..."
//               />
//               {fieldErrors["a_v_left"] && (
//                 <p className="text-error">
//                   القيمة غير صالحة (يجب أن تكون من مضاعفات 0.25)
//                 </p>
//               )}
//             </div>
//             </div>
//           </div>
//           {/* { errors } */}
//         {/* <p>{JSON.stringify(errors)}</p> */}
//         </div>


//   {/* باقي الحقول */ }
//   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
//       <div>
//         <label>Doctor Name</label>
//         <input {...register("doctor_name")} className="input-text" placeholder="Dr. Ahmed" />
//         {errors.doctor_name && <p className="error">{errors.doctor_name.message}</p>}
//       </div>

//       <div>
//         <label>Prescription Date *</label>
//         <input type="date" {...register("prescription_date")} className="input-text" />
//         {errors.prescription_date && <p className="error">{errors.prescription_date.message}</p>}
//       </div>
      
//       <div>
//         <label>Customer *</label>
//         <input type="number" {...register("customer")} className="input-text" />
//         {errors.customer && <p className="error">{errors.customer.message}</p>}
//       </div>
//       <div>
//         <label>Notes</label>
//         <textarea {...register("notes")} className="input-text" rows={1} placeholder="Notes..." />
//       </div>
//       </div>


//   {/* Actions */ }
//   <div className="flex gap-3 pt-4">
//     <button
//       type="submit"
//       disabled={isSubmitting}
//       className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
//     >
//       {isSubmitting ? "Saving..." : "Save"}
//     </button>
//     <button
//       type="button"
//       onClick={() => reset()}
//       className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md"
//     >
//       Cancel
//     </button>
//   </div>
//     </form >
//   );
// }

// /* 🔹 CSS Helpers بالـ Tailwind */
// const inputClass =
//   "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent";

// const errorClass =
//   "text-red-500 text-sm mt-1";
// const successClass =
//   "text-green-500 text-sm mt-1";



"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { EyeTestValidator } from "@/lib/utils/EyeTestValidator";

const validator = new EyeTestValidator();

// -------------------- ZOD Schema --------------------
const PrescriptionSchema = z.object({
  right_sphere: z
    .number()
    .nullable()
    .refine(val => val === null || validator.validateSPH(val) !== null, {
      message: "SPH غير صالح (مضاعفات 0.25 وأقل من ±60)",
    }),
  right_cylinder: z
    .number()
    .nullable()
    .refine(val => val === null || validator.validateCYL(val) !== null, {
      message: "CYL غير صالح (مضاعفات 0.25 وأقل من ±10)",
    }),
  right_axis: z
    .number()
    .nullable()
    .refine(val => val === null || validator.validateAxis(val) !== null, {
      message: "AXIS يجب أن يكون بين 0 و 180",
    }),
  right_reading_add: z
    .number()
    .nullable()
    .refine(val => val === null || validator.validateADD(val) !== null, {
      message: "ADD غير صالح (0.25 - 6.00)",
    }),
  left_sphere: z
    .number()
    .nullable()
    .refine(val => val === null || validator.validateSPH(val) !== null, {
      message: "SPH غير صالح (مضاعفات 0.25 وأقل من ±60)",
    }),
  left_cylinder: z
    .number()
    .nullable()
    .refine(val => val === null || validator.validateCYL(val) !== null, {
      message: "CYL غير صالح (مضاعفات 0.25 وأقل من ±10)",
    }),
  left_axis: z
    .number()
    .nullable()
    .refine(val => val === null || validator.validateAxis(val) !== null, {
      message: "AXIS يجب أن يكون بين 0 و 180",
    }),
  left_reading_add: z
    .number()
    .nullable()
    .refine(val => val === null || validator.validateADD(val) !== null, {
      message: "ADD غير صالح (0.25 - 6.00)",
    }),
  right_pupillary_distance: z.number().nullable(),
  left_pupillary_distance: z.number().nullable(),
  sigmant_right: z.number().nullable(),
  sigmant_left: z.number().nullable(),
  a_v_right: z.number().nullable(),
  a_v_left: z.number().nullable(),
  doctor_name: z.string().max(200).optional(),
  prescription_date: z.string(),
  notes: z.string().optional(),
  customer: z.number().int(),
});

// -------------------- Component --------------------
type PrescriptionFormData = z.infer<typeof PrescriptionSchema>;

export default function PrescriptionForm() {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(PrescriptionSchema),
  });

  // -------------------- Formater --------------------
  const handleFormat = (field: keyof PrescriptionFormData, value: any) => {
    if (value === null || value === "") return;

    const num = parseFloat(value);
    let formatted: string | null = null;

    if (field.toString().includes("sphere")) formatted = validator.validateSPH(num);
    else if (field.toString().includes("cylinder")) formatted = validator.validateCYL(num);
    else if (field.toString().includes("add")) formatted = validator.validateADD(num);
    else if (field.toString().includes("axis")) formatted = validator.validateAxis(num);

    if (formatted) setValue(field, parseFloat(formatted));
    // لو الخطأ، نخلي الـ input زي ما هو و zod يظهر رسالة
  };

  const onSubmit = (data: PrescriptionFormData) => {
    console.log("Submitted Data:", data);
    toast.success("تم حفظ البيانات بنجاح");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* -------------------- Right Eye -------------------- */}
        <div className="grid grid-cols-5 gap-1">
          <div className="flex items-center justify-center">
            <h3>R</h3>
          </div>
          {["sphere", "cylinder", "axis", "reading_add"].map((f) => {
            const field = `right_${f}` as keyof PrescriptionFormData;
            return (
              <div key={field}>
                <input
                  type="text"
                  {...register(field)}
                  onBlur={(e) => handleFormat(field, e.target.value)}
                  className={`w-full px-2 py-1 border rounded ${
                    errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder={f.toUpperCase()}
                />
                {errors[field] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field]?.message}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* -------------------- Left Eye -------------------- */}
        <div className="grid grid-cols-5 gap-1">
          <div className="flex items-center justify-center">
            <h3>L</h3>
          </div>
          {["sphere", "cylinder", "axis", "reading_add"].map((f) => {
            const field = `left_${f}` as keyof PrescriptionFormData;
            return (
              <div key={field}>
                <input
                  type="text"
                  {...register(field)}
                  onBlur={(e) => handleFormat(field, e.target.value)}
                  className={`w-full px-2 py-1 border rounded ${
                    errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder={f.toUpperCase()}
                />
                {errors[field] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field]?.message}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* -------------------- Other Fields -------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label>Doctor Name</label>
          <input
            {...register("doctor_name")}
            className="input-text w-full border px-2 py-1 rounded"
          />
          {errors.doctor_name && <p className="text-red-500 text-xs">{errors.doctor_name.message}</p>}
        </div>

        <div>
          <label>Prescription Date *</label>
          <input
            type="date"
            {...register("prescription_date")}
            className="input-text w-full border px-2 py-1 rounded"
          />
          {errors.prescription_date && (
            <p className="text-red-500 text-xs">{errors.prescription_date.message}</p>
          )}
        </div>

        <div>
          <label>Customer *</label>
          <input
            type="number"
            {...register("customer")}
            className="input-text w-full border px-2 py-1 rounded"
          />
          {errors.customer && <p className="text-red-500 text-xs">{errors.customer.message}</p>}
        </div>

        <div>
          <label>Notes</label>
          <textarea
            {...register("notes")}
            className="w-full border px-2 py-1 rounded"
            rows={1}
          />
        </div>
      </div>

      {/* -------------------- Actions -------------------- */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()} // reset form
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
