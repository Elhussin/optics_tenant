"use client";
import React, { useEffect, useState } from "react";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { PrescriptionFormProps } from "../types";
import { safeToast } from "@/src/shared/utils/toastService";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";
import EyeRow from "./EyeRow";
import EyeExtraRow from "./EyeExtraRow";
import { EyeTestLabel, EyeTestLabelProps } from "./eyeTestLabel";
import { validateEyeTest, validateContactLens } from "../utils/handleEyeTestFormat";
import { ContactLensValidator } from "../utils/ContactLensValidator";
import { OtherEyeTestFailed } from "./OtherEyeTestFailed";

const contactLensValidator = new ContactLensValidator();

export default function EyeTest(props: PrescriptionFormProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { alias, title, message, submitText, id, isView = false } = props;
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [defaultData, setDefaultData] = useState<any>({});
  // API hooks
  const customersApi = useApiForm({ alias: "crm_customers_list" });
  const prescriptionApi = useApiForm({ alias: "prescriptions_prescription_retrieve" });
  const updatePrescriptionApi = useApiForm({ alias: "prescriptions_prescription_update" });
  // const formApi = useApiForm({ alias });

  // const { register, setValue, getValues, handleSubmit, formState } = formApi.methods;
  const { register, handleSubmit, setValue, getValues, submitForm, errors, isSubmitting } = useApiForm({ alias: alias, defaultValues: defaultData });
  // Fetch prescriptions if editing
  useEffect(() => {
    if (!id) return;
    prescriptionApi.query.refetch({ id }).then((res: any) => {
      if (res?.data) {
        // setDefaultData(res.data);
        Object.entries(res.data).forEach(([k, v]) => setValue(k, v));
        if (res.data.customer) {
          setValue("customer", String(res.data.customer.id ?? res.data.customer));
        }

      }
    });
  }, [id]);

  // Fetch customers
  useEffect(() => {
    customersApi.query.refetch().then((res: any) => {
      if (res?.data?.results) {
        setCustomers(res.data.results.reverse());
        if (!id && res.data.results.length > 0) {
          setValue("customer", String(res.data.results[0].id));
        }
      }
    });
  }, [showModal]);

  // Submit Handler
  const onSubmit = async (data: any) => {
    try {
      validateEyeTest(data);
      const contactLens= validateContactLens(data);
      console.log(contactLens);

      const sphericalData = contactLensValidator.convertToSpheric(data);
      const toricData = contactLensValidator.convertToToric(data);

      let result;
      console.log("data", data);
      if (id) {
        result = await updatePrescriptionApi.mutation.mutateAsync(data);
      } else {
        result = await submitForm(data);

      }
      console.log("result", result);
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
            <EyeRow side="right" {...{ register, isView, setValue, getValues, fieldErrors, setFieldErrors }} />
            <EyeRow side="left" {...{ register, isView, setValue, getValues, fieldErrors, setFieldErrors }} />
          </div>
          <div className="grid grid-cols-1 gap-2 mt-4 md:mt-0">
            <EyeTestLabelProps />
            <EyeExtraRow side="right" {...{ register, isView, setValue, getValues, fieldErrors, setFieldErrors }} />
            <EyeExtraRow side="left" {...{ register, isView, setValue, getValues, fieldErrors, setFieldErrors }} />
          </div>
        </div>

        <OtherEyeTestFailed {...{ register, customers, setShowModal, errors, isView }} />

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
        <DynamicFormDialog
          entity="customer"
          onClose={(newCustomer: any) => {
            setShowModal(false);
            if (newCustomer) {
              setCustomers((prev) => [newCustomer, ...prev]);
              setValue("customer", String(newCustomer.id));
            }
          }}
          title="Add Customer"
        />
      )}
    </>
  );
}
