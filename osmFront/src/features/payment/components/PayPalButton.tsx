"use client";

import { useState } from "react";
import { axiosInstance } from "@/src/shared/api/axios";
import { getBaseUrl } from "@/src/shared/utils/getBaseUrl";
import { apiConfig } from "@/src/shared/api/apiConfig";
import { PayPalButtonProps } from "../types";
import PaymentProcessingModal from "./PaymentProcessingModal";
import { useTranslations } from "next-intl";
import { safeToast } from "@/src/shared/utils/safeToast";
import { motion } from "framer-motion";
import { ExternalLink, CreditCard } from "lucide-react";

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

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={createOrder}
        disabled={loading}
        className="w-full relative group overflow-hidden py-3.5 px-6 bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />

        {/* PayPal Icon / Label */}
        {label ? (
          <span className="flex items-center gap-2">
            <CreditCard size={20} />
            {label}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Pay with <span className="font-extrabold italic">PayPal</span>
          </span>
        )}

        <ExternalLink size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
      </motion.button>
    </>
  );
}
