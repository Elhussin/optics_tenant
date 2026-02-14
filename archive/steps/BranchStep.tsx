"use client";

import React, { useState } from "react";
import { Warehouse, MapPin, Search, CheckCircle } from "lucide-react";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { useInventoryFormStore } from "../../../store";
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

export function BranchStep() {
  const t = useTranslations("inventory");
  const store = useInventoryFormStore();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch only store branches (not regular branches)
  const { data: branches, isLoading } = useSWR<Branch[]>(
    "branches_branches_list",
    async () => {
      const response = await api.customRequest("branches_branches_list", {
        branch_type: "store",
      });
      return extractArrayData<Branch>(response);
    },
    { revalidateOnFocus: false },
  );

  // Filter stores only and by search
  const filteredBranches = branches?.filter(
    (branch) =>
      branch.branch_type === "store" &&
      (branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.branch_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.city?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleSelectBranch = (branch: Branch) => {
    store.setBranch(branch.id, branch.name);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Warehouse className="w-12 h-12 text-gray-300" />
          <p className="text-secondary">{t("add.branchStep.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder={t("add.branchStep.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBranches?.map((branch) => (
          <div
            key={branch.id}
            onClick={() => handleSelectBranch(branch)}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
              store.branchId === branch.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
            }`}
          >
            {/* Selected indicator */}
            {store.branchId === branch.id && (
              <div className="absolute top-3 left-3">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
            )}

            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                store.branchId === branch.id
                  ? "bg-primary text-white"
                  : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <Warehouse className="w-6 h-6" />
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

            {/* Store Badge */}
            <span className="absolute top-3 right-3 px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              {t("add.branchStep.store")}
            </span>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBranches?.length === 0 && (
        <div className="text-center py-12">
          <Warehouse className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-main mb-2">
            {t("add.branchStep.noStores")}
          </h3>
          <p className="text-secondary">
            {searchQuery
              ? t("add.branchStep.noResults")
              : t("add.branchStep.addStoreHint")}
          </p>
        </div>
      )}
    </div>
  );
}
