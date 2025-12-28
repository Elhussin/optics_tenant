"use client";
import React, { useEffect, useState } from "react";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { PrescriptionFormProps } from "../types";
import { safeToast } from "@/src/shared/utils/safeToast";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";
import EyeRow from "./EyeRow";
import EyeExtraRow from "./EyeExtraRow";
import { EyeTestLabel, EyeTestLabelProps } from "./eyeTestLabel";
import {
  validateEyeTest,
  validateContactLens,
} from "../utils/handleEyeTestFormat";
import { OtherEyeTestFailed } from "./OtherEyeTestFailed";
import ContactLensViewer from "./ContactLensViewer";
import { motion } from "framer-motion";

export default function EyeTest(props: PrescriptionFormProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { alias, title, message, submitText, id, isView = false } = props;
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [contactLensData, setContactLensData] = useState<any>({});

  // API hooks
  const customersApi = useApiForm({ alias: "crm_customers_list" });
  
  const prescriptionApi = useApiForm({
    alias: "prescriptions_prescription_retrieve",
    defaultValues: { id: Number(id) },
    enabled: !!id, // Only fetch if ID exists
  });

  const updatePrescriptionApi = useApiForm({
    alias: "prescriptions_prescription_update",
  });
  
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    submitForm,
    errors,
    isBusy,
    reset,
  } = useApiForm({ alias: alias });

  // Handle Prescription Data Load
  useEffect(() => {
    if (prescriptionApi.query.data) {
      const data = prescriptionApi.query.data;
      reset(data);
      
      const customer: any = data.customer;
      if (customer) {
        setValue(
          "customer",
          String(typeof customer === "object" ? customer.id : customer)
        );
      }
    }
  }, [prescriptionApi.query.data, reset, setValue]);

  // Handle Customers List Load
  useEffect(() => {
    if (customersApi.query.data?.results) {
      const results = customersApi.query.data.results;
      // Note: Assuming reverse() was intentional to show newest first? 
      // Be careful if results is read-only from react-query, prefer creating a copy.
      const reversed = [...results].reverse(); 
      setCustomers(reversed);

      // Set default customer only if creating new (no id) and field is empty
      if (!id && reversed.length > 0 && !getValues("customer")) {
        setValue("customer", String(reversed[0].id));
      }
    }
  }, [customersApi.query.data, id, setValue, getValues]);

  // Submit Handler
  const onSubmit = async (data: any) => {
    validateEyeTest(data);
    const eyeTest = validateEyeTest(data);
    if (!eyeTest) {
      return;
    }

    const contactLens = validateContactLens(data);
    setContactLensData(contactLens);
    try {
      let result;
      if (id) {
        result = await updatePrescriptionApi.mutation.mutateAsync(data);
      } else {
        result = await submitForm(data);
      }

      if (result?.success) {
        // Only reset if creating new, or partial refresh logic? 
        // Typically on edit we don't full reset to blank.
        if (!id) reset(); // Reset if create
        
        safeToast(message || "Saved successfully", { type: "success" });
        if (result.data) {
            // Optional: Update form with server response (e.g. calculated fields)
            // Be careful not to wipe out user inputs if server returns partial
        }
      }
    } catch (err: any) {
      safeToast(err.message || "Server error", { type: "error" });
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" dir="ltr">
          
          {/* Main Prescription Card */}
          <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                 Prescription Values
               </h2>
               <div className="text-xs font-mono text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                 OD (Right) / OS (Left)
               </div>
            </div>

            <div className="space-y-6">
               {/* Label Headers - Desktop & Mobile */}
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-2">
                 <EyeTestLabel />
                 <EyeTestLabelProps />
               </div>
      
               {/* Right Eye Row */}
               <div className="pb-6 border-b border-gray-100 dark:border-gray-700/50 border-dashed">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center">
                    <EyeRow side="right" {...{ register, isView, setValue, getValues, fieldErrors, setFieldErrors }} />
                    <EyeExtraRow side="right" {...{ register, isView, setValue, getValues, fieldErrors, setFieldErrors }} />
                  </div>
               </div>

               {/* Left Eye Row */}
               <div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center">
                    <EyeRow side="left" {...{ register, isView, setValue, getValues, fieldErrors, setFieldErrors }} />
                    <EyeExtraRow side="left" {...{ register, isView, setValue, getValues, fieldErrors, setFieldErrors }} />
                  </div>
               </div>
            </div>
          </div>


          <OtherEyeTestFailed
            {...{ register, customers, setShowModal, errors, isView }}
          />

          {/* Action Bar */}
          <div className="flex items-center justify-end pt-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ActionButton
                onClick={handleSubmit(onSubmit)}
                label={isBusy ? "Saving..." : (submitText || "Save Prescription")}
                disabled={isBusy}
                variant="primary" 
                className="px-8 py-3 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 min-w-[160px]"
                icon={isBusy ? undefined : <CirclePlus size={18} />}
              />
            </motion.div>
          </div>
        </form>

        {/* Contact Lens Viewer (Read Only View) */}
        {contactLensData && Object.keys(contactLensData).length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <ContactLensViewer
              rightSphere={contactLensData.rightSphere}
              leftSphere={contactLensData.leftSphere}
              rightToric={contactLensData.rightToric}
              leftToric={contactLensData.leftToric}
            />
          </motion.div>
        )}

        {/* Customer Modal */}
        {showModal && (
          <DynamicFormDialog
            entity="customers"
            onClose={(newCustomer: any) => {
              setShowModal(false);
              if (newCustomer) {
                setCustomers((prev) => [newCustomer, ...prev]);
                setValue("customer", String(newCustomer.id));
              }
            }}
            title="Register New Customer"
          />
        )}
      </motion.div>
    </>
  );
}
