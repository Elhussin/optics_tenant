"use client";

import { CheckCircle, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from '@/src/app/i18n/navigation';
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
  const t = useTranslations('paymentSuccess');

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-surface shadow-2xl rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700 relative overflow-hidden"
      >
        {/* Decorative background gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 dark:bg-green-900/20 mb-6"
        >
          <CheckCircle className="h-10 w-10 text-green-500" />
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
        >
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-transform active:scale-95 shadow-lg shadow-green-600/25 w-full"
          >
            {t('button')}
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
