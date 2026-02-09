"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { safeToast } from "@/src/shared/utils/safeToast";
import { PaymentForm, paymentSchema } from "../components/PaymentForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function PaymentCreatePage() {
  const t = useTranslations("payments");
  const router = useRouter();

  // We use useApiForm for the mutation logic mainly,
  // but since we want full control over the form with Zod schema from the start,
  // we can just use useForm standard and useApiForm for submission or just mutation.
  // Actually, useApiForm is convenient. Let's see if we can use it.
  // useApiForm takes 'alias'. If we pass 'sales_payments_create', it prepares the mutation.

  const { submitForm, mutation, ...formMethods } = useApiForm({
    alias: "sales_payments_create",
    onSuccess: () => {
      safeToast.success(
        t("create_success", { fallback: "Payment created successfully" }),
      );
      router.push("/dashboard/payments");
    },
    onError: (err) => {
      // safeToast handled by useApiForm usually if showToast=true
    },
  });

  // However, useApiForm might not implement our specific Zod schema validation
  // unless the API endpoint has it defined in schemas.
  // To ensure our client-side validation works, we can override the resolver or just use the passed methods.
  // useApiForm uses zodResolver if schema is found.

  // If we want to enforce OUR schema:
  // We can't easily replace the resolver in useApiForm once initialized.
  // Alternative: Initialize standard useForm and use mutation from useApiForm?
  // But useApiForm initializes useForm internally.

  // Let's use a standard useForm + useApiForm just for the submit action?
  // No, that doubles the hooks.

  // Let's rely on useApiForm but we can pass a custom 'transform' or just hope the backend schema matches.
  // BETTER: explicit useForm here and just call api.customRequest or useMutation directly.
  // But let's try to stick to the pattern.
  // I will use standard useForm here for full control and simplicity with my custom schema,
  // and use the `mutation` from useApiForm (or just useMutation directly).

  // Actually, let's just use useMutation from react-query and api.customRequest.
  // It's cleaner than fighting useApiForm if I want custom schema control.

  /* 
     Re-thinking: useApiForm is good. 
     If I want to enforce client side validation schema that I defined in PaymentForm,
     I should probably pass it to useApiForm? No prop for that.
     
     So I will use standard useForm and useMutation.
  */

  return <PaymentCreateContent />;
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/shared/api/axios";
import { handleServerErrors } from "@/src/shared/utils/handleServerErrors";
import { handleErrorStatus } from "@/src/shared/utils/handleErrorStatus";

function PaymentCreateContent() {
  const t = useTranslations("payments");
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      currency: "SAR",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.customRequest("sales_payments_create", data),
    onSuccess: () => {
      safeToast.success(
        t("create_success", { fallback: "Payment created successfully" }),
      );
      queryClient.invalidateQueries({ queryKey: ["sales_payments_list"] });
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
