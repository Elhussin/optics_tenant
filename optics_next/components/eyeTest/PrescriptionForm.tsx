"use client";
import React, { useState, useEffect } from "react";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { formRequestProps } from "@/types";
import { safeToast } from "@/lib/utils/toastService";
import { handleFormatField, transformBeforeSubmit } from "./prescriptionFormat";
// import EyeRow from "./EyeRow";
import EyeRow from "./EyeRow";
import ExtraFields from "./ExtraFields";
import {CustomerSelect} from "./CustomerSelect";

interface PrescriptionFormProps extends formRequestProps {
  isView?: boolean;
}

export default function PrescriptionForm(props: PrescriptionFormProps) {
  const { alias, message, id, isView = false } = props;
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, setValue, getValues, reset, submitForm, errors, isSubmitting } =
    useFormRequest({ alias });

  const fetchCustomers = useFormRequest({ alias: "crm_customers_list" });
  const fetchPrescriptions = useFormRequest({ alias: "prescriptions_prescription_retrieve" });
  const updatePrescriptions = useFormRequest({ alias: "prescriptions_prescription_update" });

  useEffect(() => {
    if (id) {
      (async () => {
        const result = await fetchPrescriptions.submitForm({ id });
        for (const [key, value] of Object.entries(result.data)) {
          setValue(key, value);
        }
      })();
    }
  }, [id, reset]);

  useEffect(() => {
    (async () => {
      const result = await fetchCustomers.submitForm();
      setCustomers(result.data);
    })();
  }, [showModal]);

  const onSubmit = async (data: any) => {
    data = transformBeforeSubmit(data); // ✅ نصحح القيم قبل الإرسال
    try {
      const result = id
        ? await updatePrescriptions.submitForm(data)
        : await submitForm(data);

      if (!result?.success) return;
      safeToast(message || "Saved successfully", { type: "success" });
    } catch {
      safeToast("Something went wrong", { type: "error" });
    }
  };

  return (
    <form onSubmit={e => e.preventDefault()} className="space-y-6">
      {/* 👁 Right & Left Eye */}
      <EyeRow side="right" register={register} handleFormat={handleFormatField(setValue, getValues)} isView={isView} />
      <EyeRow side="left" register={register} handleFormat={handleFormatField(setValue, getValues)} isView={isView} />

      {/* Extra fields: PD, SG, VA */}
      <ExtraFields register={register} handleFormat={handleFormatField(setValue, getValues)} isView={isView} />

      {/* Customer + Notes */}
      <CustomerSelect
        register={register}
        customers={customers}
        errors={errors}
        showModal={showModal}
        setShowModal={setShowModal}
        isView={isView}
        setCustomers={setCustomers}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => reset()} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md">
          Cancel
        </button>
      </div>
    </form>
  );
}
