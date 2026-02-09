"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { safeToast } from "@/src/shared/utils/safeToast";
import api from "@/src/shared/api/axios";
import { handleServerErrors } from "@/src/shared/utils/handleServerErrors";
import { handleErrorStatus } from "@/src/shared/utils/handleErrorStatus";

import { PaymentForm, paymentSchema } from "../components/PaymentForm";

export default function PaymentEditPage() {
  const t = useTranslations("payments");
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: payment, isLoading: isLoadingData } = useQuery({
    queryKey: ["sales_payments_retrieve", id],
    queryFn: () => api.customRequest("sales_payments_retrieve", { id }),
    enabled: !!id,
  });

  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      currency: "SAR",
    },
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (payment) {
      form.reset({
        amount: payment.amount,
        currency: payment.currency,
        payment_method: String(payment.payment_method),
        invoice: payment.invoice ? String(payment.invoice) : undefined,
        notes: payment.notes,
        // Map other fields if they exist in response
        transfer_reference: payment.transfer_reference,
        transfer_bank: payment.transfer_bank,
        cheque_number: payment.cheque_number,
        cheque_bank: payment.cheque_bank,
        cheque_date: payment.cheque_date,
        card_last_four: payment.card_last_four,
      });
    }
  }, [payment, form]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      api.customRequest("sales_payments_partial_update", { id, ...data }),
    onSuccess: () => {
      safeToast.success(
        t("update_success", { fallback: "Payment updated successfully" }),
      );
      queryClient.invalidateQueries({ queryKey: ["sales_payments_list"] });
      queryClient.invalidateQueries({
        queryKey: ["sales_payments_retrieve", id],
      });
      router.push("/dashboard/payments?tab=sales-payments");
    },
    onError: (error: any) => {
      handleServerErrors(error, form.setError);
      const msg = handleErrorStatus(error);
      safeToast.error(msg);
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (isLoadingData) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <SectionLoading />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <ActionButton
          variant="secondary"
          icon={<ArrowLeft size={18} />}
          onClick={() => router.back()}
        />
        <div>
          <h1 className="text-2xl font-bold text-main">
            {t("edit_payment", { fallback: "Edit Payment" })}
          </h1>
          <p className="text-secondary text-sm">
            {t("edit_payment_desc", { fallback: "Update payment details" })}
          </p>
        </div>
      </div>

      <GlassCard>
        <PaymentForm
          form={form}
          onSubmit={onSubmit}
          isLoading={mutation.isPending}
        />
      </GlassCard>
    </div>
  );
}
