"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  UserCheck,
  FileText,
  Plus,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Eye,
  CirclePlus,
} from "lucide-react";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useOrderFormStore } from "../../store/useOrderFormStore";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import EyeTest from "@/src/features/prescription/components/EyeTest";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface PrescriptionCardProps {
  prescription: any;
  isSelected: boolean;
  isExpanded: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onToggleEdit: () => void;
  customerId: number | null;
}

function PrescriptionCard({
  prescription,
  isSelected,
  isExpanded,
  isEditing,
  onSelect,
  onToggleExpand,
  onToggleEdit,
  customerId,
}: PrescriptionCardProps) {
  const t = useTranslations("orders.actions");

  const examDate = new Date(
    prescription.exam_date || prescription.created_at,
  ).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      className={`transition-all overflow-hidden ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
      }`}
    >
      <CardHeader
        className="py-3 px-4 cursor-pointer flex flex-row items-center justify-between"
        onClick={onSelect}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? "bg-primary border-primary"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            {isSelected && <Check size={12} className="text-white" />}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
              {examDate}
            </span>
            <span className="text-xs text-secondary">#{prescription.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleEdit();
              }}
              className="h-8 px-3"
            >
              {isEditing ? (
                <>
                  <X size={14} className="mx-1" />
                  {t("cancel")}
                </>
              ) : (
                <>
                  <Edit3 size={14} className="mx-1" />
                  {t("edit")}
                </>
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </CardHeader>

      {!isExpanded && (
        <CardContent className="py-2 px-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 text-xs">
            <div>
              <span className="font-medium text-primary">OD: </span>
              <span className="text-secondary">
                {prescription.right_sph || "—"} /{" "}
                {prescription.right_cyl || "—"} ×{" "}
                {prescription.right_axis || "—"}°
              </span>
            </div>
            <div>
              <span className="font-medium text-primary">OS: </span>
              <span className="text-secondary">
                {prescription.left_sph || "—"} / {prescription.left_cyl || "—"}{" "}
                × {prescription.left_axis || "—"}°
              </span>
            </div>
          </div>
        </CardContent>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <EyeTest
                alias="prescriptions_prescription_update"
                title="Edit Prescription"
                message="Prescription updated successfully"
                submitText={isEditing ? "Save Changes" : ""}
                id={prescription.id}
                isView={!isEditing}
                showContactLens={false}
                customerId={customerId || undefined}
                disableCustomerSelect={true}
              />
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function CustomerAndPrescriptionStep() {
  const t = useTranslations("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const store = useOrderFormStore();

  // Prescription state
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewPrescription, setShowNewPrescription] = useState(false);

  // Search customers
  const { query: customerQuery, isBusy: isCustomerBusy } = useApiForm({
    alias: "crm_customers_list",
    defaultValues: { search: searchTerm, page_size: 10 },
    enabled: searchTerm.length >= 2,
  });

  // Fetch prescriptions
  const { query: prescriptionQuery, isBusy: isPrescriptionBusy } = useApiForm({
    alias: "prescriptions_prescription_list",
    defaultValues: { customer: store.customerId, page_size: 20 },
    enabled: !!store.customerId,
  });

  useEffect(() => {
    if (searchTerm.length >= 2) {
      customerQuery.refetch();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (customerQuery.data?.results) {
      setCustomers(customerQuery.data.results);
    }
  }, [customerQuery.data]);

  // Refetch prescriptions when customer changes
  useEffect(() => {
    if (store.customerId) {
      setPrescriptions([]);
      setExpandedId(null);
      setEditingId(null);
      setShowNewPrescription(false);
      store.setPrescription(null);
      prescriptionQuery.refetch();
    }
  }, [store.customerId]);

  useEffect(() => {
    if (prescriptionQuery.data?.results) {
      setPrescriptions(prescriptionQuery.data.results);
      if (prescriptionQuery.data.results.length === 0) {
        setShowNewPrescription(true);
      }
    }
  }, [prescriptionQuery.data]);

  const handleSelectCustomer = (customer: any) => {
    store.setCustomer(
      customer.id,
      customer.full_name || `${customer.first_name} ${customer.last_name}`,
    );
    setSearchTerm("");
    setCustomers([]);
  };

  const handleSelectPrescription = (id: number) => {
    const newId = store.prescriptionId === id ? null : id;
    store.setPrescription(newId);
    if (newId) setExpandedId(newId);
  };

  const handleToggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    if (expandedId === id) setEditingId(null);
  };

  const handleToggleEdit = (id: number) => {
    setEditingId(editingId === id ? null : id);
  };

  // Invoice Types
  const { query: invoiceTypesQuery } = useApiForm({
    alias: "sales_invoice_types_list",
    defaultValues: { is_active: true },
  });

  // Insurance Links (Customer Partner Links)
  const { query: insuranceLinksQuery } = useApiForm({
    alias: "crm_customer_partner_links_list",
    defaultValues: { customer: store.customerId, is_active: true },
    enabled: !!store.customerId,
  });

  // Effects to handle Invoice Type selection
  const handleSelectInvoiceType = (type: any) => {
    store.setInvoiceType(type.id);

    // Auto-set order type
    if (type.code === "insurance" || type.code?.includes("insurance")) {
      // Robust check
      store.setOrderType("insurance");
    } else {
      store.setOrderType("cash"); // Default
    }
  };

  const selectedInvoiceType = invoiceTypesQuery.data?.results?.find(
    (t: any) => t.id === store.invoiceTypeId,
  );

  const isInsurance =
    selectedInvoiceType?.code === "insurance" ||
    selectedInvoiceType?.code?.includes("insurance");

  return (
    <div className="space-y-8">
      {/* Customer Section */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <User size={20} />
          {t("customer.title")}
          <ActionButton
            variant="success"
            icon={<User size={18} />}
            onClick={() => setShowCustomerModal(true)}
          />
        </Label>

        {store.customerId ? (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <UserCheck size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{store.customerName}</p>
                  <p className="text-sm text-secondary">
                    {t("customer.selected")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  store.setCustomer(null, "");
                  store.setPrescription(null);
                  setPrescriptions([]);
                }}
                className="text-sm text-red-500 hover:text-red-700"
              >
                {t("customer.change")}
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder={t("customer.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />

            {searchTerm.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-elevated rounded-lg shadow-lg border max-h-60 overflow-y-auto">
                {isCustomerBusy ? (
                  <div className="p-4 text-center">
                    <SectionLoading height="h-32" />
                  </div>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full px-4 py-3 text-right hover:bg-gray-100 dark:hover:bg-gray-800 border-b last:border-0"
                    >
                      <p className="font-medium">
                        {customer.full_name ||
                          `${customer.first_name} ${customer.last_name}`}
                      </p>
                      <p className="text-sm text-secondary">
                        {customer.phone || customer.email}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-center text-secondary">
                    {t("customer.noResults")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prescription Section - Only visible if customer selected */}
      <AnimatePresence>
        {store.customerId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <FileText size={20} />
                {t("prescription.title")}
              </Label>

              <div className="flex gap-2">
                {prescriptions.length > 0 && !showNewPrescription && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewPrescription(true)}
                    className="gap-2"
                  >
                    <Plus size={16} />
                    {t("prescription.new")}
                  </Button>
                )}
              </div>
            </div>

            {isPrescriptionBusy ? (
              <div className="space-y-3">
                <SkeletonGroup type="card" count={2} />
              </div>
            ) : (
              <div className="space-y-4">
                {/* New Prescription Form */}
                <AnimatePresence>
                  {showNewPrescription && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Plus size={18} className="text-primary" />
                            <span className="font-semibold text-primary">
                              {t("prescription.new")}
                            </span>
                          </div>
                          {prescriptions.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowNewPrescription(false)}
                              className="h-8 w-8 p-0"
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </CardHeader>
                        <CardContent className="pt-4 border-t border-primary/20">
                          <EyeTest
                            alias="prescriptions_prescription_create"
                            title={t("prescription.new")}
                            message="Prescription saved"
                            submitText="Save Prescription"
                            isView={false}
                            showContactLens={false}
                            customerId={store.customerId || undefined}
                            disableCustomerSelect={true}
                            onSaveSuccess={(newPrescription) => {
                              setPrescriptions((prev) => [
                                newPrescription,
                                ...prev,
                              ]);
                              store.setPrescription(newPrescription.id);
                              setShowNewPrescription(false);
                              prescriptionQuery.refetch();
                            }}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Existing Prescriptions List */}
                {prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    <Label className="text-sm text-secondary">
                      {t("prescription.previous")} ({prescriptions.length})
                    </Label>

                    {prescriptions.map((prescription) => (
                      <PrescriptionCard
                        key={prescription.id}
                        prescription={prescription}
                        isSelected={store.prescriptionId === prescription.id}
                        isExpanded={expandedId === prescription.id}
                        isEditing={editingId === prescription.id}
                        onSelect={() =>
                          handleSelectPrescription(prescription.id)
                        }
                        onToggleExpand={() =>
                          handleToggleExpand(prescription.id)
                        }
                        onToggleEdit={() => handleToggleEdit(prescription.id)}
                        customerId={store.customerId}
                      />
                    ))}
                  </div>
                ) : (
                  !showNewPrescription && (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <FileText
                        size={48}
                        className="mx-auto text-gray-300 mb-4"
                      />
                      <p className="text-secondary mb-4">
                        {t("prescription.noPrescriptions")}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowNewPrescription(true)}
                        className="gap-2"
                      >
                        <Plus size={16} />
                        {t("prescription.new")}
                      </Button>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>{t("prescription.skipNote")}</strong>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Type Section - Always visible */}
      <div className="space-y-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <FileText size={20} />
          {t("details.invoiceType")}
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {invoiceTypesQuery.isLoading ? (
            <SkeletonGroup type="card" count={3} />
          ) : (
            invoiceTypesQuery.data?.results?.map((type: any) => (
              <div
                key={type.id}
                onClick={() => handleSelectInvoiceType(type)}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  store.invoiceTypeId === type.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{type.name}</span>
                  {store.invoiceTypeId === type.id && (
                    <Check size={16} className="text-primary" />
                  )}
                </div>
                <p className="text-xs text-secondary">{type.code}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Insurance Details Section */}
      <AnimatePresence>
        {isInsurance && store.customerId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700"
          >
            <Label className="text-lg font-semibold flex items-center gap-2 text-blue-600">
              <Sparkles size={20} />
              {t("details.insurance")}
            </Label>

            {insuranceLinksQuery.isLoading ? (
              <SkeletonGroup type="card" count={1} />
            ) : (insuranceLinksQuery.data?.results?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insuranceLinksQuery.data?.results?.map((link: any) => (
                  <div
                    key={link.id}
                    onClick={() => store.setCustomerPartnerLink(link.id)}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                      store.customerPartnerLinkId === link.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{link.partner_name}</p>
                        <p className="text-sm text-secondary">
                          Policy: {link.policy_number}
                        </p>
                      </div>
                      {store.customerPartnerLinkId === link.id && (
                        <Check size={18} className="text-blue-500" />
                      )}
                    </div>
                    <div className="mt-2 text-xs grid grid-cols-2 gap-2 text-secondary">
                      <span>Limit: {link.annual_limit}</span>
                      <span>Rem: {link.remaining_limit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                No active insurance found for this customer. Please add one in
                CRM.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showCustomerModal && (
        <DynamicFormDialog
          entity={"crm-customers"}
          onClose={() => {
            setShowCustomerModal(false);
            if (searchTerm.length >= 2) customerQuery.refetch();
          }}
        />
      )}
    </div>
  );
}
