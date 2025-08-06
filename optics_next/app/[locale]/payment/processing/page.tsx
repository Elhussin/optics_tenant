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
    const planID = searchParams.get("plan");
    const duration = searchParams.get("duration");

    if (!paymentId || !payerId || !clientId || !planID ) {

      router.replace("/payment/fail");
      return;
    }
    console.log("paymentId", paymentId);
    console.log("payerId", payerId);
    console.log("clientId", clientId);
    console.log("plan", planID);
    console.log("duration", duration);
    const executePayment = async () => {
      try {
        apiConfig.ignoreSubdomain = true;
        const baseUrl = getBaseUrl(undefined, apiConfig.ignoreSubdomain);

        const res = await axiosInstance.post(
          `${baseUrl}/api/tenants/paypal/execute/`,
          {
  
            payment_id:paymentId,
            payer_id: payerId,
            client_id: clientId,
            plan_id:planID,
            // duration:duration
          }
        );

        if (res.status === 200) {
          router.replace("/payment/success");
          console.log("res", res);
        } else {
          setStatus("error");
          router.replace("/payment/fail");
          console.log("res", res);
        }
      } catch (error) {
        console.log("error", error);
        setStatus("error");
        router.replace("/payment/fail");
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
