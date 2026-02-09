"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Save, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/shared/components/shadcn/ui/form";
import {
  TextField,
  SelectField,
  TextareaField,
} from "@/src/shared/components/field/Fields";
import { ForeignKeyField } from "@/src/shared/components/field/components/ForeignKeyField";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";

// Export schema
export const paymentSchema = z.object({
  amount: z.string().min(1, "Amount is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  currency: z.string().default("SAR"),
  payment_method: z.string().min(1, "Payment method is required"),
  invoice: z.string().optional(),
  partner: z.string().optional(),
  notes: z.string().optional(),
  
  // Additional fields
  transfer_reference: z.string().optional(),
  transfer_bank: z.string().optional(),
  cheque_number: z.string().optional(),
  cheque_bank: z.string().optional(),
  cheque_date: z.string().optional(), // Date string
  card_last_four: z.string().max(4).optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  form: UseFormReturn<PaymentFormValues>;
  onSubmit?: (data: PaymentFormValues) => void;
  isLoading?: boolean;
}

export function PaymentForm({ form, onSubmit, isLoading }: PaymentFormProps) {
  const t = useTranslations("payments");
  const tCommon = useTranslations("common");

  // State for Dynamic Form Dialog
  const [showModal, setShowModal] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<string>("");
  const [fetchForginKey, setFetchForginKey] = useState<string | null>(null);

  // 1. Fetch Payment Methods
  const { data: paymentMethods } = useFilteredListRequest({
    alias: "sales_payment_methods_list",
  });
  const methodOptions = (paymentMethods || []).map((m: any) => ({
    label: m.name || m.name_en || m.name_ar,
    value: String(m.id),
  }));

  // 2. Fetch Invoices
  const { data: invoicesData, refetch: refetchInvoices } = useFilteredListRequest({
    alias: "sales_invoices_list",
    defaultPageSize: 1000,
  });
  const invoiceOptions = (invoicesData || []).map((inv: any) => ({
    label: inv.invoice_number,
    value: String(inv.id),
  }));

  // 3. Fetch Partners
  const { data: partnersData, refetch: refetchPartners } = useFilteredListRequest({
    alias: "crm_partners_list",
    defaultPageSize: 1000,
  });
  const partnerOptions = (partnersData || []).map((p: any) => ({
    label: p.name,
    value: String(p.id),
  }));

  const handleAddNew = (entityName: string, fieldName: string) => {
    setCurrentEntity(entityName);
    // fieldName used to track which field triggered it, useful if multiple fields use same entity
    // We can map fieldName to "refetch key"
    setFetchForginKey(fieldName); 
    setShowModal(true);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={onSubmit ? form.handleSubmit(onSubmit) : (e) => e.preventDefault()}
          className="space-y-6 animate-fade-in"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amount")} <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <TextField
                      fieldRow={{ name: "amount", label: t("amount"), required: true, type: "number", role: "admin", filter: "", entityName: "payment", fieldName: "amount" }}
                      field={field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("currency")} <span className="text-destructive">*</span></FormLabel>
                   <FormControl>
                    <SelectField
                      fieldRow={{ name: "currency", label: t("currency"), required: true, role: "admin", filter: "", entityName: "payment", fieldName: "currency" }}
                      field={field}
                      options={[{ label: "SAR", value: "SAR" }, { label: "USD", value: "USD" }]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel>{t("method")} <span className="text-destructive">*</span></FormLabel>
                     <FormControl>
                      <SelectField
                        fieldRow={{ name: "payment_method", label: t("method"), placeholder: "Select Payment Method", required: true, role: "admin", filter: "", entityName: "payment", fieldName: "payment_method" }}
                        field={field}
                        options={methodOptions}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Invoice (Foreign Key) */}
            <div className="md:col-span-1">
              <FormField
                control={form.control}
                name="invoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("invoice")}</FormLabel>
                    <FormControl>
                      <ForeignKeyField
                        fieldRow={{ name: "invoice", label: t("invoice"), placeholder: "Select Invoice", entityName: "invoices", filter: "Invoice", required: false }}
                        field={field}
                        options={invoiceOptions}
                        onAddNew={handleAddNew}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Partner (Foreign Key) */}
            <div className="md:col-span-1">
              <FormField
                control={form.control}
                name="partner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("partner", {fallback: "Partner"})}</FormLabel>
                    <FormControl>
                      <ForeignKeyField
                         fieldRow={{ name: "partner", label: "Partner", placeholder: "Select Partner", entityName: "crm-partners", filter: "Partner", required: false }}
                         field={field}
                         options={partnerOptions}
                         onAddNew={handleAddNew}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Details Group */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-xl bg-muted/20">
              <h3 className="md:col-span-2 font-medium text-sm text-secondary">Additional Details</h3>
              
              <FormField
                control={form.control}
                name="transfer_reference"
                render={({ field }) => (
                   <FormItem>
                      <FormLabel>Transfer Reference</FormLabel>
                      <FormControl>
                         <TextField fieldRow={{ name: "transfer_reference", label: "Transfer Reference", role: "admin", filter: "", entityName: "payment", fieldName: "transfer_reference", required: false }} field={field} />
                      </FormControl>
                   </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transfer_bank"
                render={({ field }) => (
                   <FormItem>
                      <FormLabel>Transfer Bank</FormLabel>
                      <FormControl>
                         <TextField fieldRow={{ name: "transfer_bank", label: "Transfer Bank", role: "admin", filter: "", entityName: "payment", fieldName: "transfer_bank", required: false }} field={field} />
                      </FormControl>
                   </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cheque_number"
                render={({ field }) => (
                   <FormItem>
                      <FormLabel>Cheque Number</FormLabel>
                      <FormControl>
                         <TextField fieldRow={{ name: "cheque_number", label: "Cheque Number", role: "admin", filter: "", entityName: "payment", fieldName: "cheque_number", required: false }} field={field} />
                      </FormControl>
                   </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cheque_bank"
                render={({ field }) => (
                   <FormItem>
                      <FormLabel>Cheque Bank</FormLabel>
                      <FormControl>
                         <TextField fieldRow={{ name: "cheque_bank", label: "Cheque Bank", role: "admin", filter: "", entityName: "payment", fieldName: "cheque_bank", required: false }} field={field} />
                      </FormControl>
                   </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                   <FormItem>
                      <FormLabel>{t("notes")}</FormLabel>
                      <FormControl>
                         <TextareaField fieldRow={{ name: "notes", label: t("notes"), role: "admin", filter: "", entityName: "payment", fieldName: "notes", required: false }} field={field} />
                      </FormControl>
                   </FormItem>
                )}
              />
            </div>

          </div>

          {onSubmit && (
            <div className="flex justify-end gap-4 pt-4">
              <ActionButton
                type="submit"
                variant="success"
                size="lg"
                label={tCommon("save", { fallback: "Save" })}
                isLoading={isLoading}
                icon={<Save size={20} />}
                className="min-w-[120px]"
              />
            </div>
          )}
        </form>
      </Form>

      {/* Dynamic Form Modal */}
      {showModal && (
        <DynamicFormDialog
          entity={currentEntity}
          onClose={() => {
            setShowModal(false);
            if (fetchForginKey) {
                if (fetchForginKey === "invoice") refetchInvoices();
                if (fetchForginKey === "partner") refetchPartners();
            }
          }}
        />
      )}
    </>
  );
}
