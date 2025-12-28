"use client";

import { useState } from "react";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "@/src/app/i18n/navigation";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "invalid">("idle");
  const [message, setMessage] = useState<string>("");
  const t = useTranslations("forgotPassword");
  const alias = "users_password_reset_create";

  const formRequest = useApiForm({
    alias,
    onSuccess: async (res) => {
      console.log(res);
      setStatus("success");
      setMessage(t("SuccessMessage"));
    },
    onError: async (err) => {
      console.log(err);
      const detail = err.response?.data?.detail || "Password reset failed. Please try again.";
      setStatus("error");
      setMessage(t("ErrorMessage"));
    },
  });

  const onSubmit = async (data: any) => {
    console.log(data);
    if (!data.email) {
      setStatus("invalid");
      setMessage(t("emailRequired"));
      return;
    }
    setStatus("loading");
    setMessage(t("Resetting"));
    // Add artificial delay for better UX

    await new Promise(resolve => setTimeout(resolve, 800));
    formRequest.submitForm(data);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        {/* Decorative Top Bar */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

        <div className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <KeyRound className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("title")}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              {t("description")}
            </p>
          </div>

          <form onSubmit={formRequest.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 block ml-1">
                {t("email")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  {...formRequest.register("email")}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${formRequest.errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
                    }`}
                  placeholder={t("emailPlaceholder")}
                />
              </div>
              {formRequest.errors.email && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1"
                >
                  <AlertCircle size={12} />
                  {formRequest.errors.email.message as string}
                </motion.p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {status !== "idle" && message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-lg text-sm flex items-start gap-2 ${status === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" :
                      status === "error" || status === "invalid" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300" :
                        "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    }`}
                >
                  {status === "success" ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> :
                    status === "loading" ? <Loader2 size={16} className="mt-0.5 shrink-0 animate-spin" /> :
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                  <span>{message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {status === "loading" && <Loader2 size={18} className="animate-spin" />}
              {status === "success" ? t("sendSuccess") : status === "loading" ? t("sending") : t("button")}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
