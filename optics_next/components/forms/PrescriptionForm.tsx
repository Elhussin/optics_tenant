// // components/forms/PrescriptionRecordRequestForm.tsx
// "use client";
// import React from 'react';
// import { schemas } from '@/lib/api/zodClient';
// import { toast } from 'sonner';
// import { z } from 'zod';
// import { formRequestProps } from "@/types";
// import { useFormRequest } from "@/lib/hooks/useFormRequest";
// const schema = schemas.PrescriptionRecordRequest;
// // export default function PrescriptionForm(props: formRequestProps): JSX.Element {
// export default function PrescriptionForm(props: formRequestProps) {

//   const {
//     submitText = "create",
//     alias,
//     mode = "create",
//     className = ""
//   } = props;

//   const { 
//     register, 
//     handleSubmit, 
//     formState: { errors, isSubmitting }, 
//     submitForm,
//     reset
//   } = useFormRequest({ alias: alias ?? "prescriptions_prescription_create" })
//   // (schema,{ mode, id, defaultValues, apiOptions: { endpoint: 'prescriptions', onSuccess: (res) => onSuccess?.(res), }});


//   const onSubmit = async (data: z.infer<typeof schema>) => {
//     try {
//       const result = await submitForm(data);
//       // onSuccess?.(result);
//       if (mode === 'create') {
//         reset();
//       }
//     } catch (error: any) {
//       if (error.response?.data) {
//         const errorData = error.response.data;
//         if (typeof errorData === 'object') {
//           // عرض جميع رسائل الخطأ
//           Object.entries(errorData).forEach(([field, messages]) => {
//             if (Array.isArray(messages)) {
//               messages.forEach(message => toast.error(`${field}: ${message}`));
//             } else {
//               toast.error(`${field}: ${messages}`);
//             }
//           });
//         } else {
//           toast.error(errorData);
//         }
//       // } else {
//       //   toast.error(handleErrorStatus(error));
//       }
//       console.error('Form submission error:', error);
//     }
//   };

//   return (
//     <div className={`${className}`}>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


//     <div className="flex flex-row space-x-4">
//     <h3 className="text-lg font-medium text-gray-900">R</h3>
//      <div className="mb-4">

//     <label htmlFor="right_sphere" className="block text-sm font-medium text-gray-700 mb-1">
//       SPH
//     </label>
//     <input 
//       id="right_sphere" 
//       type="text" 
//       {...register("right_sphere")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Right sphere..."

//     />

//     {errors.right_sphere && <p className="text-red-500 text-sm mt-1">{errors.right_sphere?.message}</p>}
//       </div>

//       <div className="mb-4">

//         <label htmlFor="right_cylinder" className="block text-sm font-medium text-gray-700 mb-1">
//           CYL
//         </label>
//         <input 
//           id="right_cylinder" 
//           type="text" 
//           {...register("right_cylinder")} 
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//           placeholder="Right cylinder..."

//         />

//         {errors.right_cylinder && <p className="text-red-500 text-sm mt-1">{errors.right_cylinder?.message}</p>}
//       </div>

//       <div className="mb-4">

//         <label htmlFor="right_axis" className="block text-sm font-medium text-gray-700 mb-1">
//           AXI
//         </label>
//         <input 
//           id="right_axis" 
//           type="number" 
//           {...register("right_axis")} 
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//           placeholder="Right axis..."

//         />

//         {errors.right_axis && <p className="text-red-500 text-sm mt-1">{errors.right_axis?.message}</p>}
//       </div>
//       <div className="mb-4">

//     <label htmlFor="right_reading_add" className="block text-sm font-medium text-gray-700 mb-1">
//       ADD
//     </label>
//     <input 
//       id="right_reading_add" 
//       type="text" 
//       {...register("right_reading_add")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Right reading add..."

//     />

//     {errors.right_reading_add && <p className="text-red-500 text-sm mt-1">{errors.right_reading_add?.message}</p>}
//   </div>


//   <div className="mb-4">

//     <label htmlFor="right_pupillary_distance" className="block text-sm font-medium text-gray-700 mb-1">
//       PD
//     </label>
//     <input 
//       id="right_pupillary_distance" 
//       type="number" 
//       {...register("right_pupillary_distance")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Right pupillary distance..."

//     />

//     {errors.right_pupillary_distance && <p className="text-red-500 text-sm mt-1">{errors.right_pupillary_distance?.message}</p>}
//   </div>


//   <div className="mb-4">

//     <label htmlFor="sigmant_right" className="block text-sm font-medium text-gray-700 mb-1">
//       SG
//     </label>
//     <input 
//       id="sigmant_right" 
//       type="text" 
//       {...register("sigmant_right")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Sigmant right..."

//     />

//     {errors.sigmant_right && <p className="text-red-500 text-sm mt-1">{errors.sigmant_right?.message}</p>}
//   </div>


// <div className="mb-4">

//   <label htmlFor="a_v_right" className="block text-sm font-medium text-gray-700 mb-1">
//     AV
//   </label>
//   <input 
//     id="a_v_right" 
//     type="text" 
//     {...register("a_v_right")} 
//     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//     placeholder="A v right..."

//   />

//   {errors.a_v_right && <p className="text-red-500 text-sm mt-1">{errors.a_v_right?.message}</p>}
// </div>

//     </div>

//   <div className="flex flex-row space-x-4">
//   <h3 className="text-lg font-medium text-gray-900">L</h3>
//   <div className="mb-4">

//     <label htmlFor="left_sphere" className="block text-sm font-medium text-gray-700 mb-1">
//       SPH
//     </label>
//     <input 
//       id="left_sphere" 
//       type="text" 
//       {...register("left_sphere")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Left sphere..."

//     />

//     {errors.left_sphere && <p className="text-red-500 text-sm mt-1">{errors.left_sphere?.message}</p>}
//   </div>

//   <div className="mb-4">

//     <label htmlFor="left_cylinder" className="block text-sm font-medium text-gray-700 mb-1">
//       CYL
//     </label>
//     <input 
//       id="left_cylinder" 
//       type="text" 
//       {...register("left_cylinder")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Left cylinder..."

//     />

//     {errors.left_cylinder && <p className="text-red-500 text-sm mt-1">{errors.left_cylinder?.message}</p>}
//   </div>

//   <div className="mb-4">

//     <label htmlFor="left_axis" className="block text-sm font-medium text-gray-700 mb-1">
//       AXI
//     </label>
//     <input 
//       id="left_axis" 
//       type="number" 
//       {...register("left_axis")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Left axis..."

//     />

//     {errors.left_axis && <p className="text-red-500 text-sm mt-1">{errors.left_axis?.message}</p>}
//   </div>
//   <div className="mb-4">

//     <label htmlFor="left_reading_add" className="block text-sm font-medium text-gray-700 mb-1">
//       ADD
//     </label>
//     <input 
//       id="left_reading_add" 
//       type="text" 
//       {...register("left_reading_add")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Left reading add..."

//     />

//     {errors.left_reading_add && <p className="text-red-500 text-sm mt-1">{errors.left_reading_add?.message}</p>}
//   </div>
//   <div className="mb-4">

//     <label htmlFor="left_pupillary_distance" className="block text-sm font-medium text-gray-700 mb-1">
//       P.D
//     </label>
//     <input 
//       id="left_pupillary_distance" 
//       type="number" 
//       {...register("left_pupillary_distance")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Left pupillary distance..."

//     />

//     {errors.left_pupillary_distance && <p className="text-red-500 text-sm mt-1">{errors.left_pupillary_distance?.message}</p>}
//   </div>

//   <div className="mb-4">

//     <label htmlFor="sigmant_left" className="block text-sm font-medium text-gray-700 mb-1">
//     SG
//       </label>
//     <input 
//       id="sigmant_left" 
//       type="text" 
//       {...register("sigmant_left")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Sigmant left..."

//     />

//     {errors.sigmant_left && <p className="text-red-500 text-sm mt-1">{errors.sigmant_left?.message}</p>}
//   </div>
//   <div className="mb-4">

//     <label htmlFor="a_v_left" className="block text-sm font-medium text-gray-700 mb-1">
//       A v
//     </label>
//     <input 
//       id="a_v_left" 
//       type="text" 
//       {...register("a_v_left")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="A v left..."

//     />

//     {errors.a_v_left && <p className="text-red-500 text-sm mt-1">{errors.a_v_left?.message}</p>}
//   </div>


//   </div>



//   <div className="mb-4">

//     <label htmlFor="doctor_name" className="block text-sm font-medium text-gray-700 mb-1">
//       Doctor name
//     </label>
//     <input 
//       id="doctor_name" 
//       {...register("doctor_name")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Doctor name..."
//     />

//     {errors.doctor_name && <p className="text-red-500 text-sm mt-1">{errors.doctor_name?.message}</p>}
//   </div>

//   <div className="mb-4">

//     <label htmlFor="prescription_date" className="block text-sm font-medium text-gray-700 mb-1">
//       Prescription date *
//     </label>
//     <input 
//       id="prescription_date" 
//       type="date" 
//       {...register("prescription_date")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Prescription date..."

//     />

//     {errors.prescription_date && <p className="text-red-500 text-sm mt-1">{errors.prescription_date?.message}</p>}
//   </div>

//   <div className="mb-4">

//     <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
//       Notes
//     </label>
//     <textarea 
//       id="notes" 
//       {...register("notes")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       rows={3}
//       placeholder="Notes..."
//     />

//     {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes?.message}</p>}
//   </div>

//   <div className="mb-4">

//     <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
//       Customer *
//     </label>
//     <input 
//       id="customer" 
//       type="number" 
//       {...register("customer")} 
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//       placeholder="Customer..."

//     />

//     {errors.customer && <p className="text-red-500 text-sm mt-1">{errors.customer?.message}</p>}
//   </div>

//         <div className="flex gap-3 pt-4">
//           <button 
//             type="submit" 
//             disabled={isSubmitting}
//             className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
//             // disabled={mode === 'edit' && fieldName === 'email'||mode === 'edit' && fieldName === 'username'||mode === 'edit' && fieldName === 'password'}

//             >
//             {isSubmitting ? 'Saving...' : submitText}
//           </button>
//             <div className="mb-4">
//     <div className="flex items-center space-x-2">

//       <input 
//         id="is_active" 
//         type="checkbox" 
//         {...register("is_active")} 
//         className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
//       />
//       <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">Is active</label>
//     </div>
//     {errors.is_active && <p className="text-red-500 text-sm mt-1">{errors.is_active?.message}</p>}
//   </div>

//   <div className="mb-4">
//     <div className="flex items-center space-x-2">

//       <input 
//         id="is_deleted" 
//         type="checkbox" 
//         {...register("is_deleted")} 
//         className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
//       />
//       <label htmlFor="is_deleted" className="block text-sm font-medium text-gray-700 mb-1">Is deleted</label>
//     </div>
//     {errors.is_deleted && <p className="text-red-500 text-sm mt-1">{errors.is_deleted?.message}</p>}
//   </div>



//             <button 
//               type="button" 
//               // onClick={onCancel}
//               className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors"
//             >
//               Cancel
//             </button>
//         </div>
//       </form>
//     </div>
//   );
// }


"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { PrescriptionRecordRequest } from "@/lib/api/zodClient"; // schema اللي عندك
import { EyeTestValidator } from "@/lib/utils/EyeTestValidator"; // الكلاس اللي كتبناه

type PrescriptionFormData = z.infer<typeof PrescriptionRecordRequest>;

export default function PrescriptionForm() {
  const validator = new EyeTestValidator();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(PrescriptionRecordRequest),
    defaultValues: {
      right_sphere: null,
      left_sphere: null,
      prescription_date: new Date().toISOString().split("T")[0],
      customer: 0,
    },
  });

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      console.log("📤 Submitting data:", data);
      toast.success("Prescription saved successfully!");
      reset();
    } catch (error) {
      console.error("❌ Form submission error:", error);
      toast.error("Error while saving prescription.");
    }
  };

  // دالة صغيرة لإعادة التنسيق بعد التحقق
  const handleFormat = (field: keyof PrescriptionFormData, value: any) => {
    let formatted: string | null = null;

    if ((field as string).includes("sphere") || (field as string).includes("cylinder")) {
      formatted = validator.formatEyeTestPower(value) || null;
    } else if ((field as string).includes("axis")) {
      formatted = validator.checkAxis(Number(value)) ? value.toString() : null;
    } else if ((field as string).includes("reading_add")) {
      formatted = validator.checkAdd(Number(value)) ? value.toString() : null;
    }

    if (formatted !== null) {
      setValue(field, formatted, { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 👁 Right Eye */}
        {/* mian continear */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 ">
          {/*first block */}
          <div className="grid grid-cols-1 gap-1 ">
            {/* label row */}
            <div className="grid grid-cols-5 gap-1 ">
              <label className="w-1 flex items-center justify-center"></label>
              <label>SPH</label>
              <label>CYL</label>
              <label>AXIS</label>
              <label>ADD</label>
            </div>
            {/* right row */}
            <div className="grid grid-cols-5 gap-1">
              {/* Eye R */}
              <div className="flex items-center justify-center">
                <h3 className="text-lg font-semibold text-gray-900 ">R</h3>
              </div>
              {/* SPH r */}
              <div>
                <input
                  type="text"
                  {...register("right_sphere")}
                  onBlur={(e) => handleFormat("right_sphere", e.target.value)}
                  className="input-text"
                  placeholder="-00.00"
                />
                {errors.right_sphere && <p className="error">{errors.right_sphere.message}</p>}
              </div>
              {/* CYL r */}
              <div>
                <input
                  type="text"
                  {...register("right_cylinder")}
                  onBlur={(e) => handleFormat("right_cylinder", e.target.value)}
                  className="input-text"
                  placeholder="-00.25"
                />
                {errors.right_cylinder && <p className="error">{errors.right_cylinder.message}</p>}
              </div>
              {/* AXIS r */}
              <div>
                <input
                  type="number"
                  {...register("right_axis")}
                  onBlur={(e) => handleFormat("right_axis", e.target.value)}
                  className="input-text"
                  placeholder="0:180"
                />
                {errors.right_axis && <p className="error">{errors.right_axis.message}</p>}
              </div>
              {/* ADD r */}
              <div>
                <input
                  type="text"
                  {...register("right_reading_add")}
                  onBlur={(e) => handleFormat("right_reading_add", e.target.value)}
                  className="input-text"
                  placeholder="+1.00"
                />
                {errors.right_reading_add && <p className="error">{errors.right_reading_add.message}</p>}
              </div>
            </div>

            {/* left row */}
            <div className="grid grid-cols-5 gap-1">
              {/* Eye L */}
              <div className="flex items-center justify-center">
              <h3 className="text-lg font-semibold text-gray-900">L</h3>
              </div>
              {/* SPH l */}
              <div>
                <input
                  type="text"
                  {...register("left_sphere")}
                  onBlur={(e) => handleFormat("left_sphere", e.target.value)}
                  className="input-text"
                  placeholder="+0.00"
                />
                {errors.left_sphere && <p className="error">{errors.left_sphere.message}</p>}
              </div>
              {/* CYL l */}
              <div>
                <input
                  type="text"
                  {...register("left_cylinder")}
                  onBlur={(e) => handleFormat("left_cylinder", e.target.value)}
                  className="input-text"
                  placeholder="-0.25"
                />
                {errors.left_cylinder && <p className="error">{errors.left_cylinder.message}</p>}
              </div>

              {/* AXIS l */}
              <div>
                <input
                  type="number"
                  {...register("left_axis")}
                  onBlur={(e) => handleFormat("left_axis", e.target.value)}
                  className="input-text"
                  placeholder="0-180"
                />
                {errors.left_axis && <p className="error">{errors.left_axis.message}</p>}
              </div>

              {/* ADD l */}
              <div>
                <input
                  type="text"
                  {...register("left_reading_add")}
                  onBlur={(e) => handleFormat("left_reading_add", e.target.value)}
                  className="input-text"
                  placeholder="+1.00"
                />
                {errors.left_reading_add && <p className="error">{errors.left_reading_add.message}</p>}
              </div>
            </div>
          </div>
          {/*second block */}
          
          <div className="grid grid-cols-1 gap-1 ">
            {/* label row */}
            <div className="grid grid-cols-5 gap-1 ">
              <label className="block md:hidden"></label>
              <label>PD</label>
              <label>SG</label>
              <label>VA</label>
            </div>
            {/* right row */}
            <div className="grid grid-cols-5 gap-1 ">
              {/* Eye R */}
              <div className="flex  items-center justify-center md:hidden ">
                <h3 className="text-lg font-semibold text-gray-900 ">R</h3>
              </div>
              {/* PD r */}
              <div>
                <input
                  type="number"
                  {...register("right_pupillary_distance")}
                  className="input-text"
                  placeholder="64"
                />
                {errors.right_pupillary_distance && (
                  <p className="error">{errors.right_pupillary_distance.message}</p>
                )}
              </div>
              {/* SG r */}
              <div >
                <input
                  id="sigmant_right"
                  type="number"
                  {...register("sigmant_right")}
                  className="input-text"
                  step="0.25"
                  min="8"
                  max="55"
                  placeholder="8:55"
                />
                {errors.sigmant_right && <p className="error">{errors.sigmant_right.message}</p>}
              </div>
              {/* AV r */}
              <div>
                <input
                  id="a_v_right"
                  type="text"
                  {...register("a_v_right")}
                  className="input-text"
                  placeholder="A v right..."

                />

                {errors.a_v_right && <p className="error">{errors.a_v_right?.message}</p>}
              </div>
            </div>
            {/* left row */}
            <div className="grid grid-cols-5 gap-1 "> 
              {/* PD l */}
              {/* Eye L */}
              <div className="flex  items-center justify-center md:hidden">
                <h3 className="text-lg font-semibold text-gray-900">L</h3>
              </div>
            <div>
              <input
                type="number"
                {...register("left_pupillary_distance")}
                className="input-text"
                placeholder="64"
              />
              {errors.left_pupillary_distance && (
                <p className="error">{errors.left_pupillary_distance.message}</p>
              )}
            </div>  
            {/* SG l */}
            <div>
              <input
                type="text"
                {...register("sigmant_left")}
                className="input-text"
                placeholder="8:55"
              />
              {errors.sigmant_left && <p className="error">{errors.sigmant_left.message}</p>}
            </div>
            {/* AV l */}
            <div>
              <input
                type="text"
                {...register("a_v_left")}
                className="input-text"
                placeholder="A v left..."
              />
              {errors.a_v_left && <p className="error">{errors.a_v_left.message}</p>}
            </div>
            </div>
          </div>
        </div>


  {/* باقي الحقول */ }
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
      <div>
        <label>Doctor Name</label>
        <input {...register("doctor_name")} className="input-text" placeholder="Dr. Ahmed" />
        {errors.doctor_name && <p className="error">{errors.doctor_name.message}</p>}
      </div>

      <div>
        <label>Prescription Date *</label>
        <input type="date" {...register("prescription_date")} className="input-text" />
        {errors.prescription_date && <p className="error">{errors.prescription_date.message}</p>}
      </div>
      
      <div>
        <label>Customer *</label>
        <input type="number" {...register("customer")} className="input-text" />
        {errors.customer && <p className="error">{errors.customer.message}</p>}
      </div>
      <div>
        <label>Notes</label>
        <textarea {...register("notes")} className="input-text" rows={1} placeholder="Notes..." />
      </div>
      </div>


  {/* Actions */ }
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
      onClick={() => reset()}
      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md"
    >
      Cancel
    </button>
  </div>
    </form >
  );
}

/* 🔹 CSS Helpers بالـ Tailwind */
const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent";

