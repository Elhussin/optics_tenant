"use client";

import React from "react";
import {
  CheckCircle,
  Warehouse,
  Package,
  ArrowRight,
  Hash,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/src/shared/components/shadcn/ui/textarea";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import { useTransferFormStore } from "../../../store";

export function TransferReviewStep() {
  const t = useTranslations("inventory");
  const store = useTransferFormStore();

  const isComplete =
    store.fromBranchId &&
    store.toBranchId &&
    store.fromBranchId !== store.toBranchId &&
    store.items.length > 0;

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
              ? t("transfers.create.reviewStep.ready")
              : t("transfers.create.reviewStep.incomplete")}
          </h3>
          <p
            className={`text-sm ${
              isComplete
                ? "text-green-700 dark:text-green-300"
                : "text-amber-700 dark:text-amber-300"
            }`}
          >
            {isComplete
              ? t("transfers.create.reviewStep.readyDesc")
              : t("transfers.create.reviewStep.incompleteDesc")}
          </p>
        </div>
      </div>

      {/* Transfer Route */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-4">
          {/* From Branch */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
              <Warehouse className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-xs text-secondary">
              {t("transfers.create.reviewStep.from")}
            </p>
            <p className="font-semibold text-main">
              {store.fromBranchName ||
                t("transfers.create.reviewStep.notSelected")}
            </p>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-gray-500 rotate-180" />
            </div>
          </div>

          {/* To Branch */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
              <Warehouse className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-secondary">
              {t("transfers.create.reviewStep.to")}
            </p>
            <p className="font-semibold text-main">
              {store.toBranchName ||
                t("transfers.create.reviewStep.notSelected")}
            </p>
          </div>
        </div>
      </div>

      {/* Items Summary */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="font-semibold text-main">
            {t("transfers.create.reviewStep.items")} ({store.items.length})
          </h4>
        </div>

        {store.items.length === 0 ? (
          <p className="text-center text-secondary py-4">
            {t("transfers.create.reviewStep.noItems")}
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {store.items.map((item, index) => (
              <div
                key={item.variantId}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-main">
                    {index + 1}. {item.productName}
                  </p>
                  <p className="text-xs text-secondary">{item.variantSku}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary">
                    {item.quantityRequested}
                  </p>
                  <p className="text-xs text-secondary">
                    {t("transfers.create.reviewStep.fromTotal")}{" "}
                    {item.availableQuantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
          <Hash className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            {t("transfers.create.reviewStep.itemsCount")}
          </p>
          <p className="font-bold text-xl text-blue-800 dark:text-blue-200">
            {store.totalItems}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-center">
          <Package className="w-5 h-5 mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            {t("transfers.create.reviewStep.totalQuantity")}
          </p>
          <p className="font-bold text-xl text-indigo-800 dark:text-indigo-200">
            {store.totalQuantity}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
          <DollarSign className="w-5 h-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
          <p className="text-xs text-green-700 dark:text-green-300">
            {t("transfers.create.reviewStep.estimatedValue")}
          </p>
          <p className="font-bold text-xl text-green-800 dark:text-green-200">
            {store.totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {t("transfers.create.reviewStep.notes")}
        </Label>
        <Textarea
          id="notes"
          value={store.notes}
          onChange={(e) => store.setNotes(e.target.value)}
          placeholder={t("transfers.create.reviewStep.notesPlaceholder")}
          rows={3}
        />
      </div>

      {/* Workflow Info */}
      <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-main mb-3">
          {t("transfers.create.reviewStep.nextSteps")}
        </h4>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <span className="text-secondary">
              {t("transfers.create.reviewStep.step1")}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 rotate-180" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <span className="text-secondary">
              {t("transfers.create.reviewStep.step2")}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 rotate-180" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <span className="text-secondary">
              {t("transfers.create.reviewStep.step3")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
