"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/shared/components/shadcn/ui/dialog";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Textarea } from "@/src/shared/components/shadcn/ui/textarea";
import { api, axiosInstance } from "@/src/shared/api/axios";
import { safeToast } from "@/src/shared/utils/safeToast";
import { Loader2 } from "lucide-react";

export function IssueCreditNoteDialog({
  open,
  onClose,
  invoice,
}: {
  open: boolean;
  onClose: () => void;
  invoice: any;
}) {
  const t = useTranslations("invoices");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      safeToast(t("errors.reasonRequired") || "Please provide a reason.", { type: "error" });
      return;
    }

    try {
      setIsSubmitting(true);
      // Fallback post since endpoint might not be mapped in schemas yet
      await axiosInstance.post(`/api/sales/invoices/${invoice.id}/credit_note/`, {
        reason,
      });
      safeToast(t("success.creditNoteIssued") || "Credit Note issued successfully!", { type: "success" });
      onClose();
      // Optionally trigger a refresh or window reload
      window.location.reload();
    } catch (error) {
      console.error(error);
      safeToast(t("errors.issueCreditNote") || "Failed to issue Credit Note", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("creditNote.title") || "Issue Credit Note"}</DialogTitle>
          <DialogDescription>
            {t("creditNote.description") ||
              `You are about to issue a credit note for Invoice #${invoice?.invoice_number}. This will create a reversal record.`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("creditNote.reason") || "Reason for Return/Credit"}
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("creditNote.reasonPlaceholder") || "Customer requested refund..."}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("actions.cancel") || "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !reason.trim()} className="bg-amber-600 hover:bg-amber-700">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("actions.confirmIssue") || "Confirm Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
