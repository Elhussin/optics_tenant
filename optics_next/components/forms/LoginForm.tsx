'use client';

import { useUser } from "@/lib/contexts/userContext";
import { formRequestProps, UseFormRequestReturn } from "@/types";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useTranslations } from 'next-intl';
import { useSearchParams,useRouter,useParams } from 'next/navigation';
import { safeToast } from "@/lib/utils/toastService";
import { cn } from '@/lib/utils/cn';
import { useEffect } from "react";
import Image from 'next/image';
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
  const { fetchUser, setUser,user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // قيم الـ query params مباشرة
  const redirect = searchParams.get("redirect") || "/profile";
  const defaultPlan = searchParams.get("plan") || "basic";
  const params = useParams();
  const locale = params.locale || "en";
  // react-hook-form من خلال useFormRequest
  const {
    handleSubmit,
    submitForm,
    errors,
    isSubmitting,
    isLoading,
    register,
  }: UseFormRequestReturn = useFormRequest({ alias });

const onSubmit = async (data: any) => {
  try {
    const result = await submitForm(data);
    if (!result?.success) return;



    if (mode === "login") {
      const userResult = await fetchUser.submitForm();
      if (userResult?.success) {
        setUser(userResult.data); // الآن عندك بيانات كاملة
        router.replace(redirect);
      } else {
        safeToast(t("errorMessage"), { type: "error" });
      }

    } else if (mode === "create") {
      router.replace(`/${locale}/auth/login`);
    }

    safeToast(message || t("successMessage"), { type: "success" });
  } catch {
    safeToast(t("errorMessage"), { type: "error" });
  }
};


  useEffect(() => {
    if (user) {
      router.replace(redirect);
    }
  }, [user, redirect, router]);

  return (
    <div className={cn("flex justify-center px-4 py-8 bg")}>
      <div className={cn("max-w-5xl w-full grid grid-cols-1 bg-surface md:grid-cols-2 gap-8 rounded-2xl shadow-xl overflow-hidden")}>
        {/* الفورم */}
        <div className="p-6 md:p-10">
          <h1 className="text-center text-2xl font-semibold mb-6">{title}</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* اسم المستخدم */}
            <div>
              <label className="label">{t("userNameLabel")}</label>
              <input
                {...register(istenant ? "name" : "username")}
                className="input-text"
                placeholder={t("userNamePlaceholder")}
              />
              {errors[istenant ? "name" : "username"] && (
                <p className="error-text">
                  {errors[istenant ? "name" : "username"]?.message as string}
                </p>
              )}
            </div>

            {/* البريد (فقط عند إنشاء حساب) */}
            {mode === "create" && (
              <div>
                <label className="label">{t("emailLabel")}</label>
                <input
                  {...register("email")}
                  className="input-text"
                  placeholder={t("emailPlaceholder")}
                />
                {errors.email && (
                  <p className="error-text">{errors.email.message as string}</p>
                )}
              </div>
            )}

            {/* كلمة المرور */}
            <div>
              <label className="label">{t("passwordLabel")}</label>
              <input
                {...register("password")}
                type="password"
                className="input-text"
                placeholder={t("passwordPlaceholder")}
              />
              {errors.password && (
                <p className="error-text">{errors.password.message as string}</p>
              )}
            </div>

            {/* اختيار الخطة (فقط لو tenant) */}
            {istenant && (
              <div>
                <label className="label">{t("planLabel")}</label>
                <select
                  {...register("requested_plan")}
                  className="select"
                  defaultValue={defaultPlan}
                >
                  <option value="">{t("planPlaceholder")}</option>
                  <option value="trial">{t("planOption.trial")}</option>
                  <option value="basic">{t("planOption.basic")}</option>
                  <option value="premium">{t("planOption.pro")}</option>
                  <option value="enterprise">{t("planOption.enterprise")}</option>
                </select>
                {errors.requested_plan && (
                  <p className="error-text">
                    {errors.requested_plan.message as string}
                  </p>
                )}
              </div>
            )}

            {/* رسالة خطأ عامة */}
            {errors.root && (
              <p className="error-text">{errors.root.message as string}</p>
            )}

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn btn-primary w-full text-white"
            >
              {isSubmitting || isLoading ? submitText + "..." : submitText}
            </button>
          </form>
        </div>

        {/* الجانب الأيمن (صورة + رسالة ترحيب) */}
        <div className={cn("hidden md:flex items-center justify-center bg-info p-1")}>
          <div className="relative w-full h-[400px] text-white text-center flex items-center justify-center">
            <Image 
              src="/media/start.jpg"
              alt="Start APP"
              className="absolute inset-0 w-full h-full object-cover opacity-70 rounded-2xl"
              width={400}
              height={400}
            />
            <div className="absolute bottom-3 z-10 space-y-4">
              <h2 className="text-3xl font-bold">{t("welcomeTitle")}</h2>
              <p className="text-lg">{t("welcomeMessage")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
