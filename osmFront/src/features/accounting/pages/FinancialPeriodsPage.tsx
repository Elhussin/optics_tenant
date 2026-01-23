// features/accounting/pages/FinancialPeriodsPage.tsx
/**
 * صفحة إدارة الفترات المالية
 * Premium Glassmorphism Design
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Plus,
  RefreshCw,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { api } from "@/src/shared/api/axios";
import type { FinancialPeriod } from "../types/accounting.types";

export function FinancialPeriodsPage() {
  const [periods, setPeriods] = useState<FinancialPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<FinancialPeriod | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.customRequest("accounting_financial_periods_list");
      setPeriods(data.results || data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في جلب الفترات المالية";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPeriod) {
        await api.customRequest("accounting_financial_periods_partial_update", {
          id: editingPeriod.id,
          ...formData,
        });
      } else {
        await api.customRequest(
          "accounting_financial_periods_create",
          formData,
        );
      }
      setShowForm(false);
      setEditingPeriod(null);
      setFormData({ name: "", start_date: "", end_date: "" });
      await fetchPeriods();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في حفظ الفترة";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (period: FinancialPeriod) => {
    setEditingPeriod(period);
    setFormData({
      name: period.name,
      start_date: period.start_date,
      end_date: period.end_date,
    });
    setShowForm(true);
  };

  const handleClose = async (period: FinancialPeriod) => {
    if (
      !confirm(
        "هل تريد إغلاق هذه الفترة المالية؟ لن تتمكن من إضافة قيود جديدة بعد الإغلاق.",
      )
    )
      return;

    setLoading(true);
    try {
      await api.customRequest("accounting_financial_periods_partial_update", {
        id: period.id,
        is_closed: true,
      });
      await fetchPeriods();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في إغلاق الفترة";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const currentPeriod = periods.find((p) => !p.is_closed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            الفترات المالية
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            إدارة الفترات المحاسبية والسنوات المالية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPeriods} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            فترة جديدة
          </Button>
        </div>
      </div>

      {/* Current Period Alert */}
      {currentPeriod && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  الفترة المالية الحالية: {currentPeriod.name}
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  من {currentPeriod.start_date} إلى {currentPeriod.end_date}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingPeriod ? "تعديل الفترة" : "إضافة فترة جديدة"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setEditingPeriod(null);
                  setFormData({ name: "", start_date: "", end_date: "" });
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    اسم الفترة
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="مثال: السنة المالية 2026"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      تاريخ البداية
                    </label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      تاريخ النهاية
                    </label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPeriod(null);
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Periods List */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <CardContent className="p-0">
          {loading && periods.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">جاري التحميل...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : periods.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">
                لا توجد فترات مالية
              </h3>
              <p className="mb-4">ابدأ بإنشاء أول فترة مالية للنظام</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إنشاء فترة جديدة
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-right py-3 px-4 font-semibold">
                      اسم الفترة
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      تاريخ البداية
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      تاريخ النهاية
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      الحالة
                    </th>
                    <th className="text-center py-3 px-4 font-semibold w-32">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => (
                    <tr
                      key={period.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{period.name}</td>
                      <td className="py-3 px-4">{period.start_date}</td>
                      <td className="py-3 px-4">{period.end_date}</td>
                      <td className="py-3 px-4 text-center">
                        {period.is_closed ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-2 py-1 rounded-full">
                            <Lock className="w-3 h-3" />
                            مغلقة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-2 py-1 rounded-full">
                            <Unlock className="w-3 h-3" />
                            مفتوحة
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {!period.is_closed && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(period)}
                                title="تعديل"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClose(period)}
                                title="إغلاق الفترة"
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <Lock className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FinancialPeriodsPage;
