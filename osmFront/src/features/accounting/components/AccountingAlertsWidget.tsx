"use client";

import React from "react";
import { AlertCircle, Clock, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

interface AccountingAlertsWidgetProps {
  unpostedCount: number;
}

export function AccountingAlertsWidget({ unpostedCount }: AccountingAlertsWidgetProps) {
  const t = useTranslations("accounting");

  // Mocking period end dates for presentation
  const isPeriodEndingSoon = true;
  const daysLeft = 5;

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-primary" />
        {t("alerts.title") || "التنبيهات والمحام المهمة"}
      </h2>

      <div className="space-y-3">
        {unpostedCount > 0 ? (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {t("alerts.unpostedEntries") || "قيود يومية معلقة"}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                يوجد {unpostedCount} قيود يومية بحاجة إلى المراجعة والترحيل.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20">
            <AlertCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                {t("alerts.allPosted") || "جميع القيود مرحلة"}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                لا توجد قيود معلقة. العمليات المحاسبية محدثة.
              </p>
            </div>
          </div>
        )}

        {isPeriodEndingSoon && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20">
            <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t("alerts.periodEnding") || "إغلاق الفترة المالية يقترب"}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                يتبقى {daysLeft} أيام على نهاية الفترة المالية الحالية. يرجى تسوية الحسابات.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
