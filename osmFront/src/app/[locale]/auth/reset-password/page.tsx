"use client";

import { useSearchParams } from "next/navigation";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "@/src/app/i18n/navigation";
import { cn } from "@/src/shared/utils/cn";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { featuresConfig } from "@/src/shared/constants/entityConfig";
export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const t = useTranslations("resetPassword");
  const [showPassword, setShowPassword] = useState(false);

  const formRequest = useApiForm({
    alias: featuresConfig["password-reset-confirm"].createAlias,
    defaultValues: { uid, token, new_password: "" },
    onSuccess: () => {
      safeToast(t("SuccessMessage"), { type: "success" });
    },
  });

  const handleReset = async (values: any) => {
    // Artificial delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));
    await formRequest.submitForm(values);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Background Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-50" />

        <GlassCard
          className="relative overflow-hidden shadow-2xl"
          padding="none"
        >
          {/* Gradient Top Strip */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer bg-[length:200%_100%]" />

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
                  {/* Success Icon */}
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-success/10 rounded-full animate-ping" />
                    <div className="relative w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success">
                      <CheckCircle size={40} />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-main mb-2">
                    {t("SuccessMessage")}
                  </h2>
                  <p className="text-secondary mb-8">{t("loginMessage")}</p>

                  <Link href="/auth/login">
                    <ActionButton
                      type="button"
                      variant="success"
                      size="lg"
                      icon={<ArrowRight size={18} />}
                      label="Go to Login"
                      className="w-full rounded-xl shadow-lg hover:shadow-xl"
                    />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-pulse" />
                      <div className="relative w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Lock className="w-10 h-10 text-primary" />
                      </div>
                    </div>

                    <h1 className="text-3xl font-bold text-main mb-2 flex items-center justify-center gap-2">
                      <Sparkles className="w-6 h-6 text-primary" />
                      {t("title")}
                    </h1>
                    <p className="text-secondary">{t("description")}</p>
                  </div>

                  <form
                    onSubmit={formRequest.handleSubmit(handleReset)}
                    className="space-y-6"
                  >
                    <input type="hidden" {...formRequest.register("uid")} />
                    <input type="hidden" {...formRequest.register("token")} />

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-main flex items-center gap-2 ml-1">
                        <Lock size={14} className="text-primary" />
                        {t("passwordLabel")}
                      </label>

                      <div className="relative group">
                        <div
                          className={cn(
                            "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
                            formRequest.formState.errors.new_password
                              ? "text-danger"
                              : "text-secondary group-focus-within:text-primary",
                          )}
                        >
                          <Lock size={18} />
                        </div>

                        <input
                          type={showPassword ? "text" : "password"}
                          className={cn(
                            "w-full pl-12 pr-12 py-3.5 rounded-xl transition-all duration-200",
                            "border-2 bg-white dark:bg-gray-800",
                            "focus:outline-none focus:ring-2 focus:ring-offset-1",
                            formRequest.formState.errors.new_password
                              ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                              : "border-border-main focus:border-primary focus:ring-primary/20",
                          )}
                          placeholder={t("passwordPlaceholder")}
                          {...formRequest.register("new_password", {
                            required: t("passwordRequired"),
                          })}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary hover:text-main transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>

                      {/* Error Messages */}
                      {(formRequest.formState.errors.new_password ||
                        formRequest.formState.errors.uid ||
                        formRequest.formState.errors.token ||
                        formRequest.errors.root) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-sm text-danger flex items-start gap-2 p-3 rounded-lg bg-danger/5 border border-danger/20 animate-fade-in"
                        >
                          <AlertCircle size={16} className="mt-0.5 shrink-0" />
                          <div className="flex-1">
                            {(formRequest.formState.errors.new_password
                              ?.message as string) ||
                              (formRequest.formState.errors.uid
                                ?.message as string) ||
                              (formRequest.formState.errors.token
                                ?.message as string) ||
                              formRequest.errors.root}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <ActionButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={formRequest.isBusy}
                      disabled={formRequest.isBusy}
                      icon={<Lock size={18} />}
                      label={formRequest.isBusy ? t("sending") : t("button")}
                      className="w-full rounded-xl shadow-lg hover:shadow-xl"
                    />
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
