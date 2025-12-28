"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/src/shared/api/axios";
import { getBaseUrl } from "@/src/shared/utils/getBaseUrl";
import { apiConfig } from "@/src/shared/api/apiConfig";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function PayPalProcessingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('paymentProcessing');

  useEffect(() => {
    const orderId = searchParams.get("orderID") || searchParams.get("token");
    const clientId = searchParams.get("client_id");
    const planID = searchParams.get("plan_id");
    const direction = searchParams.get("direction");
    const duration = searchParams.get("duration");
    const state = searchParams.get("status");

    if (state === "cancelled") {
      router.replace("/payment/cancel");
      return;
    }

    if (!orderId || !clientId || !planID) {
      router.replace("/payment/fail");
      return;
    }

    const executePayment = async () => {
      try {
        apiConfig.ignoreSubdomain = true;
        const baseUrl = getBaseUrl(undefined, apiConfig.ignoreSubdomain);

        const res = await axiosInstance.post(
          `${baseUrl}/api/tenants/paypal/execute/`,
          {
            order_id: orderId,
            client_id: clientId,
            plan_id: planID,
            direction: direction,
            duration: duration,
          }
        );

        if (res.status === 200) {
          router.replace("/payment/success");
        } else {
          router.replace("/payment/fail");
        }
      } catch (error) {
        console.log("error", error);
        router.replace("/payment/fail");
      }
    };

    executePayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-surface shadow-2xl rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700 relative overflow-hidden"
      >
        {/* Decorative background gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-6"
        >
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {t('title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-300 mb-2"
        >
          {t('description')}
        </motion.p>
      </motion.div>
    </div>
  );
}
