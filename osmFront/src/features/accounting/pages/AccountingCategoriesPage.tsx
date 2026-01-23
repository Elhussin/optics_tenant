// features/accounting/pages/AccountingCategoriesPage.tsx
/**
 * صفحة إدارة فئات المحاسبة
 * Premium Glassmorphism Design
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Layers,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  TrendingUp,
  TrendingDown,
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

interface AccountingCategory {
  id: number;
  name: string;
  category_type: "income" | "expense";
  parent?: number;
  parent_name?: string;
  description?: string;
}

export function AccountingCategoriesPage() {
  const [categories, setCategories] = useState<AccountingCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<AccountingCategory | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [formData, setFormData] = useState({
    name: "",
    category_type: "income" as "income" | "expense",
    parent: "",
    description: "",
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.customRequest("accounting_categories_list");
      setCategories(data.results || data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في جلب الفئات";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        parent: formData.parent ? parseInt(formData.parent) : null,
      };

      if (editingCategory) {
        await api.customRequest("accounting_categories_partial_update", {
          id: editingCategory.id,
          ...payload,
        });
      } else {
        await api.customRequest("accounting_categories_create", payload);
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormData({
        name: "",
        category_type: "income",
        parent: "",
        description: "",
      });
      await fetchCategories();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في حفظ الفئة";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: AccountingCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      category_type: category.category_type,
      parent: category.parent?.toString() || "",
      description: category.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (category: AccountingCategory) => {
    if (!confirm(`هل تريد حذف الفئة "${category.name}"؟`)) return;

    setLoading(true);
    try {
      await api.customRequest("accounting_categories_destroy", {
        id: category.id,
      });
      await fetchCategories();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في حذف الفئة";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (activeTab === "all") return true;
    return cat.category_type === activeTab;
  });

  const incomeCategories = categories.filter(
    (c) => c.category_type === "income",
  );
  const expenseCategories = categories.filter(
    (c) => c.category_type === "expense",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30">
              <Layers className="w-6 h-6" />
            </div>
            فئات المحاسبة
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            تصنيف الإيرادات والمصروفات
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchCategories}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            فئة جديدة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`border-0 shadow-lg cursor-pointer transition-all ${
            activeTab === "all" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setActiveTab("all")}
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">جميع الفئات</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Layers className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card
          className={`border-0 shadow-lg cursor-pointer transition-all ${
            activeTab === "income" ? "ring-2 ring-emerald-500" : ""
          }`}
          onClick={() => setActiveTab("income")}
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">فئات الإيرادات</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {incomeCategories.length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card
          className={`border-0 shadow-lg cursor-pointer transition-all ${
            activeTab === "expense" ? "ring-2 ring-red-500" : ""
          }`}
          onClick={() => setActiveTab("expense")}
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">فئات المصروفات</p>
                <p className="text-2xl font-bold text-red-600">
                  {expenseCategories.length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="bg-surface  max-w-md w-full">
            <CardHeader className="bg-surface flex flex-row items-center justify-between">
              <CardTitle>
                {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                  setFormData({
                    name: "",
                    category_type: "income",
                    parent: "",
                    description: "",
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
                    اسم الفئة
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="مثال: مبيعات النظارات"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    نوع الفئة
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category_type"
                        value="income"
                        checked={formData.category_type === "income"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category_type: e.target.value as
                              | "income"
                              | "expense",
                          })
                        }
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="flex items-center gap-1 text-emerald-600">
                        <TrendingUp className="w-4 h-4" />
                        إيراد
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category_type"
                        value="expense"
                        checked={formData.category_type === "expense"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category_type: e.target.value as
                              | "income"
                              | "expense",
                          })
                        }
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="w-4 h-4" />
                        مصروف
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    الفئة الأب (اختياري)
                  </label>
                  <select
                    value={formData.parent}
                    onChange={(e) =>
                      setFormData({ ...formData, parent: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900"
                  >
                    <option value="">بدون فئة أب</option>
                    {categories
                      .filter(
                        (c) =>
                          c.category_type === formData.category_type &&
                          c.id !== editingCategory?.id,
                      )
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
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
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCategory(null);
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

      {/* Categories List */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <CardContent className="p-0">
          {loading && categories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">جاري التحميل...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Layers className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">لا توجد فئات</h3>
              <p className="mb-4">ابدأ بإضافة فئات للإيرادات والمصروفات</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة فئة
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-right py-3 px-4 font-semibold">
                      اسم الفئة
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      النوع
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      الفئة الأب
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      الوصف
                    </th>
                    <th className="text-center py-3 px-4 font-semibold w-24">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{category.name}</td>
                      <td className="py-3 px-4 text-center">
                        {category.category_type === "income" ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            إيراد
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-2 py-1 rounded-full">
                            <TrendingDown className="w-3 h-3" />
                            مصروف
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {category.parent_name || "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm max-w-xs truncate">
                        {category.description || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

export default AccountingCategoriesPage;
