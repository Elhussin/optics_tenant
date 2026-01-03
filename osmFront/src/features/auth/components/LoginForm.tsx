"use client";

import { useUser } from "@/src/features/auth/hooks/UserContext";
import { formRequestProps } from "@/src/shared/types";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { safeToast } from "@/src/shared/utils/safeToast";
import { cn } from "@/src/shared/utils/cn";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/src/app/i18n/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { User, Lock, Mail, Eye, EyeOff, LogIn, ArrowRight, Loader2, UserCheck } from "lucide-react";

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
  const { refetchUser, user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale() || "en";
  const [showPassword, setShowPassword] = useState(false);

  // We'll compute redirect dynamically in onSubmit to ensure it's up-to-date

  const { handleSubmit, submitForm, errors, isBusy, register } = useApiForm({
    alias,
  });

  // const onSubmit = async (data: any) => {
  //   try {
  //     const result = await submitForm(data);
  //     if (!result?.success) return;

  //     if (mode === "login") {
  //       const res = await refetchUser();
  //       console.log(res);
  //       // Compute redirect dynamically to avoid stale memoized value
  //       const redirect = searchParams.get("redirect") || `/${locale}/profile`;
  //       // Check both if success is true OR if we have data with an id/email
  //       if (res?.success || res?.data) {
  //         safeToast(message || t("successMessage"), { type: "success" });
  //         // Navigate to the target page and then refresh to load fresh data
  //         router.replace(redirect);
  //         router.refresh();

  //       } else {
  //         // Sometimes refetchUser might fail silently or return cached null
  //         safeToast(t("errorMessage"), { type: "error" });
  //       }
  //     } else if (mode === "create") {
  //       safeToast(message || t("successMessage"), { type: "success" });
  //       router.replace(`/${locale}/auth/login`);
  //       router.refresh();
  //     }
  //   } catch {
  //     safeToast(t("errorMessage"), { type: "error" });
  //   }
  // };

// src/features/auth/components/LoginForm.tsx
const onSubmit = async (data: any) => {
  try {
    const result = await submitForm(data);
    if (!result?.success) return;

    if (mode === "login") {
      // 1️⃣ جلب المستخدم بعد تسجيل الدخول
      const res = await refetchUser();   // ← الآن يرسل الكوكي الجديد
      // 2️⃣ احسب الـ redirect في نفس اللحظة
      const redirect = searchParams.get("redirect") || `/${locale}/profile`;

      if (res?.success || res?.data) {
        safeToast(message || t("successMessage"), { type: "success" });
        // 3️⃣ تحديث router قبل التحويل
        // router.refresh();               // يضمن أن الـ auth state محدث
        router.replace(redirect);       // أو router.push(redirect) حسب تفضيلك
      } else {
        safeToast(t("errorMessage"), { type: "error" });
      }
    } else if (mode === "create") {
      safeToast(message || t("successMessage"), { type: "success" });
      router.refresh();
      router.replace(`/${locale}/auth/login`);
    }
  } catch {
    safeToast(t("errorMessage"), { type: "error" });
  }
};


  return (
    <div className={cn("min-h-screen w-full flex items-center justify-center p-4 bg-surface transition-colors duration-300")}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "max-w-5xl w-full grid grid-cols-1 bg-white dark:bg-gray-800 md:grid-cols-2 gap-0 md:gap-8 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
        )}
      >
        {/* الفورم */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-start">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">{title}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {mode === "login" ? t("welcomeBack") : t("createAccountDesc")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* اسم المستخدم */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{t("userNameLabel")}</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  {istenant ? <UserCheck size={18} /> : <User size={18} />}
                </div>
                <input
                  {...register(istenant ? "name" : "username")}
                  className={`w-full pl-10 pr-4 py-3 bg-surface border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${errors[istenant ? "name" : "username"] ? "border-red-300 focus:border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
                    }`}
                  placeholder={t("userNamePlaceholder")}
                />
              </div>
              {errors[istenant ? "name" : "username"] && (
                <p className="text-xs text-red-500 font-medium ml-1">
                  {errors[istenant ? "name" : "username"]?.message as string}
                </p>
              )}
            </div>

            {/* البريد (فقط عند إنشاء حساب) */}
            {mode === "create" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{t("emailLabel")}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    {...register("email")}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
                      }`}
                    placeholder={t("emailPlaceholder")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message as string}</p>
                )}
              </div>
            )}

            {/* كلمة المرور */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{t("passwordLabel")}</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900/50 border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
                    }`}
                  placeholder={t("passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium ml-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              {isBusy && <Loader2 size={20} className="animate-spin" />}
              {isBusy ? (submitText + "...") : submitText}
              {!isBusy && mode === "login" && <LogIn size={20} />}
              {!isBusy && mode === "create" && <ArrowRight size={20} />}
            </button>

            <div className="flex flex-col gap-3 mt-6 text-center text-sm">
              {mode === "login" ? (
                <>
                  <div className="flex items-center justify-between">
                    <Link
                      href="./forgot-password"
                      title={t("forgotPassword")}
                      className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {t("forgotPassword")}
                    </Link>
                    <Link
                      href="./register"
                      title={t("register")}
                      className="text-blue-600 font-semibold hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      {t("register")}
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-gray-500">
                  {t("alreadyHaveAccount")}{" "}
                  <Link href="./login" title={t("button")} className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                    {t("LoginNow")}
                  </Link>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* الجانب الأيمن (صورة + رسالة ترحيب) */}
        <div className={cn("hidden md:relative overflow-hidden md:flex items-center justify-center p-2")}>
          <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 backdrop-blur-3xl z-0" />
          <div className="relative w-[calc(100%-2rem)] h-[calc(100%-2rem)] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/media/start.jpg"
              alt="Start APP"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

            <div className="absolute bottom-0 left-0 w-full p-8 z-20 text-white space-y-2 transform transition-transform duration-500 translate-y-2 hover:translate-y-0">
              <h2 className="text-3xl font-bold tracking-tight">{t("welcomeTitle")}</h2>
              <p className="text-gray-200 text-lg font-light leading-relaxed max-w-md">{t("welcomeMessage")}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>


  );
}
