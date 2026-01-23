// features/accounting/pages/TaxesPage.tsx
/**
 * صفحة إدارة الضرائب
 * Premium Glassmorphism Design
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Percent,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Check,
  XCircle,
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

interface Tax {
  id: number;
  name: string;
  rate: string;
  effective_date: string;
  is_active: boolean;
  description?: string;
}

export function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    effective_date: "",
    description: "",
    is_active: true,
  });

  const fetchTaxes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.customRequest("accounting_taxes_list");
      setTaxes(data.results || data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في جلب الضرائب";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTax) {
        await api.customRequest("accounting_taxes_partial_update", {
          id: editingTax.id,
          ...formData,
        });
      } else {
        await api.customRequest("accounting_taxes_create", formData);
      }
      setShowForm(false);
      setEditingTax(null);
      setFormData({
        name: "",
        rate: "",
        effective_date: "",
        description: "",
        is_active: true,
      });
      await fetchTaxes();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في حفظ الضريبة";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tax: Tax) => {
    setEditingTax(tax);
    setFormData({
      name: tax.name,
      rate: tax.rate,
      effective_date: tax.effective_date,
      description: tax.description || "",
      is_active: tax.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (tax: Tax) => {
    if (!confirm(`هل تريد حذف الضريبة "${tax.name}"؟`)) return;

    setLoading(true);
    try {
      await api.customRequest("accounting_taxes_destroy", { id: tax.id });
      await fetchTaxes();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في حذف الضريبة";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (tax: Tax) => {
    setLoading(true);
    try {
      await api.customRequest("accounting_taxes_partial_update", {
        id: tax.id,
        is_active: !tax.is_active,
      });
      await fetchTaxes();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في تحديث الحالة";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30">
              <Percent className="w-6 h-6" />
            </div>
            الضرائب
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            إدارة معدلات الضرائب والرسوم
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTaxes} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            ضريبة جديدة
          </Button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingTax ? "تعديل الضريبة" : "إضافة ضريبة جديدة"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setEditingTax(null);
                  setFormData({
                    name: "",
                    rate: "",
                    effective_date: "",
                    description: "",
                    is_active: true,
                  });
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    اسم الضريبة
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="مثال: ضريبة القيمة المضافة"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      النسبة %
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({ ...formData, rate: e.target.value })
                      }
                      placeholder="15.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      تاريخ السريان
                    </label>
                    <Input
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          effective_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    الوصف
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="وصف إضافي..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="is_active" className="text-sm">
                    نشطة
                  </label>
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
                      setEditingTax(null);
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

      {/* Taxes Grid */}
      {loading && taxes.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">جاري التحميل...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center text-red-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
          </CardContent>
        </Card>
      ) : taxes.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center text-gray-400">
            <Percent className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold mb-2">لا توجد ضرائب</h3>
            <p className="mb-4">ابدأ بإضافة أول ضريبة للنظام</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة ضريبة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taxes.map((tax) => (
            <Card
              key={tax.id}
              className={`border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl transition-all hover:shadow-xl hover:-translate-y-1 ${
                !tax.is_active ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(tax)}
                      title={tax.is_active ? "إلغاء التفعيل" : "تفعيل"}
                    >
                      {tax.is_active ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(tax)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tax)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {tax.name}
                </h3>

                <div className="text-3xl font-bold text-primary mb-4">
                  {tax.rate}%
                </div>

                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>تاريخ السريان: {tax.effective_date}</p>
                  {tax.description && <p>{tax.description}</p>}
                </div>

                <div className="mt-4 pt-4 border-t">
                  {tax.is_active ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" />
                      نشطة
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400 px-2 py-1 rounded-full">
                      <XCircle className="w-3 h-3" />
                      غير نشطة
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaxesPage;
