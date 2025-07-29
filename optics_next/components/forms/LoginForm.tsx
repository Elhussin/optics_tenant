'use client';

import { useUser } from "@/lib/context/userContext";
import { formRequestProps, UseFormRequestReturn } from "@/types";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useEffect, useState } from 'react';
import { Loading4 } from '@/components/ui/loding';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import {useRouter} from '@/app/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function LoginForm(props: formRequestProps) {
  const t = useTranslations('login');
  const { fetchUser, user, setUser } = useUser();
  const router = useRouter();
  const [redirect, setRedirect] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  const { title, message, submitText = "Login", alias, mode = "login", istenant = false } = props;

  const {
    handleSubmit,
    submitForm,
    errors,
    isSubmitting,
    isLoading,
    register
  }: UseFormRequestReturn = useFormRequest({ alias: alias });



  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirect(params.get("redirect") || "/profile");
    setPlan(params.get("plan") || "basic");
  }, []);

  const onSubmit = async (data: any) => {
    const result = await submitForm(data);
    if (result?.success) {
      toast.success(message);

      if (mode === "login") {
        const userResult = await fetchUser.submitForm();
        if (userResult.success) {
          setUser(userResult.data);
          router.replace(redirect || "/profile");
        } else {
          console.error("Failed to fetch user data after login");
        }
      } else if (mode === "create") {
        router.replace('/auth/login');
      }
    }
  };

  useEffect(() => {
    if (user) {
      router.replace('/profile');
    }
  }, [user, router]);

  if (!redirect || user) {
    return <Loading4 />;
  }
  return (
    <div className={cn("flex  justify-center px-4 py-8 bg")}>
      <div className={cn("max-w-5xl w-full grid grid-cols-1 bg-surface md:grid-cols-2 gap-8 rounded-2xl shadow-xl overflow-hidden")}>
      <div className="p-6 md:p-10">
          <h1 className="text-center text-2xl font-semibold mb-6">{title}</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">{t('userNameLabel')}</label>
              {istenant ? (
                <>
                  <input
                    {...register("name")}
                    className="input-text"
                    placeholder={t('userNamePlaceholder')}
                  />
                  {errors.name && (
                    <p className="error-text">{errors.name.message as string}</p>
                  )}
                </>
              ) : (
                <>
                  <input
                    {...register("username")}
                    className="input-text"
                    placeholder={t('userNamePlaceholder')}
                  />
                  {errors.username && (
                    <p className="error-text">
                      {errors.username.message as string}
                    </p>
                  )}
                </>
              )}
            </div>

            {mode === "create" && (
              <div>
                <label className="label">{t('emailLabel')}</label>
                <input
                  {...register("email")}
                  className="input-text"
                  placeholder={t('emailPlaceholder')}
                />
                {errors.email && (
                  <p className="error-text">{errors.email.message as string}</p>
                )}
              </div>
            )}

            {/* كلمة المرور */}
            <div>
              <label className="label">{t('passwordLabel')}</label>
              <input
                {...register("password")}
                type="password"
                className="input-text"
                placeholder={t('passwordPlaceholder')}
              />
              {errors.password && (
                <p className="error-text">
                  {errors.password.message as string}
                </p>
              )}
            </div>
            {istenant && (
              <div>
                <label className="label">{t('planLabel')}</label>
                <select
                  {...register("requested_plan")}
                  className="select"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                >
                  <option className="option" value="">{t('planPlaceholder')}</option>
                  <option className="option" value="trial">{t('planOption.trial')}</option>
                  <option className="option" value="basic">{t('planOption.basic')}</option>
                  <option className="option" value="premium">{t('planOption.pro')}</option>
                  <option className="option" value="enterprise">{t('planOption.enterprise')}</option>
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
        <div className={cn("hidden md:flex items-center justify-center bg-info p-1 ")}>
      
          <div className={cn("relative w-full h-[400px]  text-white text-center flex items-center justify-center")}>
            <div className="absolute inset-0">
              <img
                src="/media/start.jpg"
                alt="Start APP"
                className="w-full h-full object-cover opacity-70 rounded-2xl"
              />
            </div>
            <div className="absolute bottom-3 z-10 space-y-4">
              <h2 className="text-3xl font-bold">{t('welcomeTitle')}</h2>
              <p className="text-lg">{t('welcomeMessage')}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

}
