// features/accounting/pages/JournalEntriesPage.tsx
/**
 * صفحة قيود اليومية
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  Check,
  X,
  Eye,
  RotateCcw,
  Calendar,
  Filter,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { useJournalEntries, useChartOfAccounts } from "../hooks/useAccounting";
import { JournalEntryForm } from "../components/JournalEntryForm";
import type {
  JournalEntry,
  JournalEntryCreate,
} from "../types/accounting.types";

const entryTypeLabels: Record<string, string> = {
  general: "عام",
  adjustment: "تسوية",
  sales: "مبيعات",
  purchase: "مشتريات",
  receipt: "قبض",
  payment: "صرف",
};

export function JournalEntriesPage() {
  const {
    entries,
    loading,
    error,
    fetchEntries,
    createEntry,
    postEntry,
    reverseEntry,
  } = useJournalEntries();
  const { accounts, fetchAccounts } = useChartOfAccounts();
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [filterPosted, setFilterPosted] = useState<
    "all" | "posted" | "unposted"
  >("all");

  useEffect(() => {
    fetchEntries();
    fetchAccounts();
  }, [fetchEntries, fetchAccounts]);

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    if (filterPosted === "posted") return entry.is_posted;
    if (filterPosted === "unposted") return !entry.is_posted;
    return true;
  });

  const handleCreateEntry = async (entry: JournalEntryCreate) => {
    await createEntry(entry);
    setShowForm(false);
  };

  const handlePostEntry = async (entry: JournalEntry) => {
    if (confirm("هل تريد ترحيل هذا القيد؟ لا يمكن التراجع عن هذه العملية.")) {
      await postEntry(entry.id);
    }
  };

  const handleReverseEntry = async (entry: JournalEntry) => {
    if (confirm("هل تريد عكس هذا القيد؟ سيتم إنشاء قيد عكسي جديد.")) {
      await reverseEntry(entry.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30">
              <FileText className="w-6 h-6" />
            </div>
            قيود اليومية
          </h1>
          <p className="text-gray-500 mt-1">إدارة وترحيل القيود المحاسبية</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchEntries()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            قيد جديد
          </Button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">قيد يومية جديد</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <JournalEntryForm
                accounts={accounts}
                onSubmit={handleCreateEntry}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">الحالة:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterPosted === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPosted("all")}
              >
                الكل
              </Button>
              <Button
                variant={filterPosted === "unposted" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPosted("unposted")}
              >
                غير مرحل
              </Button>
              <Button
                variant={filterPosted === "posted" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPosted("posted")}
              >
                مرحل
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          {loading && entries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">جاري تحميل القيود...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>لا توجد قيود</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800 text-sm">
                    <th className="text-right py-3 px-4 font-semibold">
                      رقم القيد
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      التاريخ
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      النوع
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      الوصف
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">مدين</th>
                    <th className="text-left py-3 px-4 font-semibold">دائن</th>
                    <th className="text-center py-3 px-4 font-semibold">
                      الحالة
                    </th>
                    <th className="text-center py-3 px-4 font-semibold w-32">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-primary">
                          {entry.entry_number}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {entry.entry_date}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {entryTypeLabels[entry.entry_type] ||
                            entry.entry_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        {entry.description}
                      </td>
                      <td className="py-3 px-4 text-left font-medium">
                        {parseFloat(entry.total_debit).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-left font-medium">
                        {parseFloat(entry.total_credit).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {entry.is_posted ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" />
                            مرحل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            انتظار
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEntry(entry)}
                            title="عرض"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!entry.is_posted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePostEntry(entry)}
                              title="ترحيل"
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          {entry.is_posted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReverseEntry(entry)}
                              title="عكس القيد"
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
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

      {/* Entry Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>تفاصيل القيد {selectedEntry.entry_number}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEntry(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">التاريخ:</span>
                  <span className="mr-2 font-medium">
                    {selectedEntry.entry_date}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">النوع:</span>
                  <span className="mr-2 font-medium">
                    {entryTypeLabels[selectedEntry.entry_type]}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">الوصف:</span>
                  <span className="mr-2">{selectedEntry.description}</span>
                </div>
              </div>

              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="text-right py-2 px-3">الحساب</th>
                    <th className="text-left py-2 px-3 w-24">مدين</th>
                    <th className="text-left py-2 px-3 w-24">دائن</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEntry.lines.map((line, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2 px-3">
                        <span className="text-xs text-gray-400 mr-1">
                          {line.account_code}
                        </span>
                        {line.account_name}
                      </td>
                      <td className="py-2 px-3 text-left">
                        {parseFloat(line.debit_amount) > 0 &&
                          parseFloat(line.debit_amount).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-left">
                        {parseFloat(line.credit_amount) > 0 &&
                          parseFloat(line.credit_amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50 dark:bg-gray-800 font-bold">
                    <td className="py-2 px-3">المجموع</td>
                    <td className="py-2 px-3 text-left">
                      {parseFloat(selectedEntry.total_debit).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-left">
                      {parseFloat(selectedEntry.total_credit).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default JournalEntriesPage;
