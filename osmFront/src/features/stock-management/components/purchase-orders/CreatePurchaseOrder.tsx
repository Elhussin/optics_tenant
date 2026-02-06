"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  Trash2,
  Package,
  Truck,
  FileText,
  Receipt,
  Edit3,
  Loader2,
} from "lucide-react";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { safeToast } from "@/src/shared/utils/safeToast";
import { formsConfig } from "@/src/shared/constants/entityConfig";
import { ProductVariantSelect } from "../shared";
import { SearchableSelect } from "@/src/shared/components/field/Fields";
import api from "@/src/shared/api/axios";

interface PurchaseOrderItem {
  variant: number;
  variant_name: string;
  product_name: string;
  quantity_ordered: number;
  unit_cost: number;
}

interface Supplier {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
  branch_type: string;
}

interface ProductVariant {
  id: number;
  sku: string;
  product: { name: string };
  selling_price: number;
}

interface CreatePurchaseOrderProps {
  mode?: "create" | "edit";
  initialData?: {
    id: number;
    supplier: number;
    branch: number;
    order_date: string;
    expected_date: string;
    notes: string;
    items: PurchaseOrderItem[];
  };
}

export default function CreatePurchaseOrder({
  mode = "create",
  initialData,
}: CreatePurchaseOrderProps) {
  const t = useTranslations("inventory");
  const router = useRouter();
  const isEditMode = mode === "edit";

  // Form state
  const [supplier, setSupplier] = useState<number | null>(null);
  const [branch, setBranch] = useState<number | null>(null);
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current item being added
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  // Load initial data for edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setSupplier(initialData.supplier);
      setBranch(initialData.branch);
      setOrderDate(
        initialData.order_date || new Date().toISOString().split("T")[0],
      );
      setExpectedDate(initialData.expected_date || "");
      setNotes(initialData.notes || "");
      setItems(initialData.items || []);
    }
  }, [isEditMode, initialData]);

  // Fetch suppliers
  const suppliersQuery = useApiForm({
    alias: formsConfig.suppliers.listAlias,
    defaultValues: {},
    enabled: true,
  });

  // Fetch branches (stores only)
  const branchesQuery = useApiForm({
    alias: formsConfig.branches.listAlias,
    defaultValues: {},
    enabled: true,
  });

  // Fetch product variants
  const variantsQuery = useApiForm({
    alias: "products_variants_list",
    defaultValues: {},
    enabled: true,
  });

  // Create mutation
  const createMutation = useApiForm({
    alias: "products_purchase_orders_create",
    defaultValues: {},
    enabled: false,
  });

  const suppliers: Supplier[] = useMemo(() => {
    const data = suppliersQuery.query.data as any;
    return data?.results || data || [];
  }, [suppliersQuery.query.data]);

  const branches: Branch[] = useMemo(() => {
    const data = branchesQuery.query.data as any;
    const all = data?.results || data || [];
    return all.filter((b: Branch) => b.branch_type === "store");
  }, [branchesQuery.query.data]);

  const variants: ProductVariant[] = useMemo(() => {
    const data = variantsQuery.query.data as any;
    return data?.results || data || [];
  }, [variantsQuery.query.data]);

  // Convert to options format for SearchableSelect
  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({ value: s.id, label: s.name })),
    [suppliers],
  );

  const branchOptions = useMemo(
    () => branches.map((b) => ({ value: b.id, label: b.name })),
    [branches],
  );

  const selectedVariantData = useMemo(() => {
    return variants.find((v) => v.id === selectedVariant);
  }, [variants, selectedVariant]);

  const totalAmount = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.quantity_ordered * item.unit_cost,
      0,
    );
  }, [items]);

  const handleAddItem = () => {
    if (!selectedVariant || quantity <= 0 || unitCost <= 0) {
      safeToast(t("purchaseOrders.errors.invalidItem"), { type: "error" });
      return;
    }

    const variantData = variants.find((v) => v.id === selectedVariant);
    if (!variantData) return;

    // Check if already added
    if (items.some((item) => item.variant === selectedVariant)) {
      safeToast(t("purchaseOrders.errors.duplicateItem"), { type: "error" });
      return;
    }

    setItems([
      ...items,
      {
        variant: selectedVariant,
        variant_name: variantData.sku,
        product_name: variantData.product?.name || "",
        quantity_ordered: quantity,
        unit_cost: unitCost,
      },
    ]);

    // Reset
    setSelectedVariant(null);
    setQuantity(1);
    setUnitCost(0);
  };

  const handleRemoveItem = (variantId: number) => {
    setItems(items.filter((item) => item.variant !== variantId));
  };

  const handleSubmit = async () => {
    if (!supplier) {
      safeToast(t("purchaseOrders.errors.selectSupplier"), { type: "error" });
      return;
    }
    if (!branch) {
      safeToast(t("purchaseOrders.errors.selectBranch"), { type: "error" });
      return;
    }
    if (items.length === 0) {
      safeToast(t("purchaseOrders.errors.noItems"), { type: "error" });
      return;
    }

    const payload = {
      supplier,
      branch,
      order_date: orderDate,
      expected_date: expectedDate || null,
      notes,
      items: items.map((item) => ({
        variant: item.variant,
        quantity_ordered: item.quantity_ordered,
        unit_cost: item.unit_cost,
      })),
    };

    setIsSubmitting(true);

    try {
      if (isEditMode && initialData) {
        // Update existing order
        await api.customRequest("products_purchase_orders_partial_update", {
          id: initialData.id,
          ...payload,
        });
        safeToast(
          t("purchaseOrders.edit.success") || "تم تحديث أمر الشراء بنجاح",
          { type: "success" },
        );
        router.push(
          `/dashboard/stock-management/purchase-orders/${initialData.id}`,
        );
      } else {
        // Create new order
        await createMutation.mutation.mutateAsync(payload as any);
        safeToast(t("purchaseOrders.createSuccess"), { type: "success" });
        router.push("/dashboard/stock-management/purchase-orders");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        (isEditMode
          ? t("purchaseOrders.edit.error") || "فشل تحديث أمر الشراء"
          : t("purchaseOrders.createError"));
      safeToast(message, { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-main mb-2 flex items-center gap-3">
            {isEditMode ? (
              <>
                <Edit3 className="w-8 h-8 text-primary" />
                {t("purchaseOrders.edit.title") || "تعديل أمر الشراء"}
              </>
            ) : (
              t("purchaseOrders.create.title")
            )}
          </h1>
          <p className="text-secondary">
            {isEditMode
              ? t("purchaseOrders.edit.description") ||
                "تعديل بيانات أمر الشراء"
              : t("purchaseOrders.create.description")}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-main/10 overflow-hidden">
          {/* Order Info Section */}
          <div className="p-6 border-b border-main/10">
            <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t("purchaseOrders.create.orderInfo")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  {t("purchaseOrders.fields.supplier")} *
                </label>
                <SearchableSelect
                  fieldRow={
                    {
                      name: "supplier",
                      label: t("purchaseOrders.fields.supplier"),
                      placeholder: t(
                        "purchaseOrders.placeholders.selectSupplier",
                      ),
                    } as any
                  }
                  options={supplierOptions}
                  field={{
                    value: supplier,
                    onChange: (val: number) => setSupplier(val),
                  }}
                />
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  {t("purchaseOrders.fields.branch")} *
                </label>
                <SearchableSelect
                  fieldRow={
                    {
                      name: "branch",
                      label: t("purchaseOrders.fields.branch"),
                      placeholder: t(
                        "purchaseOrders.placeholders.selectBranch",
                      ),
                    } as any
                  }
                  options={branchOptions}
                  field={{
                    value: branch,
                    onChange: (val: number) => setBranch(val),
                  }}
                />
              </div>

              {/* Order Date */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  {t("purchaseOrders.fields.orderDate")}
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-main/20 bg-body text-main 
                    focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Expected Date */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  {t("purchaseOrders.fields.expectedDate")}
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-main/20 bg-body text-main 
                    focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-secondary mb-2">
                {t("purchaseOrders.fields.notes")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-main/20 bg-body text-main 
                  focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                placeholder={t("purchaseOrders.placeholders.notes")}
              />
            </div>
          </div>

          {/* Add Item Section */}
          <div className="p-6 border-b border-main/10 bg-body/50">
            <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {t("purchaseOrders.create.addItem")}
            </h2>

            <div className="grid grid-cols-1 gap-4 items-end">
              {/* Variant Select with Filters */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  {t("purchaseOrders.fields.product")}
                </label>
                <ProductVariantSelect
                  value={selectedVariant}
                  onChange={(id, variantData) => {
                    setSelectedVariant(id);
                    if (variantData)
                      setUnitCost(Number(variantData.selling_price) || 0);
                  }}
                  placeholder={t("purchaseOrders.placeholders.selectProduct")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    {t("purchaseOrders.fields.quantity")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-xl border border-main/20 bg-card text-main 
                    focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                {/* Unit Cost */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    {t("purchaseOrders.fields.unitCost")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-main/20 bg-card text-main 
                    focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <ActionButton
                variant="secondary"
                icon={<Plus size={18} />}
                label={t("purchaseOrders.create.addToOrder")}
                onClick={handleAddItem}
                className="mt-4"
                disabled={!selectedVariant || quantity <= 0 || unitCost <= 0}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="p-6 border-b border-main/10">
            <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              {t("purchaseOrders.create.orderItems")} ({items.length})
            </h2>

            {items.length === 0 ? (
              <div className="text-center py-8 text-secondary">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>{t("purchaseOrders.create.noItems")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.variant}
                    className="flex items-center justify-between p-4 bg-body rounded-xl border border-main/10"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-main">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-secondary">
                        SKU: {item.variant_name}
                      </p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm text-secondary">
                        {t("purchaseOrders.fields.quantity")}
                      </p>
                      <p className="font-semibold text-main">
                        {item.quantity_ordered}
                      </p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm text-secondary">
                        {t("purchaseOrders.fields.unitCost")}
                      </p>
                      <p className="font-semibold text-main">
                        {item.unit_cost.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm text-secondary">
                        {t("purchaseOrders.fields.lineTotal")}
                      </p>
                      <p className="font-semibold text-primary">
                        {(item.quantity_ordered * item.unit_cost).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.variant)}
                      className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-end pt-4 border-t border-main/10">
                  <div className="text-right">
                    <p className="text-secondary">
                      {t("purchaseOrders.fields.total")}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 bg-body/50 flex justify-end gap-4">
            <ActionButton
              variant="outline"
              label={t("common.cancel")}
              onClick={() => router.back()}
            />
            <ActionButton
              variant="primary"
              icon={
                isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : isEditMode ? (
                  <Edit3 size={18} />
                ) : (
                  <Truck size={18} />
                )
              }
              label={
                isEditMode
                  ? t("purchaseOrders.edit.submit") || "حفظ التعديلات"
                  : t("purchaseOrders.create.submit")
              }
              onClick={handleSubmit}
              disabled={
                !supplier ||
                !branch ||
                items.length === 0 ||
                isSubmitting ||
                createMutation.mutation.isPending
              }
              className="shadow-lg shadow-primary/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
