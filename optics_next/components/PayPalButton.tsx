"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/api/axios";
import { getBaseUrl } from "@/lib/utils/getBaseUrl";
import { apiConfig } from "@/lib/api/apiConfig";

type PayPalButtonProps = {
  clientId: string;
  plan: string; // نوع الخطة المراد شراؤها
};

export default function PayPalButton({ clientId, plan }: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("month");

  const createOrder = async () => {
    try {
      setLoading(true);
      apiConfig.ignoreSubdomain = true;
      const baseUrl = getBaseUrl(undefined, apiConfig.ignoreSubdomain);

      const res = await axiosInstance.post(
        `${baseUrl}/api/tenants/create-paypal-order/`,
        { client: clientId, plan, period }
      );

      const data = res.data;
      if (data.approval_url) {
        window.location.href = data.approval_url;
      } else {
        alert("Failed to create PayPal order");
      }
    } catch (err) {
      console.error("Error creating PayPal order", err);
      alert("Error creating PayPal order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={createOrder}
      disabled={loading}
      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Processing..." : `Choose ${plan}`}
    </button>
  );
}
