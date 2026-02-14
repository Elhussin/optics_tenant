"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { safeToast } from "@/src/shared/utils/safeToast";
import { PaymentForm, paymentSchema, PaymentFormValues } from "../components/PaymentForm";

export default function PaymentCreatePage() {
  const t = useTranslations("payments");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutation, ...form } = useApiForm<PaymentFormValues>({
    alias: "sales_payments_create",
    zodSchema: paymentSchema,
    defaultValues: {
      amount: "",
      currency: "SAR",
      payment_method: "",
    },
    onSuccess: () => {
      safeToast(t("create_success"), { type: "success" });
      queryClient.invalidateQueries({ queryKey: ["sales_payments_list"] });
      queryClient.invalidateQueries({ queryKey: ["sales_payments_stats"] });
      router.push("/dashboard/payments?tab=sales-payments");
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    mutation.mutate(data);
  };

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
            {t("create_payment", { fallback: "Create Payment" })}
          </h1>
          <p className="text-secondary text-sm">
            {t("create_payment_desc", {
              fallback: "Record a new payment transaction",
            })}
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
