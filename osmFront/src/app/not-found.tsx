"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileQuestion, Home, ArrowLeft, Sparkles } from "lucide-react";

export default function RootNotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full relative"
      >
        {/* Background Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50" />

        {/* Glass Card */}
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl text-center overflow-hidden">
          {/* Gradient Top Strip */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-shimmer bg-[length:200%_100%]" />

          <div className="p-8">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto flex items-center justify-center h-24 w-24 rounded-full mb-6"
            >
              <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
              <div className="relative bg-blue-500/10 h-24 w-24 rounded-full flex items-center justify-center">
                <FileQuestion className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
            </motion.div>

            {/* 404 Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
            >
              404
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Page Not Found
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-300 mb-8 text-lg"
            >
              The page you are looking for doesn't exist or has been moved.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <ArrowLeft size={18} />
                Go Back
              </button>

              {/* Home Button */}
              <button
                onClick={() => router.push("/en")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Home size={18} />
                Go Home
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
