// features/partners/pages/PartnersListPage.tsx
/**
 * صفحة قائمة الشركاء
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Filter,
  RefreshCw,
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
import { usePartners } from "../hooks/usePartners";
import { PartnerCard } from "../components/PartnerCard";
import { Link } from "@/src/app/i18n/navigation";
import type { Partner, PartnerType } from "../types/partners.types";

const partnerTypeFilters: { value: PartnerType | "all"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "insurance_company", label: "شركات التأمين" },
  { value: "corporate", label: "الشركات" },
  { value: "government", label: "جهات حكومية" },
  { value: "healthcare", label: "مؤسسات صحية" },
];

export function PartnersListPage() {
  const { partners, loading, error, fetchPartners } = usePartners();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Filter partners
  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      searchQuery === "" ||
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.name_en?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "all" || partner.partner_type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Stats
  const activePartners = partners.filter((p) => p.is_active).length;
  const totalBalance = partners.reduce(
    (sum, p) => sum + parseFloat(p.current_balance || "0"),
    0
  );
  const insuranceCompanies = partners.filter(
    (p) => p.partner_type === "insurance_company"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30">
              <Building2 className="w-6 h-6" />
            </div>
            الشركاء والتأمين
          </h1>
          <p className="text-gray-500 mt-1">إدارة شركات التأمين والشركاء</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchPartners()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/dashboard/partners/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              شريك جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="text-blue-100 text-sm">إجمالي الشركاء</div>
            <div className="text-3xl font-bold">{partners.length}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="text-green-100 text-sm">الشركاء النشطين</div>
            <div className="text-3xl font-bold">{activePartners}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="text-purple-100 text-sm">شركات التأمين</div>
            <div className="text-3xl font-bold">{insuranceCompanies}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="text-orange-100 text-sm">الرصيد الإجمالي</div>
            <div className="text-2xl font-bold">
              {totalBalance.toLocaleString()}
            </div>
            <div className="text-orange-100 text-xs">ر.س</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث بالاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
              >
                {partnerTypeFilters.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners Grid */}
      {loading && partners.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      ) : error ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center text-red-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
          </CardContent>
        </Card>
      ) : filteredPartners.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا يوجد شركاء</p>
            {partners.length > 0 && (
              <p className="text-sm mt-1">جرب تغيير معايير البحث</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onViewStatement={() => {
                window.location.href = `/dashboard/partners/statement/${partner.id}`;
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PartnersListPage;
