"use client";

import React from "react";
import {
  CheckCircle,
  Warehouse,
  Package,
  ArrowUpCircle,
  Hash,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useInventoryFormStore } from "../../../store";
import { useTranslations } from "next-intl";

export function ReviewStep() {
  const t = useTranslations("inventory");
  const store = useInventoryFormStore();

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case "purchase":
        return {
          label: t("add.reviewStep.types.purchase"),
          color: "text-green-600",
        };
      case "adjustment":
        return {
          label: t("add.reviewStep.types.adjustment"),
          color: "text-blue-600",
        };
      case "damage":
        return {
          label: t("add.reviewStep.types.damage"),
          color: "text-red-600",
        };
      case "return":
        return {
          label: t("add.reviewStep.types.return"),
          color: "text-amber-600",
        };
      default:
        return { label: type, color: "text-gray-600" };
    }
  };

  const typeInfo = getMovementTypeLabel(store.movementType);

  const isComplete =
    store.branchId &&
    (store.variantId || store.stockId) &&
    store.quantity > 0 &&
    (store.movementType !== "purchase" || store.costPerUnit > 0);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div
        className={`p-4 rounded-xl flex items-start gap-3 ${
          isComplete
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        }`}
      >
        {isComplete ? (
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <h3
            className={`font-semibold ${
              isComplete
                ? "text-green-800 dark:text-green-200"
                : "text-amber-800 dark:text-amber-200"
            }`}
          >
            {isComplete
              ? t("add.reviewStep.ready")
              : t("add.reviewStep.incomplete")}
          </h3>
          <p
            className={`text-sm ${
              isComplete
                ? "text-green-700 dark:text-green-300"
                : "text-amber-700 dark:text-amber-300"
            }`}
          >
            {isComplete
              ? t("add.reviewStep.readyDesc")
              : t("add.reviewStep.incompleteDesc")}
          </p>
        </div>
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Branch */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-secondary">
                {t("add.reviewStep.branch")}
              </p>
              <p className="font-semibold text-main">
                {store.branchName || t("add.reviewStep.notSelected")}
              </p>
            </div>
          </div>
        </div>

        {/* Product */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-secondary">
                {t("add.reviewStep.product")}
              </p>
              <p className="font-semibold text-main">
                {store.variantName || t("add.reviewStep.notSelected")}
              </p>
              {store.variantSku && (
                <p className="text-xs text-gray-500">SKU: {store.variantSku}</p>
              )}
            </div>
          </div>
        </div>

        {/* Movement Type */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-secondary">
                {t("add.reviewStep.movementType")}
              </p>
              <p className={`font-semibold ${typeInfo.color}`}>
                {typeInfo.label}
              </p>
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Hash className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-secondary">
                {t("add.reviewStep.quantity")}
              </p>
              <p className="font-semibold text-main text-xl">
                {store.quantity || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Details (for purchase) */}
      {store.movementType === "purchase" && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              {t("add.reviewStep.costDetails.title")}
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-green-700 dark:text-green-300">
                {t("add.reviewStep.costDetails.unitPrice")}
              </p>
              <p className="font-bold text-green-800 dark:text-green-200">
                {store.costPerUnit.toFixed(2)} {t("info.currency")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-green-700 dark:text-green-300">
                {t("add.reviewStep.costDetails.quantity")}
              </p>
              <p className="font-bold text-green-800 dark:text-green-200">
                × {store.quantity}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-green-700 dark:text-green-300">
                {t("add.reviewStep.costDetails.total")}
              </p>
              <p className="font-bold text-2xl text-green-800 dark:text-green-200">
                {(store.quantity * store.costPerUnit).toFixed(2)}{" "}
                {t("info.currency")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reference & Notes */}
      {(store.referenceNumber || store.notes) && (
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-500" />
            <h4 className="font-medium text-main">
              {t("add.reviewStep.additionalInfo")}
            </h4>
          </div>
          {store.referenceNumber && (
            <div className="mb-2">
              <span className="text-sm text-secondary">
                {t("add.reviewStep.reference")}
              </span>
              <span className="text-sm font-medium text-main">
                {store.referenceNumber}
              </span>
            </div>
          )}
          {store.notes && (
            <div>
              <span className="text-sm text-secondary">
                {t("add.reviewStep.notes")}
              </span>
              <span className="text-sm text-main">{store.notes}</span>
            </div>
          )}
        </div>
      )}

      {/* After Movement Preview */}
      {store.stockId && store.currentQuantity >= 0 && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
            {t("add.reviewStep.stockChange")}
          </h4>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {t("add.reviewStep.before")}
              </p>
              <p className="font-bold text-xl text-blue-800 dark:text-blue-200">
                {store.currentQuantity}
              </p>
            </div>
            <div className="text-2xl text-blue-500">→</div>
            <div className="text-center">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {t("add.reviewStep.after")}
              </p>
              <p className="font-bold text-2xl text-blue-800 dark:text-blue-200">
                {["purchase", "adjustment", "return"].includes(
                  store.movementType,
                )
                  ? store.currentQuantity + store.quantity
                  : Math.max(0, store.currentQuantity - store.quantity)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
