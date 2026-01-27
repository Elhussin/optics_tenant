"use client";

import { useState } from "react";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  ArrowLeft,
  Mail,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "@/src/app/i18n/navigation";
import { cn } from "@/src/shared/utils/cn";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { featuresConfig } from "@/src/features/formGenerator/constants/entityConfig";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "invalid"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const t = useTranslations("forgotPassword");
  const alias = featuresConfig["password-reset"].createAlias;

  const formRequest = useApiForm({
    alias,
    onSuccess: async (res) => {
      console.log(res);
      setStatus("success");
      setMessage(t("SuccessMessage"));
    },
    onError: async (err) => {
      console.log(err);
      const detail =
        err.response?.data?.detail ||
        "Password reset failed. Please try again.";
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
    await new Promise((resolve) => setTimeout(resolve, 800));
    formRequest.submitForm(data);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
                className="relative w-20 h-20 mx-auto mb-6"
              >
                <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-pulse" />
                <div className="relative w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <KeyRound className="w-10 h-10 text-primary" />
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold text-main mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {t("title")}
              </h1>
              <p className="text-secondary leading-relaxed">
                {t("description")}
              </p>
            </div>

            <form
              onSubmit={formRequest.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-main flex items-center gap-2 ml-1"
                >
                  <Mail size={14} className="text-primary" />
                  {t("email")}
                </label>

                <div className="relative group">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
                      formRequest.errors.email
                        ? "text-danger"
                        : "text-secondary group-focus-within:text-primary"
                    )}
                  >
                    <Mail size={18} />
                  </div>

                  <input
                    id="email"
                    type="email"
                    {...formRequest.register("email")}
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 rounded-xl transition-all duration-200",
                      "border-2 bg-white dark:bg-gray-800",
                      "focus:outline-none focus:ring-2 focus:ring-offset-1",
                      formRequest.errors.email
                        ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                        : "border-border-main focus:border-primary focus:ring-primary/20"
                    )}
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                {formRequest.errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-sm text-danger flex items-center gap-1.5 animate-fade-in"
                  >
                    <AlertCircle size={14} />
                    {formRequest.errors.email.message as string}
                  </motion.p>
                )}
              </div>

              {/* Status Messages */}
              <AnimatePresence mode="wait">
                {status !== "idle" && message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "p-4 rounded-xl text-sm flex items-start gap-2 border-2",
                      status === "success"
                        ? "bg-success/5 text-success border-success/20"
                        : status === "error" || status === "invalid"
                        ? "bg-danger/5 text-danger border-danger/20"
                        : "bg-primary/5 text-primary border-primary/20"
                    )}
                  >
                    {status === "success" ? (
                      <CheckCircle size={18} className="mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    )}
                    <span className="flex-1">{message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <ActionButton
                type="submit"
                variant="primary"
                size="lg"
                isLoading={status === "loading"}
                disabled={status === "loading" || status === "success"}
                icon={<Mail size={18} />}
                label={
                  status === "success"
                    ? t("sendSuccess")
                    : status === "loading"
                    ? t("sending")
                    : t("button")
                }
                className="w-full rounded-xl shadow-lg hover:shadow-xl"
              />
            </form>

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <Link href="/auth/login">
                <ActionButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeft size={16} />}
                  label={t("backToLogin")}
                  className="inline-flex"
                />
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
