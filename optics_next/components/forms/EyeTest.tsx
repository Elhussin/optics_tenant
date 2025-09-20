"use client";
import React, { useState, useEffect } from "react";
import { EyeTestValidator } from "@/lib/utils/EyeTestValidator";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { formRequestProps } from "@/types";
import { safeToast } from "@/lib/utils/toastService";
import Modal from "@/components/view/Modal";
import { ActionButton } from "@/components/ui/buttons";
import { CirclePlus } from "lucide-react";

/* ======================
   🔹 Validator Mapping
   ====================== */
const validator = new EyeTestValidator();
const validatorMap: Record<string, (n: number) => number | string | null> = {
  sphere: (n: number) => validator.validateSPH(n),
  cylinder: (n: number) => validator.validateCYL(n),
  axis: (n: number) => validator.validateAxis(n),
  add: (n: number) => validator.validateADD(n),
  pupillary_distance: (n: number) => validator.validatePD(n),
  sigmant: (n: number) => validator.validateSG(n),
};

/* ======================
   🔹 UI Helpers
   ====================== */
const errorInputClass = "border-red-500 bg-red-50 text-red-500 focus:ring-red-500";
const normalInputClass = "border-gray-300 focus:ring-blue-500";

/* ======================
   🔹 EyeRow Component
   ====================== */
interface EyeRowProps {
  side: "right" | "left";
  register: any;
  isView: boolean;
  fieldErrors: Record<string, boolean>;
  handleFormat: (field: string, value: string) => void;
}
const EyeRow: React.FC<EyeRowProps> = ({ side, register, isView, fieldErrors, handleFormat }) => {
  const prefix = side === "right" ? "R" : "L";
  const errorClass = fieldErrors[`${side}_sphere`] ? errorInputClass : normalInputClass;
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
          className={`input-text ${fieldErrors[`${side}_sphere`] ? errorInputClass : normalInputClass}`}
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
          className={`input-text ${fieldErrors[`${side}_cylinder`] ? errorInputClass : normalInputClass}`}
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
          className={`input-text ${fieldErrors[`${side}_axis`] ? errorInputClass : normalInputClass}`}
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
          className={`input-text ${fieldErrors[`${side}_reading_add`] ? errorInputClass : normalInputClass}`}
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

/* ======================
   🔹 EyeExtraRow Component
   ====================== */
interface EyeExtraRowProps {
  side: "right" | "left";
  register: any;
  isView: boolean;
  fieldErrors: Record<string, boolean>;
  handleFormat: (field: string, value: string) => void;
}
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
          className={`input-text ${fieldErrors[`${side}_pupillary_distance`] ? errorInputClass : normalInputClass}`}
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
          className={`input-text ${fieldErrors[`sigmant_${side}`] ? errorInputClass : normalInputClass}`}
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
          className={`input-text ${fieldErrors[`a_v_${side}`] ? errorInputClass : normalInputClass}`}
          placeholder="V/A"
          disabled={isView}
        />
      </div>
    </div>
  );
};

/* ======================
   🔹 Main Form Component
   ====================== */
interface PrescriptionFormProps extends formRequestProps {
  isView?: boolean;
}


export default function EyeTest(props: PrescriptionFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const { alias, title, message, submitText, id, isView = false } = props;

  const fetchCustomers = useFormRequest({ alias: "crm_customers_list" });
  const fetchPrescriptions = useFormRequest({ alias: "prescriptions_prescription_retrieve" });
  const updatePrescriptions = useFormRequest({ alias: "prescriptions_prescription_update" });

  const { register, handleSubmit, setValue,getValues, reset, submitForm, errors, isSubmitting } = useFormRequest({ alias });

  /* Fetch prescription if editing */
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const result = await fetchPrescriptions.submitForm({ id });
      for (const [key, value] of Object.entries(result.data)) {
        setValue(key, value);
      }
      const customer: any = (result as any)?.data?.customer;
      if (customer) {
        setValue("customer", String(typeof customer === "object" ? customer.id : customer));
      }
    };
    fetchData();
  }, [id,]);
  // fetchPrescriptions  reset, setValue
  /* Fetch customers once */
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchCustomers.submitForm();
      setCustomers(result.data);
    };
    fetchData();
  }, []);
  // fetchCustomers
  /* Handle input formatting */
  const handleFormat = (field: string, value: string) => {
    // if ( ) return;

    if(isNaN(Number(value))){
      setFieldErrors((prev) => ({ ...prev, [field]: true }));
      return;
    }else if(!value ){
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
      return; 
    }
    const num = Number(value);
    const validatorKey = Object.keys(validatorMap).find((k) => field.includes(k));

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
        if (field === "right_pupillary_distance" && val >= 45) val = val / 2;
        applyValue(field, val);
        applyValue(mirrorFields[field], val);
      } else {
        applyValue(field, formatted);
      }

      if (
        field.includes("sphere") ||
        field.includes("cylinder") ||
        field.includes("axis")
      ){
        
        const side = field.startsWith("right") ? "right" : "left";
        const sph = parseFloat(getValues(`${side}_sphere`));
        const cyl = parseFloat(getValues(`${side}_cylinder`));
        const axis = parseFloat(getValues(`${side}_axis`));

        if (!isNaN(sph) && !isNaN(cyl) && !isNaN(axis)) {
          const transformed = validator.transformSphCylAxis(sph, cyl, axis);
          if (transformed) {
            applyValue(`${side}_sphere`, transformed.sph);
            applyValue(`${side}_cylinder`, transformed.cyl);
            applyValue(`${side}_axis`, transformed.axis);
          }
        }
      }
    } else {
      console.log("formatted", formatted);
      console.log("fieldErrors", fieldErrors);
      setFieldErrors((prev) => ({ ...prev, [field]: true }));
    }
  };

  /* Submit Handler */
  const onSubmit = async (data: any) => {
    try {
      // validate both eyes
      const right = validator.validatePrescription({
        sphere: data.right_sphere,
        cylinder: data.right_cylinder,
        axis: data.right_axis,
        add: data.right_reading_add,
        pd: data.right_pupillary_distance,
        sg: data.sigmant_right,
      });
      if (!right.valid) {
        right.errors.forEach((err) => safeToast("Right eye: " + err, { type: "error" }));
        return;
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
        left.errors.forEach((err) => safeToast("Left eye: " + err, { type: "error" }));
        return;
      }

      // submit
      let result;
      if (id) {
        result = await updatePrescriptions.submitForm(data);
      } else {
        result = await submitForm(data);
      }

      if (!result?.success) {
        safeToast(result?.message || "Something went wrong", { type: "error" });
        return;
      }

      safeToast(message || "Saved successfully", { type: "success" });
    } catch (err: any) {
      safeToast(err.message || "Server error", { type: "error" });
    }
  };

  /* ======================
     🔹 UI Render
     ====================== */
  return (
    <form onSubmit={e => e.preventDefault()} className="space-y-6">
      {/* Eyes Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2" dir="ltr">
        {/* Right/Left Sph-Cyl-Axis-Add */}
        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-[80px_repeat(4,1fr)] gap-2">
            <label></label>
            <label>SPH</label>
            <label>CYL</label>
            <label>AXIS</label>
            <label>ADD</label>
          </div>
          <EyeRow side="right" {...{ register, isView, fieldErrors, handleFormat }} />
          <EyeRow side="left" {...{ register, isView, fieldErrors, handleFormat }} />
        </div>

        {/* PD / SG / VA */}
        <div className="grid grid-cols-1 gap-2 mt-4 md:mt-0">
          <div className="grid grid-cols-[80px_repeat(4,1fr)] md:grid-cols-5 gap-2">
            <label className="block md:hidden"></label>
            <label>PD</label>
            <label>SG</label>
            <label>VA</label>
          </div>
          <EyeExtraRow side="right" {...{ register, isView, fieldErrors, handleFormat }} />
          <EyeExtraRow side="left" {...{ register, isView, fieldErrors, handleFormat }} />
        </div>
      </div>

      {/* Notes + Customer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Notes */}
        <div className="grid grid-cols-[80px_repeat(4,1fr)] gap-2 mt-4">
          <div className="flex items-center">
            <label className="">Notes</label>
          </div>
          <div className="col-span-3 md:col-span-4">
            <textarea
              {...register("notes")}
              className="input-text resize-none p-2 rounded-md border border-gray-300 w-full"
              rows={1}
              placeholder="Notes..."
            />
          </div>
        </div>

        {/* Customer */}
        <div className="grid grid-cols-[80px_repeat(4,1fr)] md:grid-cols-5 gap-2 mt-4 relative">
          <div className="flex items-center">
            <label className="">
              Customer<span className="text-red-500">*</span>
            </label>
          </div>
          <div className="col-span-3 md:col-span-2">
            <select
              {...register("customer")}
              className="input-text rounded-md border border-gray-300 w-full p-2 appearance-none"
            >
              <option value="">Select Customer</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </option>
              ))}
            </select>
            <ActionButton
              onClick={() => setShowModal(true)}
              variant="outline"
              className="absolute right-2 top-1 p-2"
              icon={<CirclePlus size={18} color="green" />}
              title="Add"
            />
          </div>
          {showModal && (
            <Modal
              url={"dashboard/customer/create"}
              // onClose={() => setShowModal(false),(newCustomer: any) => setCustomers((prev) => [...prev, newCustomer])}
              // onSuccess={(newCustomer) => setCustomers((prev) => [...prev, newCustomer])}
              onClose={(newCustomer: any) => {
                setShowModal(false);
                setCustomers((prev) => [...prev, newCustomer]);
              }}
            />
          )}
          {errors.customer && <p className="text-red-500 mt-1">{errors.customer.message}</p>}
        </div>
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
    </form>
  );
}
