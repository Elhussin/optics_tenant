// features/partners/pages/PartnersListPage.tsx
/**
 * صفحة قائمة الشركاء - Premium Redesign
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Wallet,
  Users,
} from "lucide-react";
import { usePartners } from "../hooks/usePartners";
import { Link } from "@/src/app/i18n/navigation";
import type { PartnerType } from "../types/partners.types";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Badge } from "@/src/shared/components/ui/Badge";
import { cn } from "@/src/shared/utils/cn";
import { motion } from "framer-motion";
import { SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { StatsCard } from "../components/StatsCard";

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
    0,
  );
  const insuranceCompanies = partners.filter(
    (p) => p.partner_type === "insurance_company",
  ).length;

  if (loading && partners.length === 0) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 w-full bg-elevated/50 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonGroup type="card" count={4} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonGroup type="card" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Section */}
      <GlassCard className="relative border-none overflow-visible" padding="sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary ring-1 ring-primary/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-main">الشركاء والتأمين</h1>
              <p className="text-sm text-secondary">
                إدارة عقود الـتأمين، الشركات، والموردين
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <ActionButton
              variant="secondary"
              icon={
                <RefreshCw
                  className={cn("w-4 h-4", loading && "animate-spin")}
                />
              }
              onClick={() => fetchPartners()}
              title="تحديث"
            />
            <Link href="/dashboard/partners/create">
              <ActionButton
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                label="شريك جديد"
                className="shadow-lg shadow-primary/20"
              />
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatsCard
          title="إجمالي الشركاء"
          value={partners.length}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="الشركاء النشطين"
          value={activePartners}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="شركات التأمين"
          value={insuranceCompanies}
          icon={<Building2 className="w-5 h-5" />}
          color="purple"
        />
        <StatsCard
          title="الرصيد المستحق"
          value={totalBalance.toLocaleString()}
          suffix=" ر.س"
          icon={<Wallet className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Filters & Content */}
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-border-main/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              placeholder="بحث باسم الشريك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border-none rounded-lg py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-gray-400"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white dark:bg-gray-800 border-none rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium w-full sm:w-auto"
            >
              {partnerTypeFilters.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Partners Grid */}
        {error ? (
          <EmptyState
            type="error"
            title="حدث خطأ"
            description={error}
            action={
              <ActionButton
                variant="outline"
                label="إعادة المحاولة"
                onClick={() => fetchPartners()}
              />
            }
          />
        ) : filteredPartners.length === 0 ? (
          <EmptyState
            type="search"
            title="لا يوجد شركاء"
            description="لم يتم العثور على شركاء يطابقون بحثك"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPartners.map((partner, idx) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/dashboard/partners/${partner.id}`}>
                  <GlassCard
                    className="h-full group hover:shadow-glow-primary transition-all duration-300 border-border-main/50"
                    hover
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {partner.logo ? (
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <Building2 className="w-6 h-6" />
                        )}
                      </div>
                      <Badge
                        variant={partner.is_active ? "success" : "neutral"}
                      >
                        {partner.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-main mb-1 group-hover:text-primary transition-colors">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-secondary mb-4 font-medium">
                      {partner.name_en ||
                        partner.partner_type_display ||
                        partner.partner_type}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-border-main/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary">الرصيد الحالي</span>
                        <span
                          className={`font-bold ${
                            Number(partner.current_balance) > 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {Number(partner.current_balance).toLocaleString()} ر.س
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary">حد الائتمان</span>
                        <span className="font-medium text-main">
                          {Number(partner.credit_limit).toLocaleString()} ر.س
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary">الخصم الافتراضي</span>
                        <span className="font-medium text-main">
                          {partner.default_discount
                            ? `${Number(partner.default_discount)}%`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
