"use client";
import React, { useState, useEffect } from "react";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { PrescriptionFormProps } from "@/types/eyeTestType";
import { safeToast } from "@/utils/toastService";
import Modal from "@/components/view/Modal";
import { ActionButton } from "@/components/ui/buttons";
import { CirclePlus } from "lucide-react";
import EyeRow from "./EyeRow";
import EyeExtraRow from "./EyeExtraRow";
import { EyeTestLabel, EyeTestLabelProps } from "./eyeTestLabel";
import { validateEyeTest } from "@/utils/handleEyeTestFormat";


export default function EyeTest(props: PrescriptionFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const { alias, title, message, submitText, id, isView = false } = props;

  const fetchCustomers = useFormRequest({ alias: "crm_customers_list" });
  const fetchPrescriptions = useFormRequest({ alias: "prescriptions_prescription_retrieve" });
  const updatePrescriptions = useFormRequest({ alias: "prescriptions_prescription_update" });

  const { register, setValue, getValues, submitForm, errors, isSubmitting,handleSubmit } = useFormRequest({ alias });

  /* Fetch prescription if editing */
  const setValues = (data: any) => {
    for (const [key, value] of Object.entries(data)) {
      setValue(key, value);
    }
  };
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const result = await fetchPrescriptions.submitForm({ id });
      setValues(result.data);
      const customer: any = (result as any)?.data?.customer;
      if (customer) {
        setValue("customer", String(typeof customer === "object" ? customer.id : customer));
      }
    };
    fetchData();
  }, [id,]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchCustomers.submitForm();
      setCustomers(result.data.reverse());
    };
    fetchData();
  }, [showModal]);
  /* Submit Handler */
const onSubmit = async (data: any,) => {
    try {
      
      validateEyeTest(data);
      // submit
      let result;
      if (id) {
        result = await updatePrescriptions.submitForm(data);
        
      } else {
        result = await submitForm(data);
      }

      if (result?.success) {
        setValues(result.data);
        safeToast(message || "Saved successfully", { type: "success" });
      }

    } catch (err: any) {
      safeToast(err.message || "Server error", { type: "error" });
    }
  };

  return (
    <form onSubmit={e => e.preventDefault()} className="space-y-6" dir="ltr">
      {/* Eyes Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2" >
        {/* Right/Left Sph-Cyl-Axis-Add */}
        <div className="grid grid-cols-1 gap-2">
          <EyeTestLabel />
          <EyeRow side="right" {...{ register, isView, fieldErrors, setFieldErrors, setValue, getValues }} />
          <EyeRow side="left" {...{ register, isView, fieldErrors, setFieldErrors, setValue, getValues }} />
        </div>

        {/* PD / SG /VD / VA  */}
        <div className="grid grid-cols-1 gap-2 mt-4 md:mt-0">
          <EyeTestLabelProps />
          <EyeExtraRow side="right" {...{ register, isView, fieldErrors, setFieldErrors, setValue, getValues }} />
          <EyeExtraRow side="left" {...{ register, isView, fieldErrors, setFieldErrors, setValue, getValues }} />
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
              title="Notes"
            />
          </div>
        </div>

        {/* Customer */}
        <div className="grid grid-cols-[80px_repeat(4,1fr)] md:grid-cols-5 gap-2 mt-4 ">
          <div className="flex items-center">
            <label className="p-">
              Customer<span className="text-red-500">*</span>
            </label>
          </div>
          <div className="col-span-3 md:col-span-2 flex">

            <select
              {...register("customer")}
              className="input-text rounded-md border border-gray-300 w-full p-2 appearance-none"
              title="Customer (Required)"
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
              // className="absolute right-2 top-1 p-2"
              icon={<CirclePlus size={18} color="green" />}
              title="Add"
            />
          </div>
          {showModal && (
            <Modal
              url={"dashboard/customer/create"}
              onClose={(customer: any) => {
                setShowModal(false);
              }}
            />
          )}
          {errors.customer && <p className="text-red-500 mt-1">{errors.customer.message}</p>}
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <ActionButton
          onClick={handleSubmit(onSubmit)}
          label={isSubmitting ? title + "..." : (title)}
          disabled={isSubmitting}
          variant="info"
          title={submitText || "Save"}
          icon={<CirclePlus size={16} />}
        />
      </div>
    </form>
  );
}




