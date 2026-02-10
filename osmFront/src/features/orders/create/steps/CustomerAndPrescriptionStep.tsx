"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/shadcn/ui/select";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useOrderFormStore } from "../../store/useOrderFormStore";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { Skeleton, SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import EyeTest from "@/src/features/prescription/components/EyeTest";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { InsuranceDetailsForm } from "./InsuranceDetailsForm";
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

// ... imports ...

export function CustomerAndPrescriptionStep() {
  const t = useTranslations("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [showInlineInsuranceForm, setShowInlineInsuranceForm] = useState(false);
  const [isEditingInsurance, setIsEditingInsurance] = useState(false);
  const store = useOrderFormStore();
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
    } else {
      // Reset link if customer removed
      store.setCustomerPartnerLink(null);
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
    store.setCustomerPartnerLink(null); // Reset link on customer change
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

  // Determine Partner Type filter based on Order Type
  const partnerTypeFilter = useMemo(() => {
    switch (store.orderType) {
      case "insurance":
        return "insurance";
      case "corporate":
        return "corporate";
      case "wholesale":
        return "wholesaler"; // Note: model uses 'wholesaler'
      case "bnpl":
        return "bnpl";
      default:
        return undefined;
    }
  }, [store.orderType]);

  // Partners (Insurance Companies, Corporates, etc.)
  const { query: partnersQuery } = useApiForm({
    alias: "crm_partners_list",
    defaultValues: {
      partner_type: partnerTypeFilter,
      is_active: true,
    },
    // Only fetch if we have a valid partner type filter
    enabled: !!store.invoiceTypeId && !!partnerTypeFilter,
  });

  // Insurance Links (Customer Partner Links)
  const { query: insuranceLinksQuery } = useApiForm({
    alias: "crm_customer_partner_links_list",
    defaultValues: { customer: store.customerId, is_active: true },
    enabled: !!store.customerId,
  });

  // Effects to handle Invoice Type selection
  const handleSelectInvoiceType = (type: any) => {
    if (store.invoiceTypeId !== type.id) {
      store.setInvoiceType(type.id);
      store.setPartner(null); // Reset partner
      store.setCustomerPartnerLink(null); // Reset link
    }

    // Auto-set order type
    const code = type.code?.toLowerCase() || "";
    if (code === "insurance" || code.includes("insurance") || code === "1001") {
      store.setOrderType("insurance");
    } else if (code.includes("corporate")) {
      store.setOrderType("corporate");
    } else if (code.includes("wholesale")) {
      store.setOrderType("wholesale");
    } else if (
      code.includes("bnpl") ||
      code.includes("tabby") ||
      code.includes("tamara")
    ) {
      store.setOrderType("bnpl");
    } else {
      store.setOrderType("cash"); // Default
    }
  };

  const selectedInvoiceType = invoiceTypesQuery.data?.results?.find(
    (t: any) => t.id === store.invoiceTypeId,
  );

  // Determine if this invoice type requires a Partner (Insurance, Corporate, etc.)
  const requiresPartner =
    selectedInvoiceType?.code === "insurance" ||
    selectedInvoiceType?.code === "1001" ||
    selectedInvoiceType?.code?.includes("insurance") ||
    selectedInvoiceType?.code?.includes("corporate") ||
    selectedInvoiceType?.code?.includes("wholesale") ||
    selectedInvoiceType?.name?.toLowerCase().includes("insurance") ||
    selectedInvoiceType?.name?.toLowerCase().includes("corporate");

  // Filter links based on selected partner
  const insuranceLinks = insuranceLinksQuery.data?.results || [];
  const selectedPartnerLink = insuranceLinks.find(
    (link: any) => link.partner === store.partnerId,
  );
  useEffect(() => {
    if (store.partnerId && selectedPartnerLink) {
      if (store.customerPartnerLinkId !== selectedPartnerLink.id) {
        store.setCustomerPartnerLink(selectedPartnerLink.id);
      }
      // Update store with insurance details for calculation
      store.setInsuranceDetails({
        patientSharePercentage:
          Number(selectedPartnerLink.patient_share_percentage) || 0,
        maxPatientShare: Number(selectedPartnerLink.max_patient_share) || 0,
      });
    } else if (
      store.partnerId &&
      !selectedPartnerLink &&
      store.customerPartnerLinkId
    ) {
      store.setCustomerPartnerLink(null);
      store.setInsuranceDetails({
        patientSharePercentage: 0,
        maxPatientShare: 0,
      });
    }
  }, [store.partnerId, selectedPartnerLink]);

  return (
    <div className="space-y-8">
      {/* 1. Invoice Type Selection */}
      <div className="space-y-4">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {t("details.invoiceType")}
        </label>
        {invoiceTypesQuery.isLoading ? (
          <SkeletonGroup type="input" count={1} />
        ) : (
          <Select
            value={String(store.invoiceTypeId || "")}
            onValueChange={(val) => {
              const type = invoiceTypesQuery.data?.results?.find(
                (t: any) => String(t.id) === val,
              );
              if (type) handleSelectInvoiceType(type);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("details.selectInvoiceType")} />
            </SelectTrigger>
            <SelectContent>
              {invoiceTypesQuery.data?.results?.map((type: any) => (
                <SelectItem key={type.id} value={String(type.id)}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* 2. Partner Selection (Conditional) */}
      <AnimatePresence>
        {requiresPartner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t("details.partner")}
            </label>
            {partnersQuery.isLoading ? (
              <SkeletonGroup type="input" count={1} />
            ) : (
              <Select
                value={String(store.partnerId || "")}
                onValueChange={(val) => {
                  store.setPartner(Number(val));
                  store.setCustomerPartnerLink(null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("details.selectPartner")} />
                </SelectTrigger>
                <SelectContent>
                  {partnersQuery.data?.results?.map((partner: any) => (
                    <SelectItem key={partner.id} value={String(partner.id)}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Customer Search */}
      <div className="space-y-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-2">
          <Label className="text-base font-semibold">
            {t("details.customer")}
          </Label>

          {!store.customerId ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("details.searchCustomer")}
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {isCustomerBusy && (
                    <div className="absolute right-3 top-2.5">
                      <SectionLoading />
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setShowCustomerModal(true)}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("details.newCustomer")}
                </Button>
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {customers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border rounded-md shadow-sm divide-y max-h-60 overflow-y-auto bg-card"
                  >
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-3 hover:bg-accent cursor-pointer flex items-center justify-between"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div>
                          <p className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-sm text-secondary">
                            {customer.phone}
                          </p>
                        </div>
                        <UserCheck
                          size={16}
                          className="text-muted-foreground"
                        />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">
                      {store.customerName}
                    </h4>
                    <p className="text-xs text-secondary">
                      ID: {store.customerId}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    store.setCustomer(null, "");
                    setCustomers([]);
                    store.setCustomerPartnerLink(null);
                  }}
                >
                  <span className="sr-only">Remove</span>
                  <X size={18} />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Insurance/Partner Link Validation */}
      <AnimatePresence>
        {store.orderType === "insurance" &&
          store.partnerId &&
          store.customerId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700"
            >
              <Label className="text-lg font-semibold flex items-center gap-2 text-blue-600">
                <Sparkles size={20} />
                {t("details.insuranceCoverage")}
              </Label>

              {insuranceLinksQuery.isLoading ? (
                <SkeletonGroup type="card" count={1} />
              ) : selectedPartnerLink && !isEditingInsurance ? (
                // Found Link
                <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg mb-1">
                        {selectedPartnerLink.partner_name}
                      </h4>
                      <div className="text-sm space-y-1">
                        <p className="text-secondary">
                          Policy:{" "}
                          <span className="font-medium text-foreground">
                            {selectedPartnerLink.policy_number}
                          </span>
                        </p>
                        <p className="text-secondary">
                          Member ID:{" "}
                          <span className="font-medium text-foreground">
                            {selectedPartnerLink.membership_number}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                        onClick={() => setIsEditingInsurance(true)}
                      >
                        <Edit3 size={16} />
                      </Button>
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <Check size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Limits & Copay Info */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <div>
                      <span className="text-xs text-secondary block">
                        Annual Limit
                      </span>
                      <span className="font-medium">
                        {selectedPartnerLink.annual_limit || "Limited"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-secondary block">
                        Remaining
                      </span>
                      <span className="font-medium">
                        {selectedPartnerLink.remaining_limit || "Limited"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-secondary block">
                        Patient Share %
                      </span>
                      <span className="font-medium text-blue-700">
                        {selectedPartnerLink.patient_share_percentage}%
                      </span>
                    </div>
                    {/* Show Fixed Copay if exists */}
                    {selectedPartnerLink.max_patient_share > 0 && (
                      <div>
                        <span className="text-xs text-secondary block">
                          Max CapShare
                        </span>
                        <span className="font-medium text-blue-700">
                          {selectedPartnerLink.max_patient_share}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : showInlineInsuranceForm || isEditingInsurance ? (
                <InsuranceDetailsForm
                  customerId={store.customerId}
                  partnerId={store.partnerId}
                  initialData={
                    isEditingInsurance ? selectedPartnerLink : undefined
                  }
                  linkId={
                    isEditingInsurance ? selectedPartnerLink?.id : undefined
                  }
                  onSuccess={() => {
                    setShowInlineInsuranceForm(false);
                    setIsEditingInsurance(false);
                    insuranceLinksQuery.refetch();
                  }}
                  onCancel={() => {
                    setShowInlineInsuranceForm(false);
                    setIsEditingInsurance(false);
                  }}
                />
              ) : (
                // No Link Found - Prompt to Create
                <div className="p-6 border-2 border-dashed border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg text-center space-y-3">
                  <p className="text-yellow-700 dark:text-yellow-400 font-medium">
                    {t("details.noInsuranceLinkFound")}
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="default"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white gap-2"
                      onClick={() => setShowInlineInsuranceForm(true)}
                    >
                      <Plus size={16} />
                      {t("details.linkToPartner")}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
      </AnimatePresence>

      {/* Prescription Section - Only visible if customer selected */}
      <AnimatePresence>
        {store.customerId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700"
          >
            {/* ... Prescription content/header ... */}
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
