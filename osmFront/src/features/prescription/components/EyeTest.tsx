"use client";
import React, { useEffect, useState } from "react";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { PrescriptionFormProps } from "../types";
import { safeToast } from "@/src/shared/utils/safeToast";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus, Eye, Sparkles, Save, ArrowLeft } from "lucide-react";
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
import { formsConfig } from "@/src/features/formGenerator/constants/entityConfig";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";

export default function EyeTest(props: PrescriptionFormProps) {
  const { filterAlias, partialUpdateAlias, retrieveAlias, createAlias } =
    formsConfig["prescriptions"];
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const {
    message,
    submitText,
    id,
    isView = false,
    showContactLens = false,
    customerId: externalCustomerId,
    onSaveSuccess,
    compact = false,
  } = props;
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [contactLensData, setContactLensData] = useState<any>({});

  // API hooks
  const customersApi = useApiForm({ alias: "crm_customers_list" });

  const prescriptionApi = useApiForm({
    alias: retrieveAlias,
    defaultValues: { id: Number(id) },
    enabled: !!id,
  });

  const updatePrescriptionApi = useApiForm({
    alias: partialUpdateAlias,
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
  } = useApiForm({ alias: id ? partialUpdateAlias : createAlias });

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
      const reversed = [...results].reverse();
      setCustomers(reversed);

      if (!id && reversed.length > 0 && !getValues("customer")) {
        if (externalCustomerId) {
          setValue("customer", String(externalCustomerId));
        } else {
          setValue("customer", String(reversed[0].id));
        }
      }
    }
  }, [customersApi.query.data, id, setValue, getValues, externalCustomerId]);

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
        if (!id) reset();
        safeToast(message || "Saved successfully", { type: "success" });

        if (onSaveSuccess && result.data) {
          onSaveSuccess(result.data);
        }
      }
    } catch (err: any) {
      safeToast(err.message || "Server error", { type: "error" });
    }
  };

  return (
    <>
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" dir="ltr">
          {/* Main Prescription Card */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <GlassCard className="shadow-xl" padding="none">
              {/* Gradient strip */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer bg-[length:200%_100%]" />

              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-main flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Eye className="w-6 h-6 text-primary" />
                    </div>
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Prescription Values
                    </span>
                  </h2>

                  <Badge variant="info" size="sm">
                    OD (Right) / OS (Left)
                  </Badge>
                </div>

                <div className="space-y-6">
                  {/* ✅ الحفاظ على الترتيب والتقسيم الحالي تماماً */}

                  {/* Label Headers - Desktop & Mobile */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-2">
                    <EyeTestLabel />
                    <EyeTestLabelProps />
                  </div>

                  {/* Right Eye Row */}
                  <div className="pb-6 border-b border-border-main/50 border-dashed">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center">
                      <EyeRow
                        side="right"
                        {...{
                          register,
                          isView,
                          setValue,
                          getValues,
                          fieldErrors,
                          setFieldErrors,
                        }}
                      />
                      <EyeExtraRow
                        side="right"
                        {...{
                          register,
                          isView,
                          setValue,
                          getValues,
                          fieldErrors,
                          setFieldErrors,
                        }}
                      />
                    </div>
                  </div>

                  {/* Left Eye Row */}
                  <div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center">
                      <EyeRow
                        side="left"
                        {...{
                          register,
                          isView,
                          setValue,
                          getValues,
                          fieldErrors,
                          setFieldErrors,
                        }}
                      />
                      <EyeExtraRow
                        side="left"
                        {...{
                          register,
                          isView,
                          setValue,
                          getValues,
                          fieldErrors,
                          setFieldErrors,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Other Eye Test Fields */}
          <OtherEyeTestFailed
            {...{ register, customers, setShowModal, errors, isView }}
          />

          {/* Action Bar - Hide if in view mode */}
          {!isView && (
            <div className="flex items-center justify-between pt-4">
              {/* Back Button */}
              <ActionButton
                variant="ghost"
                size="lg"
                icon={<ArrowLeft size={18} />}
                label="Back"
                navigateTo="/prescription"
                className="rounded-xl"
              />

              {/* Save Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ActionButton
                  onClick={handleSubmit(onSubmit)}
                  label={
                    isBusy ? "Saving..." : submitText || "Save Prescription"
                  }
                  disabled={isBusy}
                  isLoading={isBusy}
                  variant="success"
                  size="lg"
                  className="rounded-xl shadow-lg hover:shadow-xl min-w-[180px]"
                  icon={<Save size={18} />}
                />
              </motion.div>
            </div>
          )}
        </form>

        {/* Contact Lens Viewer (Read Only View) */}
        {showContactLens &&
          contactLensData &&
          Object.keys(contactLensData).length > 0 && (
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
