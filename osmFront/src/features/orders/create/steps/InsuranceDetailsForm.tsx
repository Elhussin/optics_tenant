"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { Button } from "@/src/shared/components/shadcn/ui/button";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/shared/components/shadcn/ui/form";
import { Loader2 } from "lucide-react";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { useOrderFormStore } from "../../store/useOrderFormStore";

interface InsuranceDetailsFormProps {
  customerId: number;
  partnerId: number;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
  linkId?: number | null;
}

export const InsuranceDetailsForm = ({
  customerId,
  partnerId,
  onSuccess,
  onCancel,
  initialData,
  linkId,
}: InsuranceDetailsFormProps) => {
  const t = useTranslations("orders"); // Using orders namespace, might need specific keys

  const isEdit = !!linkId;
  const alias = isEdit
    ? "crm_customer_partner_links_update"
    : "crm_customer_partner_links_create";

  const defaultValues = {
    customer: customerId,
    partner: partnerId,
    policy_number: initialData?.policy_number || "",
    membership_number: initialData?.membership_number || "",
    coverage_start:
      initialData?.coverage_start || new Date().toISOString().split("T")[0],
    coverage_end: initialData?.coverage_end || "",
    insurance_class: initialData?.insurance_class || "",
    patient_share_percentage: initialData?.patient_share_percentage || 0,
    max_patient_share: initialData?.max_patient_share || 0,
    annual_limit: initialData?.annual_limit || 0,
    remaining_limit: initialData?.remaining_limit || 0,
    is_active: true,
    ...(isEdit && { id: linkId }),
  };

  const store = useOrderFormStore();

  const { submitForm, isBusy, ...form } = useApiForm({
    alias,
    defaultValues,
    onSuccess: (response: any) => {
      const values = form.getValues();
      store.setInsuranceDetails({
        patientSharePercentage:
          parseFloat(String(values.patient_share_percentage)) || 0,
        maxPatientShare: parseFloat(String(values.max_patient_share)) || 0,
        remainingLimit: parseFloat(String(values.remaining_limit)) || 0,
      });
      onSuccess();
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        ...defaultValues,
        ...initialData,
        customer: customerId,
        partner: partnerId,
      });
    }
  }, [initialData]);

  return (
    <div className="p-4 border border-primary/20 rounded-lg bg-surface/50 mt-4 animate-fade-in-up">
      <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
        {isEdit ? "Edit Insurance Details" : "Add Insurance Details"}
      </h3>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data: any) =>
            submitForm(isEdit ? { ...data, id: linkId } : data),
          )}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Policy Number */}
            <FormField
              control={form.control}
              name="policy_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Policy Number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Member ID */}
            <FormField
              control={form.control}
              name="membership_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Membership Number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Coverage Start */}
            <FormField
              control={form.control}
              name="coverage_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Coverage End */}
            <FormField
              control={form.control}
              name="coverage_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class */}
            <FormField
              control={form.control}
              name="insurance_class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Class</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. A, VIP, Gold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Copay % */}
            <FormField
              control={form.control}
              name="patient_share_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Share (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Cap */}
            <FormField
              control={form.control}
              name="max_patient_share"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Patient Share (Cap)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="0" min="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Annual Limit */}
            <FormField
              control={form.control}
              name="annual_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Limit</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="0" min="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remaining Limit */}
            <FormField
              control={form.control}
              name="remaining_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remaining Limit</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="0" min="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save & Link
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
