"use client";

import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from '@/src/app/i18n/navigation';
import { motion } from "framer-motion";

export default function PaymentCancelPage() {
  const t = useTranslations('paymentCancel');
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-surface shadow-2xl rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700 relative overflow-hidden"
      >
        {/* Decorative background gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-50 dark:bg-yellow-900/20 mb-6"
        >
          <AlertTriangle className="h-10 w-10 text-yellow-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {t('title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-300 mb-8"
        >
          {t('description')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          <Link
            href="/profile#pricingSection"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-transform active:scale-95 shadow-lg shadow-yellow-500/25 w-full"
          >
            <RotateCcw size={18} />
            {t('tryAgain')}
          </Link>

          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors w-full"
          >
            <ArrowLeft size={18} />
            {t('backToHome')}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
