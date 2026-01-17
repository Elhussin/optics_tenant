"use client";

import { useUser } from "@/src/features/auth/hooks/UserContext";
import { formRequestProps } from "@/src/shared/types";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { safeToast } from "@/src/shared/utils/safeToast";
import { cn } from "@/src/shared/utils/cn";
import { useState } from "react";
import Image from "next/image";
import { Link } from "@/src/app/i18n/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";

export default function LoginForm(props: formRequestProps) {
  const {
    title,
    message,
    submitText = "Login",
    alias,
    mode = "login",
    istenant = false,
  } = props;
  const t = useTranslations("login");
  const { refetchUser } = useUser();
  const searchParams = useSearchParams();
  const locale = useLocale() || "en";
  const [showPassword, setShowPassword] = useState(false);

  const { handleSubmit, submitForm, errors, isBusy, register } = useApiForm({
    alias,
  });

  const onSubmit = async (data: any) => {
    try {
      const result = await submitForm(data);
      if (!result?.success) return;

      if (mode === "login") {
        // ✅ إظهار رسالة النجاح
        safeToast(message || t("successMessage"), { type: "success" });

        // ✅ حساب الـ redirect
        const redirect = searchParams.get("redirect") || `/${locale}/profile`;

        // ✅ التحويل مباشرة دون انتظار refetchUser
        // refetchUser will happen automatically in the new page
        window.location.href = redirect;
      } else if (mode === "create") {
        safeToast(message || t("successMessage"), { type: "success" });
        window.location.href = `/${locale}/auth/login`;
      }
    } catch (error) {
      console.error("Login error:", error);
      safeToast(t("errorMessage"), { type: "error" });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-surface">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl w-full relative"
      >
        {/* Background Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-50" />

        <GlassCard
          className="relative overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-0"
          padding="none"
        >
          {/* Gradient Top Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer bg-[length:200%_100%] z-10" />

          {/* Form Section */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            {/* Header */}
            <div className="mb-8 text-center md:text-start">
              <h1 className="text-3xl font-bold text-main mb-2 flex items-center gap-2 justify-center md:justify-start">
                <Sparkles className="w-6 h-6 text-primary" />
                {title}
              </h1>
              <p className="text-secondary">
                {mode === "login" ? t("welcomeBack") : t("createAccountDesc")}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-main flex items-center gap-2 ml-1">
                  {istenant ? (
                    <UserCheck size={14} className="text-primary" />
                  ) : (
                    <User size={14} className="text-primary" />
                  )}
                  {t("userNameLabel")}
                </label>
                <div className="relative group">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
                      errors[istenant ? "name" : "username"]
                        ? "text-danger"
                        : "text-secondary group-focus-within:text-primary"
                    )}
                  >
                    {istenant ? <UserCheck size={18} /> : <User size={18} />}
                  </div>
                  <input
                    {...register(istenant ? "name" : "username")}
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 rounded-xl transition-all duration-200",
                      "border-2 bg-white dark:bg-gray-800",
                      "focus:outline-none focus:ring-2 focus:ring-offset-1",
                      errors[istenant ? "name" : "username"]
                        ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                        : "border-border-main focus:border-primary focus:ring-primary/20"
                    )}
                    placeholder={t("userNamePlaceholder")}
                  />
                </div>
                {errors[istenant ? "name" : "username"] && (
                  <p className="text-sm text-danger ml-1 animate-fade-in">
                    {errors[istenant ? "name" : "username"]?.message as string}
                  </p>
                )}
              </div>

              {/* Email Field (for registration) */}
              {mode === "create" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-main flex items-center gap-2 ml-1">
                    <Mail size={14} className="text-primary" />
                    {t("emailLabel")}
                  </label>
                  <div className="relative group">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
                        errors.email
                          ? "text-danger"
                          : "text-secondary group-focus-within:text-primary"
                      )}
                    >
                      <Mail size={18} />
                    </div>
                    <input
                      {...register("email")}
                      className={cn(
                        "w-full pl-12 pr-4 py-3.5 rounded-xl transition-all duration-200",
                        "border-2 bg-white dark:bg-gray-800",
                        "focus:outline-none focus:ring-2 focus:ring-offset-1",
                        errors.email
                          ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                          : "border-border-main focus:border-primary focus:ring-primary/20"
                      )}
                      placeholder={t("emailPlaceholder")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-danger ml-1 animate-fade-in">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-main flex items-center gap-2 ml-1">
                  <Lock size={14} className="text-primary" />
                  {t("passwordLabel")}
                </label>
                <div className="relative group">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
                      errors.password
                        ? "text-danger"
                        : "text-secondary group-focus-within:text-primary"
                    )}
                  >
                    <Lock size={18} />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className={cn(
                      "w-full pl-12 pr-12 py-3.5 rounded-xl transition-all duration-200",
                      "border-2 bg-white dark:bg-gray-800",
                      "focus:outline-none focus:ring-2 focus:ring-offset-1",
                      errors.password
                        ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                        : "border-border-main focus:border-primary focus:ring-primary/20"
                    )}
                    placeholder={t("passwordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary hover:text-main transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-danger ml-1 animate-fade-in">
                    {errors.password.message as string}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <ActionButton
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isBusy}
                disabled={isBusy}
                icon={
                  mode === "login" ? (
                    <LogIn size={20} />
                  ) : (
                    <ArrowRight size={20} />
                  )
                }
                label={isBusy ? submitText + "..." : submitText}
                className="w-full rounded-xl shadow-lg hover:shadow-xl mt-4"
              />

              {/* Links */}
              <div className="flex flex-col gap-3 mt-6 text-center text-sm">
                {mode === "login" ? (
                  <div className="flex items-center justify-between">
                    <Link
                      href="./forgot-password"
                      className="text-secondary hover:text-primary transition-colors"
                    >
                      {t("forgotPassword")}
                    </Link>
                    <Link
                      href="./register"
                      className="text-primary font-semibold hover:text-primary/80 transition-colors"
                    >
                      {t("register")}
                    </Link>
                  </div>
                ) : (
                  <div className="text-secondary">
                    {t("alreadyHaveAccount")}{" "}
                    <Link
                      href="./login"
                      className="text-primary font-semibold hover:text-primary/80 hover:underline"
                    >
                      {t("LoginNow")}
                    </Link>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Side (Image + Welcome) */}
          <div className="hidden md:relative md:flex items-center justify-center p-2 overflow-hidden">
            <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 backdrop-blur-3xl z-0" />
            <div className="relative w-[calc(100%-2rem)] h-[calc(100%-2rem)] rounded-2xl overflow-hidden shadow-2xl group">
              <Image
                src="/media/start.jpg"
                alt="Start APP"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

              <div className="absolute bottom-0 left-0 w-full p-8 z-20 text-white space-y-2 transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                <h2 className="text-3xl font-bold tracking-tight">
                  {t("welcomeTitle")}
                </h2>
                <p className="text-gray-200 text-lg font-light leading-relaxed max-w-md">
                  {t("welcomeMessage")}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
