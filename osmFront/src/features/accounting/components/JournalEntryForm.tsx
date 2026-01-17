// features/accounting/components/JournalEntryForm.tsx
/**
 * نموذج إنشاء قيد يومية
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Calculator,
  AlertCircle,
  Check,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import type {
  JournalEntryCreate,
  JournalEntryType,
  ChartOfAccount,
} from "../types/accounting.types";

interface JournalEntryFormProps {
  accounts: ChartOfAccount[];
  onSubmit: (entry: JournalEntryCreate) => Promise<void>;
  loading?: boolean;
}

interface LineEntry {
  id: string;
  account: number;
  account_name: string;
  debit_amount: string;
  credit_amount: string;
  description: string;
}

const entryTypes: { value: JournalEntryType; label: string }[] = [
  { value: "general", label: "قيد عام" },
  { value: "adjustment", label: "قيد تسوية" },
  { value: "sales", label: "قيد مبيعات" },
  { value: "purchase", label: "قيد مشتريات" },
  { value: "receipt", label: "قيد قبض" },
  { value: "payment", label: "قيد صرف" },
];

export function JournalEntryForm({
  accounts,
  onSubmit,
  loading,
}: JournalEntryFormProps) {
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [entryType, setEntryType] = useState<JournalEntryType>("general");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<LineEntry[]>([
    {
      id: "1",
      account: 0,
      account_name: "",
      debit_amount: "",
      credit_amount: "",
      description: "",
    },
    {
      id: "2",
      account: 0,
      account_name: "",
      debit_amount: "",
      credit_amount: "",
      description: "",
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const totalDebit = lines.reduce(
    (sum, l) => sum + (parseFloat(l.debit_amount) || 0),
    0
  );
  const totalCredit = lines.reduce(
    (sum, l) => sum + (parseFloat(l.credit_amount) || 0),
    0
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  const difference = totalDebit - totalCredit;

  // Add new line
  const addLine = useCallback(() => {
    setLines((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        account: 0,
        account_name: "",
        debit_amount: "",
        credit_amount: "",
        description: "",
      },
    ]);
  }, []);

  // Remove line
  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Update line
  const updateLine = useCallback(
    (id: string, field: keyof LineEntry, value: string | number) => {
      setLines((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;

          const updated = { ...l, [field]: value };

          // Clear opposite amount when entering one
          if (field === "debit_amount" && value) {
            updated.credit_amount = "";
          } else if (field === "credit_amount" && value) {
            updated.debit_amount = "";
          }

          // Update account name when account changes
          if (field === "account" && typeof value === "number") {
            const acc = accounts.find((a) => a.id === value);
            updated.account_name = acc?.name || "";
          }

          return updated;
        })
      );
    },
    [accounts]
  );

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!description) {
      setError("يجب إدخال وصف القيد");
      return;
    }

    const validLines = lines.filter(
      (l) =>
        l.account &&
        (parseFloat(l.debit_amount) > 0 || parseFloat(l.credit_amount) > 0)
    );

    if (validLines.length < 2) {
      setError("يجب إدخال سطرين على الأقل");
      return;
    }

    if (!isBalanced) {
      setError("القيد غير متوازن - المدين يجب أن يساوي الدائن");
      return;
    }

    const entry: JournalEntryCreate = {
      entry_date: entryDate,
      entry_type: entryType,
      description,
      reference: reference || undefined,
      lines: validLines.map((l) => ({
        account: l.account,
        debit_amount: l.debit_amount || "0",
        credit_amount: l.credit_amount || "0",
        description: l.description || undefined,
      })),
    };

    await onSubmit(entry);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          قيد يومية جديد
        </CardTitle>
        <CardDescription>
          أدخل بيانات القيد مع التأكد من توازن المدين والدائن
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                التاريخ
              </label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                نوع القيد
              </label>
              <select
                value={entryType}
                onChange={(e) =>
                  setEntryType(e.target.value as JournalEntryType)
                }
                className="mt-1 w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
              >
                {entryTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                المرجع
              </label>
              <Input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="رقم الفاتورة، الشيك..."
                className="mt-1"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                الوصف *
              </label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف القيد"
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* Lines Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-sm">
                  <th className="text-right py-3 px-4 font-semibold">الحساب</th>
                  <th className="text-right py-3 px-4 font-semibold w-36">
                    مدين
                  </th>
                  <th className="text-right py-3 px-4 font-semibold w-36">
                    دائن
                  </th>
                  <th className="text-right py-3 px-4 font-semibold">البيان</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={line.id} className="border-t">
                    <td className="py-2 px-3">
                      <select
                        value={line.account}
                        onChange={(e) =>
                          updateLine(
                            line.id,
                            "account",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1.5 border rounded bg-white dark:bg-gray-800 text-sm"
                      >
                        <option value={0}>اختر حساب...</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.debit_amount}
                        onChange={(e) =>
                          updateLine(line.id, "debit_amount", e.target.value)
                        }
                        className="text-left"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.credit_amount}
                        onChange={(e) =>
                          updateLine(line.id, "credit_amount", e.target.value)
                        }
                        className="text-left"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        value={line.description}
                        onChange={(e) =>
                          updateLine(line.id, "description", e.target.value)
                        }
                        placeholder="تفاصيل السطر"
                        className="text-sm"
                      />
                    </td>
                    <td className="py-2 px-1">
                      {lines.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(line.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-gray-50 dark:bg-gray-800">
                  <td className="py-3 px-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLine}
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة سطر
                    </Button>
                  </td>
                  <td className="py-3 px-4 text-left font-bold">
                    {totalDebit.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-left font-bold">
                    {totalCredit.toLocaleString()}
                  </td>
                  <td colSpan={2} className="py-3 px-4">
                    {isBalanced ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <Check className="w-4 h-4" />
                        متوازن
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        فرق: {Math.abs(difference).toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading || !isBalanced}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  حفظ القيد
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default JournalEntryForm;
