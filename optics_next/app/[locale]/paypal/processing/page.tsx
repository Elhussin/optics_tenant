"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/api/axios";
import { getBaseUrl } from "@/lib/utils/getBaseUrl";
import { apiConfig } from "@/lib/api/apiConfig";

export default function PayPalProcessingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const paymentId = searchParams.get("paymentId");
    const payerId = searchParams.get("PayerID");
    const clientId = searchParams.get("client_id");
    const plan = searchParams.get("plan");
    const period = searchParams.get("period");

    if (!paymentId || !payerId || !clientId || !plan || !period) {
      router.replace("/paypal/fail");
      return;
    }

    const executePayment = async () => {
      try {
        apiConfig.ignoreSubdomain = true;
        const baseUrl = getBaseUrl(undefined, apiConfig.ignoreSubdomain);

        const res = await axiosInstance.post(
          `${baseUrl}/api/tenants/paypal/execute/`,
          {
            paymentId,
            PayerID: payerId,
            client_id: clientId,
            plan,
            period
          }
        );

        if (res.status === 200) {
          router.replace("/paypal/success");
        } else {
          setStatus("error");
          router.replace("/paypal/fail");
        }
      } catch (error) {
        setStatus("error");
        router.replace("/paypal/fail");
      }
    };

    executePayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <h1 className="text-2xl font-bold text-gray-800">Processing your payment...</h1>
      <p className="text-gray-600 mt-2 text-center max-w-sm">
        Please wait while we confirm your payment with PayPal.
      </p>
    </div>
  );
}
