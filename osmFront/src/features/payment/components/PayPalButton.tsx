"use client";

import { useState } from "react";
import { axiosInstance } from "@/src/shared/api/axios";
import { getBaseUrl } from "@/src/shared/utils/getBaseUrl";
import { apiConfig } from "@/src/shared/api/apiConfig";
import { PayPalButtonProps } from "../types";
import PaymentProcessingModal from "./PaymentProcessingModal";
import { useTranslations } from "next-intl";
import { safeToast } from "@/src/shared/utils/safeToast";
export default function PayPalButton({
  clientId,
  planId,
  planDirection,
  label,
  method,
}: PayPalButtonProps) {
  const t = useTranslations("paymantPage");
  const [loading, setLoading] = useState(false);

  const createOrder = async () => {
    try {
      setLoading(true);
      apiConfig.ignoreSubdomain = true;

      const baseUrl = getBaseUrl(undefined, apiConfig.ignoreSubdomain);
      const res = await axiosInstance.post(
        `${baseUrl}/api/tenants/create-payment-order/`,
        {
          client_id: clientId,
          plan_id: planId,
          direction: planDirection,
          method: method?.toLowerCase() || "paypal",
        }
      );

      const data = res.data;
      console.log("PayPal Order Response:", data);

      if (data.approval_url && data.order_id) {
        sessionStorage.setItem("paypal_order_id", data.order_id);
        window.location.href = data.approval_url;
      } else {
        safeToast(t("failedToCreateOrder"), { type: "error" });
      }
    } catch (err) {
      safeToast(t("failedToCreateOrder"), { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PaymentProcessingModal isOpen={loading} message={t("processing")} />
      <button
        onClick={createOrder}
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {label || `${planDirection}`}
      </button>
    </>
  );
}
