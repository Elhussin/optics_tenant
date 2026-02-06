"use client";

import React, { useState, useMemo } from "react";
import {
  Warehouse,
  MapPin,
  Search,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import { useTransferFormStore } from "../../../store";
import useSWR from "swr";
import api from "@/src/shared/api/axios";
import { extractArrayData } from "@/src/shared/utils/apiHelpers";
import { useTranslations } from "next-intl";

interface Branch {
  id: number;
  name: string;
  branch_code: string;
  branch_type: "store" | "branch";
  city: string;
  address: string;
}

export function BranchesStep() {
  const t = useTranslations("inventory");
  const store = useTransferFormStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSelection, setActiveSelection] = useState<"from" | "to">("from");

  // Fetch all branches
  const { data: branches = [], isLoading } = useSWR<Branch[]>(
    "branches_branches_list",
    async () => {
      const response = await api.customRequest("branches_branches_list", {});
      return extractArrayData<Branch>(response);
    },
    { revalidateOnFocus: false },
  );

  // Filter branches by search - with safe array check
  const filteredBranches = useMemo(() => {
    if (!branches || !Array.isArray(branches)) return [];

    return branches.filter(
      (branch) =>
        branch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.branch_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.city?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [branches, searchQuery]);

  const handleSelectBranch = (branch: Branch) => {
    if (activeSelection === "from") {
      store.setFromBranch(branch.id, branch.name);
      // Clear items if changing from branch
      if (store.items.length > 0) {
        store.setItems([]);
      }
    } else {
      store.setToBranch(branch.id, branch.name);
    }
  };

  const getBranchTypeLabel = (type: string) => {
    return type === "store"
      ? t("transfers.create.branchesStep.store")
      : t("transfers.create.branchesStep.branch");
  };

  const getBranchTypeColor = (type: string) => {
    return type === "store"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Warehouse className="w-12 h-12 text-gray-300" />
          <p className="text-secondary">
            {t("transfers.create.branchesStep.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Branches Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* From Branch */}
        <div
          onClick={() => setActiveSelection("from")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            activeSelection === "from"
              ? "border-primary bg-primary/5"
              : "border-gray-200 dark:border-gray-700"
          }`}
        >
          <Label className="text-xs text-secondary">
            {t("transfers.create.branchesStep.fromBranch")}
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <Warehouse className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-main">
              {store.fromBranchName ||
                t("transfers.create.branchesStep.selectSender")}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-gray-500 rotate-180" />
          </div>
        </div>

        {/* To Branch */}
        <div
          onClick={() => setActiveSelection("to")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            activeSelection === "to"
              ? "border-primary bg-primary/5"
              : "border-gray-200 dark:border-gray-700"
          }`}
        >
          <Label className="text-xs text-secondary">
            {t("transfers.create.branchesStep.toBranch")}
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <Warehouse className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-main">
              {store.toBranchName ||
                t("transfers.create.branchesStep.selectReceiver")}
            </span>
          </div>
        </div>
      </div>

      {/* Warning if same branch */}
      {store.fromBranchId &&
        store.toBranchId &&
        store.fromBranchId === store.toBranchId && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">
              {t("transfers.create.branchesStep.sameBranchError")}
            </span>
          </div>
        )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder={t("transfers.create.branchesStep.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Selection Label */}
      <div className="text-sm text-secondary">
        {t("transfers.create.branchesStep.select")}{" "}
        <span className="font-medium text-primary">
          {activeSelection === "from"
            ? t("transfers.create.branchesStep.sender")
            : t("transfers.create.branchesStep.receiver")}
        </span>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
        {filteredBranches?.map((branch) => {
          const isSelected =
            (activeSelection === "from" && store.fromBranchId === branch.id) ||
            (activeSelection === "to" && store.toBranchId === branch.id);

          const isDisabled =
            (activeSelection === "from" && store.toBranchId === branch.id) ||
            (activeSelection === "to" && store.fromBranchId === branch.id);

          return (
            <div
              key={branch.id}
              onClick={() => !isDisabled && handleSelectBranch(branch)}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700"
                  : isSelected
                  ? "border-primary bg-primary/5 shadow-md cursor-pointer"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary/50 cursor-pointer hover:shadow-md"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                  branch.branch_type === "store"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                }`}
              >
                <Warehouse className="w-5 h-5" />
              </div>

              {/* Content */}
              <h3 className="font-semibold text-main">{branch.name}</h3>
              <p className="text-sm text-secondary">{branch.branch_code}</p>

              {branch.city && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{branch.city}</span>
                </div>
              )}

              {/* Type Badge */}
              <span
                className={`absolute top-3 right-3 px-2 py-0.5 text-xs rounded-full ${getBranchTypeColor(
                  branch.branch_type,
                )}`}
              >
                {getBranchTypeLabel(branch.branch_type)}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}

              {/* Disabled indicator */}
              {isDisabled && (
                <div className="absolute inset-0 rounded-xl bg-gray-100/50 dark:bg-gray-900/50 flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    {activeSelection === "from"
                      ? t("transfers.create.branchesStep.receiverLabel")
                      : t("transfers.create.branchesStep.senderLabel")}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBranches?.length === 0 && (
        <div className="text-center py-8">
          <Warehouse className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-secondary">
            {t("transfers.create.branchesStep.noResults")}
          </p>
        </div>
      )}
    </div>
  );
}
