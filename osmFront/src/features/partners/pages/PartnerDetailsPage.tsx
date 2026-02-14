"use client";

import React, { useEffect, useState } from "react";
import { usePartners } from "../hooks/usePartners";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Users,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  Activity,
  Receipt,
} from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Badge } from "@/src/shared/components/ui/Badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/shadcn/ui/tabs";
import { SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import { Partner } from "../types/partners.types";
import { format } from "date-fns";
import { PartnerCustomersTab } from "../components/PartnerCustomersTab";
import { PartnerClaimsTab } from "../components/PartnerClaimsTab";
import { PartnerPriceListTab } from "../components/PartnerPriceListTab";

export function PartnerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getPartner, loading: partnersLoading } = usePartners();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      if (id) {
        setLoading(true);
        const data = await getPartner(Number(id));
        setPartner(data);
        setLoading(false);
      }
    };
    fetchPartner();
  }, [id, getPartner]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-48 w-full bg-elevated/50 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonGroup type="card" count={3} />
        </div>
        <div className="h-96 w-full bg-elevated/50 rounded-2xl" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-xl font-bold text-main">الشريك غير موجود</h2>
        <ActionButton
          variant="secondary"
          label="العودة للقائمة"
          onClick={() => router.back()}
          icon={<ArrowLeft size={16} />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      {/* 1. Header & Profile Card */}
      <GlassCard
        className="relative overflow-visible border-none"
        padding="none"
      >
        {/* Banner/Background */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-t-2xl" />

        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 gap-4">
            <div className="flex items-end gap-6">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-4 ring-white/50 dark:ring-black/50">
                {partner.logo ? (
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-primary" />
                )}
              </div>
              <div className="mb-2 space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-main">
                    {partner.name}
                  </h1>
                  <Badge variant={partner.is_active ? "success" : "neutral"}>
                    {partner.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                  {partner.code && (
                    <Badge variant="info" className="font-mono">
                      {partner.code}
                    </Badge>
                  )}
                </div>
                <p className="text-secondary font-medium">
                  {partner.name_en} •{" "}
                  {partner.partner_type_display || partner.partner_type}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mb-2">
              <ActionButton
                variant="secondary"
                icon={<Receipt size={18} />}
                label="كشف حساب"
                navigateTo={`/dashboard/partners/statement/${partner.id}`}
              />
              <ActionButton
                variant="primary"
                icon={<Edit size={18} />}
                label="تعديل"
                navigateTo={`/dashboard/partners/${partner.id}/edit`}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 2. Key Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsTile
          label="الرصيد الحالي"
          value={`${Number(partner.current_balance).toLocaleString()} ر.س`}
          icon={<WalletIcon />}
          color={
            Number(partner.current_balance) > 0
              ? "text-red-500"
              : "text-green-500"
          }
        />
        <StatsTile
          label="حد الائتمان"
          value={`${Number(partner.credit_limit).toLocaleString()} ر.س`}
          icon={<CreditCard size={20} />}
        />
        {partner.default_discount && (
          <StatsTile
            label="الخصم الافتراضي"
            value={`${Number(partner.default_discount)}%`}
            icon={<Activity size={20} />}
          />
        )}
        <StatsTile
          label="شروط الدفع"
          value={partner.payment_terms.replace("_", " ")}
          icon={<Calendar size={20} />}
        />
      </div>

      {/* 3. Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/50 dark:bg-black/20 backdrop-blur-sm p-1 border border-border-main/50 rounded-xl w-full md:w-auto h-auto flex-wrap justify-start">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg px-4 py-2"
          >
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg px-4 py-2"
          >
            العملاء المرتبطين
          </TabsTrigger>
          <TabsTrigger
            value="claims"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg px-4 py-2"
          >
            المطالبات
          </TabsTrigger>
          <TabsTrigger
            value="pricelist"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg px-4 py-2"
          >
            قوائم الأسعار
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-main">معلومات التواصل</h3>
              </div>
              <div className="space-y-4">
                <InfoRow
                  icon={<Users size={18} />}
                  label="مسؤول التواصل"
                  value={partner.contact_person}
                />
                <InfoRow
                  icon={<Phone size={18} />}
                  label="رقم الهاتف"
                  value={partner.phone}
                  dir="ltr"
                />
                <InfoRow
                  icon={<Mail size={18} />}
                  label="البريد الإلكتروني"
                  value={partner.email}
                />
                <InfoRow
                  icon={<Globe size={18} />}
                  label="الموقع الإلكتروني"
                  value={partner.website}
                  isLink
                />
                <InfoRow
                  icon={<MapPin size={18} />}
                  label="العنوان"
                  value={partner.address}
                />
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-main">تفاصيل العقد</h3>
              </div>
              <div className="space-y-4">
                <InfoRow label="الرقم الضريبي" value={partner.tax_number} />
                <InfoRow label="رقم العقد" value={partner.contract_number} />
                <div className="divider" />
                <InfoRow
                  label="تاريخ بداية العقد"
                  value={
                    partner.contract_start
                      ? format(new Date(partner.contract_start), "yyyy-MM-dd")
                      : "-"
                  }
                />
                <InfoRow
                  label="تاريخ نهاية العقد"
                  value={
                    partner.contract_end
                      ? format(new Date(partner.contract_end), "yyyy-MM-dd")
                      : "-"
                  }
                />
                <InfoRow
                  label="نسبة تحمل المريض"
                  value={
                    partner.patient_share_percentage
                      ? `${partner.patient_share_percentage}%`
                      : "-"
                  }
                />

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 mt-4">
                  <h4 className="text-sm font-medium text-secondary mb-2">
                    ملاحظات
                  </h4>
                  <p className="text-sm text-main">
                    {partner.notes || "لا توجد ملاحظات"}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <PartnerCustomersTab partnerId={partner.id} />
        </TabsContent>

        <TabsContent value="claims">
          <PartnerClaimsTab partnerId={partner.id} />
        </TabsContent>

        <TabsContent value="pricelist">
          <PartnerPriceListTab partnerId={partner.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsTile({ label, value, icon, color = "text-main" }: any) {
  return (
    <GlassCard padding="sm" className="flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium text-secondary">{label}</span>
        <div className="text-primary opacity-80">{icon}</div>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </GlassCard>
  );
}

function InfoRow({ icon, label, value, isLink, dir }: any) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border-main/30 last:border-0">
      <div className="flex items-center gap-3">
        {icon && <div className="text-secondary">{icon}</div>}
        <span className="text-sm text-secondary font-medium">{label}</span>
      </div>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm font-semibold text-main" dir={dir}>
          {value}
        </span>
      )}
    </div>
  );
}

function WalletIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
