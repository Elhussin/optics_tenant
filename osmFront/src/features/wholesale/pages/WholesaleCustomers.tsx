// features/wholesale/pages/WholesaleCustomers.tsx
/**
 * صفحة عملاء الجملة
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { useWholesaleCustomers } from "../hooks/useWholesale";
import { CustomerCreditCard } from "../components/CustomerCreditCard";
import { Link } from "@/src/app/i18n/navigation";
import type {
  WholesaleCustomer,
  CreditStatus,
  PricingTier,
} from "../types/wholesale.types";

const tierLabels: Record<string, string> = {
  retail: "تجزئة",
  wholesale_1: "جملة 1",
  wholesale_2: "جملة 2",
  wholesale_3: "جملة VIP",
  distributor: "موزع",
  special: "خاص",
};

const tierColors: Record<string, string> = {
  retail: "bg-gray-100 text-gray-700",
  wholesale_1: "bg-blue-100 text-blue-700",
  wholesale_2: "bg-purple-100 text-purple-700",
  wholesale_3: "bg-yellow-100 text-yellow-700",
  distributor: "bg-green-100 text-green-700",
  special: "bg-pink-100 text-pink-700",
};

const statusIcons: Record<CreditStatus, React.ReactNode> = {
  none: <AlertCircle className="w-4 h-4 text-gray-400" />,
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  approved: <CheckCircle className="w-4 h-4 text-green-500" />,
  suspended: <AlertCircle className="w-4 h-4 text-red-500" />,
};

export function WholesaleCustomers() {
  const { customers, loading, error, fetchCustomers } = useWholesaleCustomers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] =
    useState<WholesaleCustomer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchQuery === "" ||
      `${customer.first_name} ${customer.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery);

    const matchesTier =
      selectedTier === "all" || customer.pricing_tier === selectedTier;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30">
              <Users className="w-6 h-6" />
            </div>
            عملاء الجملة
          </h1>
          <p className="text-gray-500 mt-1">
            إدارة عملاء البيع بالجملة والموزعين
          </p>
        </div>
        <Link href="/dashboard/customers/create?type=wholesaler">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة عميل جملة
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث بالاسم أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Tier Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="all">جميع المستويات</option>
                <option value="wholesale_1">جملة - المستوى 1</option>
                <option value="wholesale_2">جملة - المستوى 2</option>
                <option value="wholesale_3">جملة - VIP</option>
                <option value="distributor">موزعين</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customers List */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">
                قائمة العملاء ({filteredCustomers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">جاري التحميل...</p>
                </div>
              ) : error ? (
                <div className="p-12 text-center text-red-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{error}</p>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>لا يوجد عملاء</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                        selectedCustomer?.id === customer.id
                          ? "bg-primary/5 border-r-4 border-primary"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {customer.first_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {customer.first_name} {customer.last_name}
                              {statusIcons[customer.credit_status]}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.phone}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              tierColors[customer.pricing_tier] || "bg-gray-100"
                            }`}
                          >
                            {tierLabels[customer.pricing_tier] ||
                              customer.pricing_tier}
                          </span>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {parseFloat(
                                customer.current_balance
                              ).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              ر.س رصيد
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Customer Details */}
        <div className="space-y-4">
          {selectedCustomer ? (
            <>
              <CustomerCreditCard
                customer={selectedCustomer}
                onEditCredit={() => {
                  // Open edit modal
                }}
              />

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 space-y-2">
                  <Link
                    href={`/dashboard/wholesale/statement/${selectedCustomer.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-primary" />
                    <span>كشف الحساب</span>
                    <ChevronLeft className="w-4 h-4 mr-auto" />
                  </Link>
                  <Link
                    href={`/dashboard/wholesale/orders/create?customer=${selectedCustomer.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span>طلب جديد</span>
                    <ChevronLeft className="w-4 h-4 mr-auto" />
                  </Link>
                  <Link
                    href={`/dashboard/customers/${selectedCustomer.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Eye className="w-5 h-5 text-primary" />
                    <span>عرض الملف الكامل</span>
                    <ChevronLeft className="w-4 h-4 mr-auto" />
                  </Link>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>اختر عميلاً لعرض تفاصيله</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default WholesaleCustomers;
