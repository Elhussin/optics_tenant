'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/app/i18n/navigation'; // Assuming this maps to next/navigation or similar
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 dark:bg-red-900/20 mb-6"
        >
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {t('title')}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-gray-600 dark:text-gray-300 mb-2 text-lg">
            {t('message')}
          </p>
          {/* Display technical error message in development or if appropriate */}
          <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20 inline-block max-w-full overflow-hidden text-ellipsis">
            <p className="text-red-600 dark:text-red-400 text-sm font-mono truncate">
              {error.message || "Unknown error occurred"}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-3"
        >
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-transform active:scale-95 shadow-lg shadow-primary/25"
          >
            <RefreshCw size={18} />
            {/* You might need to add a translation for 'tryAgain' or use a generic one */}
            Try Again
          </button>

          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors"
          >
            <Home size={18} />
            {t('homeButton')}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
