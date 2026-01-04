"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useTranslations } from "next-intl";
import { Link } from '@/src/app/i18n/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle, AlertTriangle, LogIn, ArrowLeft } from "lucide-react";

export default function ActivatePage() {
  const t = useTranslations('activation');
  const alias = "tenants_activate_retrieve";
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">("loading");
  const [message, setMessage] = useState<string>(t('loading'));

  const formRquest = useApiForm({
    alias,
    onSuccess: async (res) => {
      setStatus("success");
      setMessage(res.detail || t('success'));
    },
    onError: async (err) => {
      const detail = err.response?.data?.detail || t('error');
      setStatus("error");
      setMessage(detail);
    },
    enabled: !!token,
  });

  const submitted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage(t('invalid'));
      return;
    }

    // Check if we already submitted
    if (submitted.current) return;

    (async () => {
      submitted.current = true;
      // Small delay to ensure the loading animation is seen (better UX)
      await new Promise(resolve => setTimeout(resolve, 1000));
      await formRquest.submitForm({ token });
    })();
  }, [token]);

  // Determine styles and icon based on status
  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          color: "bg-green-50 dark:bg-green-900/20",
          gradient: "from-green-400 to-emerald-600",
          borderColor: "border-green-100 dark:border-green-900/30"
        };
      case "error":
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          color: "bg-red-50 dark:bg-red-900/20",
          gradient: "from-red-500 to-pink-600",
          borderColor: "border-red-100 dark:border-red-900/30"
        };
      case "invalid":
        return {
          icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
          color: "bg-amber-50 dark:bg-amber-900/20",
          gradient: "from-amber-400 to-orange-500",
          borderColor: "border-amber-100 dark:border-amber-900/30"
        };
      default: // loading
        return {
          icon: <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />,
          color: "bg-blue-50 dark:bg-blue-900/20",
          gradient: "from-blue-400 to-indigo-600 animate-pulse",
          borderColor: "border-blue-100 dark:border-blue-900/30"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-md w-full bg-surface shadow-2xl rounded-2xl p-8 text-center border relative overflow-hidden ${config.borderColor} dark:border-gray-700`}
      >
        {/* Decorative Top Bar */}
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${config.gradient}`} />

        <div className="flex flex-col items-center">
          <motion.div
            key={status} // Animates when status changes
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`p-4 rounded-full mb-6 ${config.color}`}
          >
            {config.icon}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
          >
            {status === 'loading' ? t('loading') :
              status === 'success' ? t('success') :
                status === 'invalid' ? t('invalid') : t('error')
            }
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300 mb-8"
          >
            {message !== t('loading') && message}
          </motion.p>

          <AnimatePresence>
            {status !== "loading" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-3"
              >
                {status === "success" ? (
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-600/25 transition-all"
                  >
                    <LogIn size={20} />
                    {t('button')}
                  </Link>
                ) : (
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors"
                  >
                    <ArrowLeft size={20} />
                    {t('backHome')}
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
