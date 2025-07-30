"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PayPalSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing payment...");

  useEffect(() => {
    const paymentId = searchParams.get("paymentId");
    const payerId = searchParams.get("PayerID");

    if (paymentId && payerId) {
      fetch(`/api/paypal/execute/?paymentId=${paymentId}&PayerID=${payerId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.detail) {
            setStatus("Payment successful ✅");
          } else {
            setStatus("Payment failed ❌");
          }
        })
        .catch(() => setStatus("Payment failed ❌"));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl font-semibold">{status}</p>
    </div>
  );
}
