"use client";
import React, { useState, useEffect } from "react";
import { PrescriptionFormProps } from "@/types/eyeTestType";
import { safeToast } from "@/utils/toastService";
import AddModule from "@/components/view/AddModule";
import { ActionButton } from "@/components/ui/buttons";
import { CirclePlus } from "lucide-react";
import EyeRow from "./EyeRow";
import EyeExtraRow from "./EyeExtraRow";
import { EyeTestLabel, EyeTestLabelProps } from "./eyeTestLabel";
import { validateEyeTest, validateContactLens } from "@/utils/handleEyeTestFormat";
import { ContactLensValidator } from "@/utils/ContactLensValidator";
import { OtherEyeTestFailed } from "./OtherEyeTestFailed";
import { useApiForm } from "@/lib/hooks/useApiForm";
import { useQuery } from "@tanstack/react-query";


const contactLensValidator = new ContactLensValidator();

export default function EyeTest(props: PrescriptionFormProps) {
  const { alias, title, message, submitText, id, isView = false } = props;
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);

  // Queries
  const customersQuery = useApiForm({ alias: "crm_customers_list", type: "query" });
  const prescriptionQuery = useApiForm({ alias: "prescriptions_prescription_retrieve", type: "query", enabled: !!id });

  // Mutations
  const createMutation = useApiForm({ alias, type: "mutation" });
  const updateMutation = useApiForm({ alias: "prescriptions_prescription_update", type: "mutation" });


// const { data: customersData = [], isLoading: loadingCustomers } = useQuery({
//   queryKey: ["customers"],
//   queryFn: () => api.customRequest("crm_customers_list"),
// });

// const { data: prescriptionData } = useQuery({
//   queryKey: ["prescription", id],
//   queryFn: () => id ? api.customRequest("prescriptions_prescription_retrieve", { id }) : null,
//   enabled: !!id, // ما يشتغلش إلا لو في id
// });

  // Form
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    errors,
    isSubmitting,
  } = useApiForm({ alias });

  // لو في prescription id نزود قيم الفورم
  useEffect(() => {
    if (id && prescriptionQuery.data) {
      const data = prescriptionQuery.data;
      for (const [key, value] of Object.entries(data)) {
        setValue(key, value);
      }
      const customer = data?.customer;
      if (customer) {
        setValue("customer", String(typeof customer === "object" ? customer.id : customer));
      }
    }
  }, [id, prescriptionQuery.data]);

  // Submit handler
  const onSubmit = async (data: any) => {
    try {
      validateEyeTest(data);
      validateContactLens(data);

      const sphericalData = contactLensValidator.convertToSpheric(data);
      const toricData = contactLensValidator.convertToToric(data);
      console.log(sphericalData, toricData);

      let result;
      if (id) {
        result = await updateMutation.mutateAsync(data);
      } else {
        result = await createMutation.mutateAsync(data);
      }

      if (result?.success) {
        safeToast(message || "Saved successfully", { type: "success" });
      }
    } catch (err: any) {
      safeToast(err.message || "Server error", { type: "error" });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="ltr">
        {/* Eyes Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="grid grid-cols-1 gap-2">
            <EyeTestLabel />
           <EyeRow side="right" {...{ register, isView, fieldErrors, setFieldErrors, setValue, getValues }} />   
          <EyeRow side="left" {...{ register, isView, fieldErrors, setFieldErrors, setValue, getValues }} />
          </div>

          <div className="grid grid-cols-1 gap-2 mt-4 md:mt-0">
            <EyeTestLabelProps />
            <EyeExtraRow side="right" {...{ register, isView, fieldErrors, setFieldErrors, setValue, getValues }} />
            <EyeExtraRow side="left" {...{ register, isView, fieldErrors, setFieldErrors, setValue, getValues }} />
          </div>
        </div>

        <OtherEyeTestFailed
          {...{
            register,
            customers: customersQuery.data?.results || [],
            setShowModal,
            errors,
            isView,
          }}
        />

        <div className="flex gap-3 pt-4">
          <ActionButton
            onClick={handleSubmit(onSubmit)}
            label={isSubmitting ? title + "..." : title}
            disabled={isSubmitting}
            variant="info"
            title={submitText || "Save"}
            icon={<CirclePlus size={16} />}
          />
        </div>
      </form>

      {showModal && (
        <AddModule
          entity="customer"
          onClose={(newCustomer: any) => {
            setShowModal(false);
            if (newCustomer) {
              // ضيف العميل الجديد
              customersQuery.setData((prev: any) => ({
                ...prev,
                results: [newCustomer, ...(prev?.results || [])],
              }));
              setValue("customer", String(newCustomer.id));
            }
          }}
          title="Add Customer"
        />
      )}
    </>
  );
}
