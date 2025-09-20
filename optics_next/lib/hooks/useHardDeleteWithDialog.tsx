"use client";
import { useState } from "react";
import { safeToast } from "@/utils/toastService";
import { useFormRequest } from "./useFormRequest";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/dialogs/ConfirmDialog";
import { useTranslations } from "next-intl";

type UseHardDeleteWithDialogProps = {
  alias: string;
  onSuccess?: () => void;
  message?: string;
  title?: string;
  redirectAfter?: boolean;
  redirectPath?: string;
};

export function useHardDeleteWithDialog({
  alias,
  onSuccess,
  title = "Confirm Deletion",
  message = "Are you sure you want to permanently delete this item?",
  redirectAfter = true,
  redirectPath = "/",
}: UseHardDeleteWithDialogProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const hardDeleteRequest = useFormRequest({
    alias,
    onError: (err: any) => {
      safeToast(err.response?.data?.detail, { type: "error" });
    },
  });
  const t = useTranslations("useHardDeleteWithDialog");

  const confirmHardDelete = (id: string | number) => {
    setSelectedId(id);
    setShowDialog(true);
  };

  const handleConfirm = async () => {
    if (selectedId) {
      const resualt = await hardDeleteRequest.submitForm({ id: selectedId });
      if (!resualt?.success) {
        safeToast(t("failedMessage"), { type: "error" });
      }
      onSuccess?.();
      safeToast(t("successMessage"), { type: "success" });
      if (window.history.length > 1) {
        // router.back();
        if (redirectAfter) router.back();
      } else {
        router.push(redirectPath);
      }
    }

    setShowDialog(false);
  };

  const ConfirmDialogComponent = (
    <>
      <ConfirmDialog
        open={showDialog}
        title={t("title") ?? title}
        message={t("message") ?? message}
        onCancel={() => setShowDialog(false)}
        onConfirm={handleConfirm}
      />
    </>
  );

  return {
    confirmHardDelete,
    ConfirmDialogComponent,
  };
}
