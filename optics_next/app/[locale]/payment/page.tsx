"use client";

import { useSearchParams } from "next/navigation";
import Paymant from "@/components/layout/paymant/Paymant";
export default function PaymentPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const direction = (searchParams.get("direction") || "month").toLowerCase() as "month" | "year";
  const amount = searchParams.get("amount");
  const planName = searchParams.get("planName");
  const clientId = searchParams.get("clientId");
  const duration = searchParams.get("duration");
  return (
    <>
    {planId && amount && planName && clientId &&
      <Paymant
      planId={planId}
      direction={direction}
      amount={amount}
      planName={planName}
      clientId={clientId}
      duration={duration}
    />
    }
    </>
  );

}
