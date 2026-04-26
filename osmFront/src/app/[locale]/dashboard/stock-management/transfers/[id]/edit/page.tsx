"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/shared/api/axios";
import { CreateTransfer } from "@/src/features/stock-management/components/transfer";
import { useTransferFormStore } from "@/src/features/stock-management/store";
import { Loader2, AlertCircle } from "lucide-react";
import { safeToast } from "@/src/shared/utils/safeToast";

// Editable statuses
const EDITABLE_STATUSES = ["pending", "approved"];

export default function EditTransferPage() {
  const t = useTranslations("inventory");
  const params = useParams();
  const router = useRouter();
  const store = useTransferFormStore();
  const [isReady, setIsReady] = useState(false);

  const transferId = params.id as string;

  // Fetch transfer data
  const {
    data: transfer,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["transfer", transferId],
    queryFn: async () => {
      const response = await api.customRequest(
        "products_stock_transfers_retrieve",
        {
          id: transferId,
        },
      );
      return response;
    },
    enabled: !!transferId,
    refetchOnWindowFocus: false,
  });

  // Load transfer data into store when fetched
  useEffect(() => {
    if (transfer && !isReady) {
      // Check if status is editable
      if (!EDITABLE_STATUSES.includes(transfer.status)) {
        safeToast(
          t("transfers.edit.notEditable") || "This transfer cannot be edited",
          { type: "error" },
        );
        router.push(`/dashboard/stock-management/transfers`);
        return;
      }

      // Load into store
      store.loadFromTransfer(transfer);
      setIsReady(true);
    }
  }, [transfer, isReady, router, store, t]);

  // Reset store on unmount
  useEffect(() => {
    return () => {
      store.reset();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-secondary">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-main">
            {t("transfers.edit.loadError") || "Failed to load transfer"}
          </h2>
          <p className="text-secondary">
            {error?.message ||
              t("transfers.edit.tryAgain") ||
              "Please try again"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            {t("common.back") || "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return <CreateTransfer mode="edit" transferId={Number(transferId)} />;
}
