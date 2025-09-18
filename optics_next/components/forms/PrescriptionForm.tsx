"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { PrescriptionRecordRequest } from "@/lib/api/zodClient"; // schema اللي عندك
import { EyeTestValidator } from "@/lib/utils/EyeTestValidator"; // الكلاس اللي كتبناه
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { formRequestProps } from "@/types";
import { useState } from "react";
import { useEffect } from "react";
import { safeToast } from "@/lib/utils/toastService";
import Modal from "@/components/view/Modal";
import { ActionButton } from "@/components/ui/buttons";
import { CirclePlus } from "lucide-react";

type PrescriptionFormData = z.infer<typeof PrescriptionRecordRequest>;
const validator = new EyeTestValidator();
const validatorMap: Record<string, (n: number) => number | string | null> = {
  sphere: (n: number) => validator.validateSPH(n),
  cylinder: (n: number) => validator.validateCYL(n),
  axis: (n: number) => validator.validateAxis(n),
  add: (n: number) => validator.validateADD(n),
  pupillary_distance: (n: number) => validator.validatePD(n),
  sigmant: (n: number) => validator.validateSG(n),
};


export default function PrescriptionForm(props: formRequestProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const { alias, title, message, submitText } = props
  const [showModal, setShowModal] = useState(false);
  const fetchCustomers = useFormRequest({ alias: "crm_customers_list" });
  const { register, handleSubmit, setValue, watch, reset, submitForm, errors, isSubmitting } = useFormRequest({ alias: alias })


  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchCustomers.submitForm();
      console.log(result)
      setCustomers(result.data);
    };
    fetchData();

  }, [showModal]);

  const handleFormat = (field: string, value: string) => {
    const num = parseFloat(value);

    const validatorKey = Object.keys(validatorMap).find((k) =>
      field.includes(k)
    );

    if (!validatorKey) return;

    const formatted = validatorMap[validatorKey](num);

    const applyValue = (targetField: string, val: string | number) => {
      setValue(targetField, val);
      setFieldErrors((prev) => ({ ...prev, [targetField]: false }));
    };


    if (formatted !== null) {
      const mirrorFields: Record<string, string> = {
        right_pupillary_distance: "left_pupillary_distance",
        right_reading_add: "left_reading_add",
        sigmant_right: "sigmant_left",
      };

      if (field in mirrorFields) {
        let val = formatted as number;

        if (field === "right_pupillary_distance" && val >= 45) {
          val = val / 2;
        }
        applyValue(field, val);
        applyValue(mirrorFields[field], val);
      } else {
        applyValue(field, formatted);
      }
    } else {
      setFieldErrors((prev) => ({ ...prev, [field]: true }));
    }
  };

  const onSubmit = async (data: any) => {
    const right = validator.validatePrescription({
      sphere: data.right_sphere,
      cylinder: data.right_cylinder,
      axis: data.right_axis,
      add: data.right_reading_add,
      pd: data.right_pupillary_distance,
      sg: data.sigmant_right,
    });

    if (!right.valid) {
      right.errors.forEach(err => safeToast("Right eye: " + err, { type: "error" }));
      return;
    }

    const transformedRight = validator.transformSphCylAxis(
      parseFloat(data.right_sphere),
      parseFloat(data.right_cylinder),
      parseFloat(data.right_axis),

    );

    if (transformedRight) {
      data.right_sphere = transformedRight.sph;
      data.right_cylinder = transformedRight.cyl;
      data.right_axis = transformedRight.axis;
      setValue("right_sphere", transformedRight.sph);
      setValue("right_cylinder", transformedRight.cyl);
      setValue("right_axis", transformedRight.axis);
    }

    const left = validator.validatePrescription({
      sphere: data.left_sphere,
      cylinder: data.left_cylinder,
      axis: data.left_axis,
      add: data.left_reading_add,
      pd: data.left_pupillary_distance,
      sg: data.sigmant_left,
    });

    if (!left.valid) {
      left.errors.forEach(err => safeToast("Left eye: " + err, { type: "error" }));
      return;
    }

    const transformedLeft = validator.transformSphCylAxis(
      parseFloat(data.left_sphere),
      parseFloat(data.left_cylinder),
      parseFloat(data.left_axis)

    );

    if (transformedLeft) {
      data.left_sphere = transformedLeft.sph;
      data.left_cylinder = transformedLeft.cyl;
      data.left_axis = transformedLeft.axis;
      setValue("left_sphere", transformedLeft.sph);
      setValue("left_cylinder", transformedLeft.cyl);
      setValue("left_axis", transformedLeft.axis);
    }

    try {
      const result = await submitForm(data);
      console.log(result);
      if (!result?.success) return;
      safeToast(message || "", { type: "success" });
    } catch {
      console.log("catch");
    }
  };



  return (
    <form onSubmit={e => e.preventDefault()} className="space-y-6" >
      {/* 👁 Right Eye */}
      {/* mian continear */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1" dir="ltr">
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
                className={`input-text ${fieldErrors["right_sphere"] ? errorClass : successClass}`}
                placeholder="-00.00"
                title="Sphere must be a multiple of 0.25"
                min="-60"
                max="60"
                step="0.25"
              />
            </div>
            {/* CYL r */}
            <div>
              <input
                type="text"
                {...register("right_cylinder")}
                onBlur={(e) => handleFormat("right_cylinder", e.target.value)}
                className={`input-text ${fieldErrors["right_cylinder"] ? errorClass : successClass}`}
                placeholder="-00.00"
                title="Cylinder must be a multiple of 0.25"
                min="-15"
                max="15"
                step="0.25"
              />
            </div>
            {/* AXIS r */}
            <div>
              <input
                type="number"
                {...register("right_axis")}
                onBlur={(e) => handleFormat("right_axis", e.target.value)}
                className={`input-text ${fieldErrors["right_axis"] ? errorClass : successClass}`}
                placeholder="000"
                title="Axis must be between 1 and 180"
                min="1"
                max="180"
                step="1"
              />
            </div>
            {/* ADD r */}
            <div>
              <input
                type="text"
                {...register("right_reading_add")}
                onBlur={(e) => handleFormat("right_reading_add", e.target.value)}
                className={`input-text ${fieldErrors["right_reading_add"] ? errorClass : successClass}`}
                placeholder="+00.00"
                title="Add must be a multiple of 0.25 and between 0.25 and 4"
                min="0.25"
                max="4"
                step="0.25"
              />
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
                className={`input-text ${fieldErrors["left_sphere"] ? errorClass : successClass}`}
                placeholder="-00.00"
                title="Sphere must be a multiple of 0.25"
                min="-60"
                max="60"
                step="0.25"
              />
            </div>
            {/* CYL l */}
            <div>
              <input
                type="text"
                {...register("left_cylinder")}
                onBlur={(e) => handleFormat("left_cylinder", e.target.value)}
                className={`input-text ${fieldErrors["left_cylinder"] ? errorClass : successClass}`}
                placeholder="-00.00"
                title="Cylinder must be a multiple of 0.25"
                min="-15"
                max="15"
                step="0.25"
              />
            </div>

            {/* AXIS l */}
            <div>
              <input
                type="number"
                {...register("left_axis")}
                onBlur={(e) => handleFormat("left_axis", e.target.value)}
                className={`input-text ${fieldErrors["left_axis"] ? errorClass : successClass}`}
                placeholder="000"
                title="Axis must be between 1 and 180"
                min="1"
                max="180"
                step="1"
              />
            </div>

            {/* ADD l */}
            <div>
              <input
                type="text"
                {...register("left_reading_add")}
                onBlur={(e) => handleFormat("left_reading_add", e.target.value)}
                className={`input-text ${fieldErrors["left_reading_add"] ? errorClass : successClass}`}
                placeholder="+00.00"
                title="Add must be a multiple of 0.25 and between 0.25 and 4"
                min="0.25"
                max="4"
                step="0.25"
              />
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
                onBlur={(e) => handleFormat("right_pupillary_distance", e.target.value)}
                className={`input-text ${fieldErrors["right_pupillary_distance"] ? errorClass : successClass}`}
                placeholder="00"
                min="19"
                max="85"
                step="0.25"
                title="Pupillary distance must be between 19 and 85"
              />
            </div>
            {/* SG r */}
            <div >
              <input
                id="sigmant_right"
                type="number"
                {...register("sigmant_right")}
                onBlur={(e) => handleFormat("sigmant_right", e.target.value)}
                className={`input-text ${fieldErrors["sigmant_right"] ? errorClass : successClass}`}
                step="0.25"
                min="8"
                max="55"
                placeholder="00"
                title="SG must be between 8 and 55"
              />
            </div>
            {/* AV r */}
            <div>
              <input
                id="a_v_right"
                type="text"
                {...register("a_v_right")}
                className={`input-text ${fieldErrors["a_v_right"] ? errorClass : successClass}`}
                placeholder="V/A"
                title="Vision Acuity"

              />
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
                onBlur={(e) => handleFormat("left_pupillary_distance", e.target.value)}
                className={`input-text ${fieldErrors["left_pupillary_distance"] ? errorClass : successClass}`}
                placeholder="00"
                title="Pupillary distance must be between 19 and 85"
                min="19"
                max="85"
                step="0.25"

              />
            </div>
            {/* SG l */}
            <div>
              <input
                type="number"
                {...register("sigmant_left")}
                onBlur={(e) => handleFormat("sigmant_left", e.target.value)}
                className={`input-text ${fieldErrors["sigmant_left"] ? errorClass : successClass}`}
                placeholder="00"
                title="SG must be between 8 and 55"
                min="8"
                max="55"
                step="1"

              />
            </div>
            {/* AV l */}
            <div>
              <input
                type="text"
                {...register("a_v_left")}
                className={`input-text ${fieldErrors["a_v_left"] ? errorClass : successClass}`}
                placeholder="V/A"
                title="Vision Acuity"

              />
            </div>
          </div>
        </div>
        {/* { errors } */}
        {/* <p>{JSON.stringify(errors)}</p> */}
      </div>


      {/* باقي الحقول */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-center align-center ">

        <div>
          <label>Doctor Name</label>
          <input {...register("doctor_name")} className="input-text" placeholder="Dr. Ahmed" />
          {errors.doctor_name && <p className="error">{errors.doctor_name.message}</p>}
        </div>

        <div>
          <label>Prescription Date *</label>
          <input
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            {...register("prescription_date")}
            className="input-text"
          />
          {errors.prescription_date && <p className="error">{errors.prescription_date.message}</p>}
        </div>


        <div>
          <label>Customer *</label>

          <div className="flex items-center">
          <select {...register("customer")} className="input-text">
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.first_name} {customer.last_name}
              </option>
            ))}
          </select>
          {errors.customer && <p className="error">{errors.customer.message}</p>}
          <ActionButton
            onClick={() => setShowModal(true)}
            variant="outline"
            className="ml-2 p-4"
            icon={<CirclePlus size={18} color="green" />}
            title="Add"
          />
          {showModal && (
            <Modal url={'dashboard/customer/create'} onClose={() => setShowModal(false)} />
          )}
          </div>


        </div>

      </div>
      <div>
        <label>Notes</label>
        <textarea {...register("notes")} className="input-text" rows={1} placeholder="Notes..." />

      </div>


      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
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
const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const errorClass = "text-red-500 text-sm mt-1 underline";
const successClass = "text-green-800 text-sm mt-1 font-bold";
