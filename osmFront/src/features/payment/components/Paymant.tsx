"use client";

import { useUser } from "@/src/features/auth/hooks/UserContext";
import { useState } from "react";
import PayPalButton from "./PayPalButton";
import { useTranslations } from "next-intl";
import { PayPalButtonProps } from "../types";
import { bankDetial, contact, paymentMethods } from "@/src/shared/constants/conteact";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CreditCard, Banknote, Building2, HelpCircle, Mail, Phone, MessageCircle } from "lucide-react";

export default function Payment(props: PayPalButtonProps) {
  const { planId, amount, planName, clientId, planDirection } = props;
  const { user } = useUser();
  const t = useTranslations("paymantPage");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "stripe" | "cash" | "bank" | "other">("paypal");

  // Map icons to methods for better visuals than emojis
  const getIcon = (value: string) => {
    switch (value) {
      case "paypal": return <Wallet size={20} />;
      case "stripe": return <CreditCard size={20} />;
      case "cash": return <Banknote size={20} />;
      case "bank": return <Building2 size={20} />;
      default: return <HelpCircle size={20} />;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-surface rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-2"
          >
            {t("title")}
          </motion.h1>
          <div className="inline-block bg-white/20 backdrop-blur-md rounded-full px-4 py-1 text-sm font-medium">
            {t("duration")}: <span className="capitalize">{planDirection}</span>
          </div>
        </div>

        <div className="p-8">
          {/* Plan Details Card */}
          <div className="bg-surface dark:bg-surface/50 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100 dark:border-gray-600">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">{t("plan")}</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{planName}</h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">${amount}</p>
            </div>
          </div>

          {/* Payment Methods Grid */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t("choosePlan")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {paymentMethods.map((method) => {
              const isActive = paymentMethod === method.value;
              return (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value as any)}
                  className={`relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${isActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md transform sm:-translate-y-1"
                      : "border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                >
                  <div className={`p-2 rounded-full ${isActive ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {getIcon(method.value)}
                  </div>
                  <span className="font-medium text-sm">{method.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 border-2 border-blue-500 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={paymentMethod}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-600"
            >
              {paymentMethod === "paypal" && user?.client && planId && (
                <div className="w-full">
                  <p className="text-center text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    Safe and secure payment via PayPal
                  </p>
                  <PayPalButton
                    clientId={clientId}
                    planId={planId}
                    planDirection={planDirection}

                  />
                </div>
              )}

              {paymentMethod === "stripe" && (
                <div className="text-center py-4">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">{t("stripe")}</p>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="text-center py-4">
                  <Banknote className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">{t("cash")}</p>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-6 h-6 text-indigo-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Bank Transfer Details</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="text-gray-500">{t("bankName")}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{bankDetial.bankName}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="text-gray-500">{t("accountNumber")}</span>
                      <span className="font-bold text-gray-900 dark:text-white tracking-wider">{bankDetial.accountNumber}</span>
                    </div>
                    <div className="flex flex-col p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="text-gray-500 mb-1">{t("iban")}</span>
                      <span className="font-bold text-gray-900 dark:text-white tracking-widest break-all">{bankDetial.iban}</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "other" && (
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium">{t("other")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a
                      href={`mailto:${contact.email}?subject=Payment%20Issue`}
                      className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors shadow-sm"
                    >
                      <Mail size={18} className="text-red-500" />
                      <span>Email</span>
                    </a>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors shadow-sm"
                    >
                      <Phone size={18} className="text-blue-500" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`https://wa.me/${contact.phone}`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors shadow-sm"
                    >
                      <MessageCircle size={18} className="text-green-500" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
