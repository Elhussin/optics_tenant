// app/[locale]/payment/callback/[provider]/page.tsx
/**
 * BNPL Callback Page
 */

"use client";

import { useSearchParams } from "next/navigation";
import { BNPLCallbackPage } from "@/src/features/payment";
import type { BNPLProvider } from "@/src/features/payment";


interface PageProps {
  params: Promise<{
    provider: string;
  }>;
}

export default function BNPLCallbackRoute({ params }: PageProps) {
  const searchParams = useSearchParams();

  // These would normally come from params.provider but we need to await it
  // For now, extract from URL
  const provider = (searchParams.get("provider") || "tabby") as BNPLProvider;
  const status = (searchParams.get("status") || "success") as
    | "success"
    | "cancel"
    | "failure";
  const sessionId = searchParams.get("session_id") || "";
  const paymentId = searchParams.get("payment_id") || undefined;
  const orderId = searchParams.get("order_id")
    ? parseInt(searchParams.get("order_id")!)
    : undefined;

  return (
    <BNPLCallbackPage
      provider={provider}
      status={status}
      sessionId={sessionId}
      paymentId={paymentId}
      orderId={orderId}
    />
  );
}
