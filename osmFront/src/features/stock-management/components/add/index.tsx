"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  Trash2,
  Package,
  Warehouse,
  ArrowUpCircle,
  FileText,
  Receipt,
  Check,
  Loader2,
} from "lucide-react";
import useSWR from "swr";
import api from "@/src/shared/api/axios";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { safeToast } from "@/src/shared/utils/safeToast";
import { extractArrayData } from "@/src/shared/utils/apiHelpers";
import {
  formsConfig,
  featuresConfig,
} from "@/src/shared/constants/entityConfig";
import { ProductVariantSelect } from "../shared";

interface StockMovementItem {
  variantId: number;
  variantName: string;
  variantSku: string;
  branchId: number;
  branchName: string;
  stockId: number | null;
  movementType: string;
  quantity: number;
  costPerUnit: number;
  notes: string;
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

interface Stock {
  id: number;
  variant: number;
  branch: number;
  quantity_in_stock: number;
  average_cost: number;
}

const MOVEMENT_TYPES = [
  {
    value: "purchase",
    label: "شراء",
    labelEn: "Purchase",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    value: "adjustment",
    label: "تعديل",
    labelEn: "Adjustment",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    value: "damage",
    label: "تلف",
    labelEn: "Damage",
    color: "text-red-600",
    bg: "bg-red-100",
  },
  {
    value: "return",
    label: "إرجاع",
    labelEn: "Return",
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
];

export function AddInventory() {
  const t = useTranslations("inventory");
  const router = useRouter();

  // Form state
  const [branch, setBranch] = useState<number | null>(null);
  const [movementType, setMovementType] = useState("purchase");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [globalNotes, setGlobalNotes] = useState("");
  const [items, setItems] = useState<StockMovementItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current item being added
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [itemNotes, setItemNotes] = useState("");

  // Fetch branches (stores only)
  const { data: branchesData } = useSWR(
    formsConfig.branches.listAlias,
    async () => {
      const response = await api.customRequest(
        formsConfig.branches.listAlias!,
        {},
      );
      return extractArrayData<Branch>(response);
    },
    { revalidateOnFocus: false },
  );

  // Fetch product variants
  const { data: variantsData } = useSWR(
    "products_variants_list",
    async () => {
      const response = await api.customRequest("products_variants_list", {});
      return extractArrayData<ProductVariant>(response);
    },
    { revalidateOnFocus: false },
  );

  // Fetch stocks for selected branch
  const { data: stocksData } = useSWR(
    branch ? `stocks_branch_${branch}` : null,
    async () => {
      const response = await api.customRequest(
        featuresConfig.stocks.listAlias!,
        { branch },
      );
      return extractArrayData<Stock>(response);
    },
    { revalidateOnFocus: false },
  );

  const branches = useMemo(() => {
    return (branchesData || []).filter(
      (b: Branch) => b.branch_type === "store",
    );
  }, [branchesData]);

  const variants = variantsData || [];
  const stocks = stocksData || [];

  const selectedBranchName = useMemo(() => {
    return branches.find((b: Branch) => b.id === branch)?.name || "";
  }, [branches, branch]);

  const selectedVariantData = useMemo(() => {
    return variants.find((v: ProductVariant) => v.id === selectedVariant);
  }, [variants, selectedVariant]);

  // Find existing stock for variant in selected branch
  const existingStock = useMemo(() => {
    if (!selectedVariant || !branch) return null;
    return stocks.find(
      (s: Stock) => s.variant === selectedVariant && s.branch === branch,
    );
  }, [stocks, selectedVariant, branch]);

  const totalAmount = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Math.abs(item.quantity) * item.costPerUnit,
      0,
    );
  }, [items]);

  const handleAddItem = () => {
    if (!branch) {
      safeToast(t("add.validation.selectBranch"), { type: "error" });
      return;
    }
    if (!selectedVariant) {
      safeToast(t("add.validation.selectProduct"), { type: "error" });
      return;
    }
    if (quantity === 0) {
      safeToast(t("add.validation.invalidQuantity"), { type: "error" });
      return;
    }
    if (movementType === "purchase" && unitCost <= 0) {
      safeToast(t("add.validation.enterCost"), { type: "error" });
      return;
    }

    // Check if already added
    if (items.some((item) => item.variantId === selectedVariant)) {
      safeToast(t("add.validation.duplicateItem") || "Product already added", {
        type: "error",
      });
      return;
    }

    const variantData = variants.find(
      (v: ProductVariant) => v.id === selectedVariant,
    );
    if (!variantData) return;

    setItems([
      ...items,
      {
        variantId: selectedVariant,
        variantName: variantData.product?.name || "",
        variantSku: variantData.sku,
        branchId: branch,
        branchName: selectedBranchName,
        stockId: existingStock?.id || null,
        movementType,
        // Adjustment: keep sign as user entered (can be + or -)
        // Damage: always negative
        // Purchase/Return: always positive
        quantity:
          movementType === "damage"
            ? -Math.abs(quantity)
            : movementType === "adjustment"
            ? quantity // Keep user's input (can be negative)
            : Math.abs(quantity),
        costPerUnit: unitCost,
        notes: itemNotes,
      },
    ]);

    // Reset item fields
    setSelectedVariant(null);
    setQuantity(1);
    setUnitCost(0);
    setItemNotes("");
  };

  const handleRemoveItem = (variantId: number) => {
    setItems(items.filter((item) => item.variantId !== variantId));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      safeToast(t("add.validation.noItems"), { type: "error" });
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const item of items) {
        try {
          let stockId = item.stockId;

          // Create stock record if doesn't exist
          if (!stockId) {
            const stockResponse = await api.customRequest(
              "products_stocks_create",
              {
                branch: item.branchId,
                variant: item.variantId,
                quantity_in_stock: 0,
                reorder_level: 5,
              },
            );
            stockId = stockResponse.id;
          }

          if (!stockId) throw new Error("Stock ID missing");

          // Create movement
          await api.customRequest("products_stock-movements_create", {
            stock: stockId,
            movement_type: item.movementType,
            quantity: item.quantity,
            cost_per_unit: item.costPerUnit || 0,
            reference_number: referenceNumber,
            notes: item.notes || globalNotes,
          });

          successCount++;
        } catch (err) {
          console.error(err);
          failCount++;
        }
      }

      if (successCount > 0) {
        safeToast(t("add.validation.successBatch", { count: successCount }), {
          type: "success",
        });
        router.push("/dashboard/stock-management");
      }

      if (failCount > 0) {
        safeToast(`Failed to process ${failCount} items`, { type: "error" });
      }
    } catch (error: any) {
      safeToast(t("add.validation.error"), { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-main mb-2">
            {t("add.title")}
          </h1>
          <p className="text-secondary">{t("add.subtitle")}</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-main/10 overflow-hidden">
          {/* Order Info Section */}
          <div className="p-6 border-b border-main/10">
            <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t("add.sections.info") || "Movement Info"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  {t("add.fields.branch")} *
                </label>
                <select
                  value={branch || ""}
                  onChange={(e) => setBranch(Number(e.target.value) || null)}
                  className="w-full px-4 py-3 rounded-xl border border-main/20 bg-body text-main 
                    focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="">{t("add.placeholders.selectBranch")}</option>
                  {branches.map((b: Branch) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Movement Type */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  {t("add.fields.movementType")} *
                </label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-main/20 bg-body text-main 
                    focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  {MOVEMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {t(`add.movementTypes.${type.value}`) || type.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  {t("add.fields.referenceNumber")}
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-main/20 bg-body text-main 
                    focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder={t("add.placeholders.referenceNumber")}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  {t("add.fields.notes")}
                </label>
                <input
                  type="text"
                  value={globalNotes}
                  onChange={(e) => setGlobalNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-main/20 bg-body text-main 
                    focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder={t("add.placeholders.notes")}
                />
              </div>
            </div>
          </div>

          {/* Add Item Section */}
          <div className="p-6 border-b border-main/10 bg-body/50">
            <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {t("add.sections.addProduct") || "Add Product"}
            </h2>

            <div className="space-y-4">
              {/* Variant Select with Filters */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  {t("add.fields.product")}
                </label>
                <ProductVariantSelect
                  value={selectedVariant}
                  onChange={(id, variantData) => {
                    setSelectedVariant(id);
                    if (variantData && movementType === "purchase") {
                      setUnitCost(Number(variantData.selling_price) || 0);
                    }
                  }}
                  branchId={branch}
                  placeholder={t("add.placeholders.selectProduct")}
                  disabled={!branch}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    {t("add.fields.quantity")}
                    {movementType === "adjustment" && (
                      <span className="text-xs text-blue-500 mr-2">
                        (
                        {t("add.hints.negativeAllowed") ||
                          "يمكن إدخال قيمة سالبة"}
                        )
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={movementType === "adjustment" ? undefined : "1"}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-main/20 bg-card text-main 
                    focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                {/* Unit Cost (only for purchase) */}
                {movementType === "purchase" && (
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      {t("add.fields.unitCost")}
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
                )}
              </div>

              {/* Existing stock info */}
              {existingStock && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <span className="text-blue-600 dark:text-blue-400">
                    {t("add.currentStock")}: {existingStock.quantity_in_stock}
                  </span>
                </div>
              )}

              <Button
                variant="secondary"
                onClick={handleAddItem}
                className="mt-4 gap-2"
                disabled={!selectedVariant || !branch || quantity === 0}
              >
                <Plus size={18} />
                {t("add.buttons.addToList") || "Add to List"}
              </Button>
            </div>
          </div>

          {/* Items List */}
          <div className="p-6 border-b border-main/10">
            <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              {t("add.sections.items") || "Items"} ({items.length})
            </h2>

            {items.length === 0 ? (
              <div className="text-center py-8 text-secondary">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>{t("add.noItems") || "No items added yet"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center justify-between p-4 bg-body rounded-xl border border-main/10"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-main">
                        {item.variantName}
                      </p>
                      <p className="text-sm text-secondary">
                        SKU: {item.variantSku}
                      </p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm text-secondary">
                        {t("add.fields.quantity")}
                      </p>
                      <p
                        className={`font-semibold ${
                          item.quantity < 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {item.quantity > 0 ? "+" : ""}
                        {item.quantity}
                      </p>
                    </div>
                    {item.costPerUnit > 0 && (
                      <div className="text-center px-4">
                        <p className="text-sm text-secondary">
                          {t("add.fields.unitCost")}
                        </p>
                        <p className="font-semibold text-main">
                          {item.costPerUnit.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <div className="text-center px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          MOVEMENT_TYPES.find(
                            (m) => m.value === item.movementType,
                          )?.bg
                        } ${
                          MOVEMENT_TYPES.find(
                            (m) => m.value === item.movementType,
                          )?.color
                        }`}
                      >
                        {t(`add.movementTypes.${item.movementType}`)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.variantId)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {/* Total (for purchase only) */}
                {movementType === "purchase" && totalAmount > 0 && (
                  <div className="flex justify-end pt-4 border-t border-main/10">
                    <div className="text-right">
                      <p className="text-secondary">{t("add.summary.total")}</p>
                      <p className="text-2xl font-bold text-primary">
                        {totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 bg-body/50 flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              {t("add.buttons.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("add.buttons.saving")}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t("add.buttons.save")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddInventory;
