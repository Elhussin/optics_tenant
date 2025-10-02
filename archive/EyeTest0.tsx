"use client";
import React, { useState, useEffect, useRef } from "react";
import { useFormRequest } from "@/src/shared/hooks/useFormRequest";
import { PrescriptionFormProps } from "../osmFront/src/features/prescription/types";
import { safeToast } from "@/src/shared/utils/toastService";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";
import EyeRow from "../osmFront/src/features/prescription/components/EyeRow";
import EyeExtraRow from "../osmFront/src/features/prescription/components/EyeExtraRow";
import { EyeTestLabel, EyeTestLabelProps } from "../osmFront/src/features/prescription/components/eyeTestLabel";
import { validateEyeTest,validateContactLens } from "../osmFront/src/features/prescription/utils/handleEyeTestFormat";
import { ContactLensValidator } from "../osmFront/src/features/prescription/utils/ContactLensValidator";
import { OtherEyeTestFailed } from "../osmFront/src/features/prescription/components/OtherEyeTestFailed";


const contactLensValidator = new ContactLensValidator();
export default function EyeTest(props: PrescriptionFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const { alias, title, message, submitText, id, isView = false } = props;

  const fetchCustomers = useFormRequest({ alias: "crm_customers_list" });

  const fetchPrescriptions = useFormRequest({ alias: "prescriptions_prescription_retrieve" });
  const updatePrescriptions = useFormRequest({ alias: "prescriptions_prescription_update" });

  const { register, setValue, getValues, submitForm, errors, isSubmitting, handleSubmit, reset } = useFormRequest({ alias });

  /* Fetch prescription if editing */
  const setValues = (data: any) => {
    for (const [key, value] of Object.entries(data)) {
      setValue(key, value);
    }
  };

  useEffect(() => {
    if (!id || !customers.length) return;
    (async () => {
      const result = await fetchPrescriptions.submitForm({ id });
      setValues(result.data);
      const customer: any = result?.data?.customer;
      if (customer) {
        setValue("customer", String(typeof customer === "object" ? customer.id : customer));
      }
    })();
  }, [id, customers]);


  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchCustomers.submitForm();
      const list = result.data.results.reverse();
      setCustomers(list);

      if (result.success) {
        if (!id && !firstLoad && !showModal && list.length > 0) {
          setValue("customer", String(list[0].id));
        }

      }

      setFirstLoad(false);
    };
    fetchData();
  }, [showModal]);


  /* Submit Handler */
  const onSubmit = async (data: any,) => {
    try {

      validateEyeTest(data);
      const validateContactLensData = validateContactLens(data);

      const sphericalData = contactLensValidator.convertToSpheric(data);
      const toricData = contactLensValidator.convertToToric(data);

      let result;

      if (id) {
        result = await updatePrescriptions.submitForm(data);

      } else {
        result = await submitForm(data);
      }
      console.log(result);
      if (result?.success) {
        reset(result.data);

        // setValues(result.data);
        safeToast(message || "Saved successfully", { type: "success" });
      }

    } catch (err: any) {
      safeToast(err.message || "Server error", { type: "error" });
    }
  };

  return (
    <>
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
        <OtherEyeTestFailed {...{ register, customers, setShowModal, errors, isView }} />

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


      {showModal && (
        <DynamicFormDialog
          entity="customer"
          onClose={(newCustomer: any) => {
            setShowModal(false);
            if (newCustomer) {
              // ضيف العميل الجديد للقائمة بدون fetch
              setCustomers((prev) => [newCustomer, ...prev]);

              // اجعله المختار مباشرة
              setValue("customer", String(newCustomer.id));
            }
          }}
          title="Add Customer"
        />
      )}
    </>
  );
}



