"use client";

import { useSearchParams } from "next/navigation";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Link } from "@/src/app/i18n/navigation";
import { cn } from "@/src/shared/utils/cn";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const t = useTranslations("resetPassword");
  const [showPassword, setShowPassword] = useState(false);

  const formRequest = useApiForm({
    alias: "users_password_reset_confirm_create",
    defaultValues: { uid, token, new_password: "" },
    onSuccess: () => {
      safeToast(t("SuccessMessage"), { type: "success" });
    },
  });

  const handleReset = async (values: any) => {
    // Artificial delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    await formRequest.submitForm(values);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        {/* Decorative Top Bar */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

        <div className="p-8">
          <AnimatePresence mode="wait">
            {formRequest.formState.isSubmitSuccessful ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                  <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t("SuccessMessage")}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  {t("loginMessage")}
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] group"
                >
                  <span className="mr-2">Go to Login</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("title")}</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t("description")}
                  </p>
                </div>

                <form onSubmit={formRequest.handleSubmit(handleReset)} className="space-y-6">
                  <input type="hidden" {...formRequest.register("uid")} />
                  <input type="hidden" {...formRequest.register("token")} />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block ml-1">
                      {t("passwordLabel")}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900/50 border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${formRequest.formState.errors.new_password ? "border-red-300 focus:border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
                          }`}
                        placeholder={t("passwordPlaceholder")}
                        {...formRequest.register("new_password", {
                          required: t("passwordRequired"),
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {(formRequest.formState.errors.new_password || formRequest.formState.errors.uid || formRequest.formState.errors.token || formRequest.errors.root) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-red-500 font-medium ml-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg flex items-start gap-2"
                      >
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <div>
                          {formRequest.formState.errors.new_password?.message as string}
                          {formRequest.formState.errors.uid?.message as string}
                          {formRequest.formState.errors.token?.message as string}
                          {formRequest.errors.root}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={formRequest.isBusy}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {formRequest.isBusy && <Loader2 size={18} className="animate-spin" />}
                    {formRequest.isBusy ? t("sending") : t("button")}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
