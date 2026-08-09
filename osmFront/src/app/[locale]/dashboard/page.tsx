"use client";
import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getSubdomain } from "@/src/shared/utils/getSubdomain";
import { Link } from "@/src/app/i18n/navigation";
import { useUser } from "@/src/features/auth/hooks/UserContext";
import { dashboardLink } from "@/src/features/dashboard/constants";
import { PageHeader } from "@/src/shared/components/ui/PageHeader";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Search,
  LayoutGrid,
  Building2,
  CreditCard,
  Shield,
  Headphones,
  Settings,
  Users,
  Briefcase,
  FileText,
  Store,
  Package,
  Layers,
  ShoppingCart,
  Warehouse,
  BarChart3,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

const groupsInfo: Record<
  string,
  { en: string; ar: string; icon: any; color: string; descEn: string; descAr: string }
> = {
  Tenant: {
    icon: Building2,
    en: "Tenant Management",
    ar: "إدارة المستأجرين",
    descEn: "Manage tenant details, domains, and register new tenants.",
    descAr: "إدارة تفاصيل المستأجر والنطاقات وتسجيل مستأجرين جدد.",
    color: "from-blue-500/10 to-indigo-500/10 text-blue-500 border-blue-500/20"
  },
  Billing: {
    icon: CreditCard,
    en: "Billing & Subscriptions",
    ar: "الفواتير والاشتراكات",
    descEn: "View subscription plans and billing details.",
    descAr: "عرض خطط الاشتراك وتفاصيل الفواتير.",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-500 border-emerald-500/20"
  },
  "Access Control": {
    icon: Shield,
    en: "Access Control",
    ar: "الصلاحيات والأدوار",
    descEn: "Manage users, roles, and permissions.",
    descAr: "إدارة المستخدمين والأدوار والصلاحيات.",
    color: "from-red-500/10 to-orange-500/10 text-red-500 border-red-500/20"
  },
  Support: {
    icon: Headphones,
    en: "Support & Help",
    ar: "الدعم والمساعدة",
    descEn: "Get help and contact support.",
    descAr: "الحصول على المساعدة والتواصل مع الدعم الفني.",
    color: "from-pink-500/10 to-rose-500/10 text-pink-500 border-pink-500/20"
  },
  Settings: {
    icon: Settings,
    en: "Settings",
    ar: "الإعدادات",
    descEn: "Configure tenant-wide settings.",
    descAr: "تكوين إعدادات المستأجر العامة.",
    color: "from-slate-500/10 to-gray-500/10 text-slate-500 border-slate-500/20"
  },
  Customer: {
    icon: Users,
    en: "CRM & Customers",
    ar: "العملاء والـ CRM",
    descEn: "Manage customers, interactions, opportunities, campaigns, and claims.",
    descAr: "إدارة العملاء، التفاعلات، الفرص، الحملات والمطالبات.",
    color: "from-sky-500/10 to-cyan-500/10 text-sky-500 border-sky-500/20"
  },
  Hrm: {
    icon: Briefcase,
    en: "Human Resources (HR)",
    ar: "الموارد البشرية",
    descEn: "Manage employees, departments, attendance, payroll, and tasks.",
    descAr: "إدارة الموظفين، الأقسام، الحضور، الرواتب والمهام.",
    color: "from-amber-500/10 to-orange-500/10 text-amber-500 border-amber-500/20"
  },
  Prescriptions: {
    icon: FileText,
    en: "Prescriptions",
    ar: "الوصفات الطبية",
    descEn: "Manage patient eye prescriptions.",
    descAr: "إدارة الوصفات الطبية الخاصة بالعيون للعملاء.",
    color: "from-violet-500/10 to-purple-500/10 text-violet-500 border-violet-500/20"
  },
  Branch: {
    icon: Store,
    en: "Branch Management",
    ar: "إدارة الفروع",
    descEn: "Manage branches, branch users, and shifts.",
    descAr: "إدارة الفروع ومستخدمي الفروع والمناوبات.",
    color: "from-rose-500/10 to-red-500/10 text-rose-500 border-rose-500/20"
  },
  Product: {
    icon: Package,
    en: "Product Catalog",
    ar: "دليل المنتجات",
    descEn: "Manage products, categories, attributes, and pricing policies.",
    descAr: "إدارة المنتجات، التصنيفات، الخصائص وسياسات التسعير.",
    color: "from-teal-500/10 to-emerald-500/10 text-teal-500 border-teal-500/20"
  },
  Pages: {
    icon: Layers,
    en: "Pages CMS",
    ar: "إدارة صفحات المحتوى",
    descEn: "Manage site pages and content.",
    descAr: "إدارة الصفحات والمحتوى الخاص بالموقع.",
    color: "from-indigo-500/10 to-violet-500/10 text-indigo-500 border-indigo-500/20"
  },
  Sales: {
    icon: ShoppingCart,
    en: "Sales & Invoices",
    ar: "المبيعات والفواتير",
    descEn: "Manage orders, invoices, payments, and billing methods.",
    descAr: "إدارة الطلبات، الفواتير، المدفوعات وطرق الدفع.",
    color: "from-green-500/10 to-emerald-500/10 text-green-500 border-green-500/20"
  },
  Inventory: {
    icon: Warehouse,
    en: "Inventory & Stock",
    ar: "المخازن والمستودعات",
    descEn: "Manage stock quantities, movements, and transfers.",
    descAr: "إدارة كميات المخزون، الحركات، والتحويلات بين الفروع.",
    color: "from-yellow-500/10 to-amber-500/10 text-yellow-600 border-yellow-500/20"
  },
  Reports: {
    icon: BarChart3,
    en: "Reports & Analysis",
    ar: "التقارير والتحليلات",
    descEn: "View sales, inventory, and system performance reports.",
    descAr: "عرض تقارير المبيعات، المخزون، وأداء النظام.",
    color: "from-teal-500/10 to-cyan-500/10 text-teal-500 border-teal-500/20"
  },
  Accounting: {
    icon: DollarSign,
    en: "Accounting & Finance",
    ar: "الحسابات والمالية",
    descEn: "Manage chart of accounts, journal entries, taxes, and periods.",
    descAr: "إدارة دليل الحسابات، قيود اليومية، الضرائب والفترات المالية.",
    color: "from-indigo-500/10 to-sky-500/10 text-indigo-500 border-indigo-500/20"
  }
};

const localStrings: Record<
  string,
  {
    backToApps: string;
    appsTitle: string;
    searchPlaceholder: string;
    pagesCount: (count: number) => string;
    noResults: string;
    clearFilters: string;
    allPages: string;
  }
> = {
  en: {
    backToApps: "Back to Applications",
    appsTitle: "Applications",
    searchPlaceholder: "Search pages...",
    pagesCount: (count: number) => (count === 1 ? "1 page" : `${count} pages`),
    noResults: "No results found for",
    clearFilters: "Clear filters",
    allPages: "All Pages"
  },
  ar: {
    backToApps: "العودة إلى التطبيقات",
    appsTitle: "التطبيقات الرئيسية",
    searchPlaceholder: "البحث عن الصفحات...",
    pagesCount: (count: number) => {
      if (count === 1) return "صفحة واحدة";
      if (count === 2) return "صفحتان";
      if (count > 2 && count < 11) return `${count} صفحات`;
      return `${count} صفحة`;
    },
    noResults: "لم يتم العثور على نتائج لـ",
    clearFilters: "مسح الفلاتر",
    allPages: "جميع الصفحات"
  }
};

export default function DashboardLinks() {
  const { user } = useUser();
  const t = useTranslations("dashboardLinks");
  const locale = useLocale() || "ar";

  const subdomain = getSubdomain();
  const userRoles = user?.roles?.map((r: any) => r.name) || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const strings = localStrings[locale] || localStrings.ar;

  // 1. Filter links by Role & Subdomain
  const allowedLinks = useMemo(() => {
    return dashboardLink.filter((link) => {
      // 1. Filter by Role
      const hasAccess = link.roles.some((role) => userRoles.includes(role));
      if (!hasAccess) return false;

      // 2. Filter by Subdomain
      if (subdomain) {
        // We are in a subdomain (tenant store) -> show only tenant links
        return link.isTenant === true;
      } else {
        // We are in the main domain (admin panel) -> show only system admin links
        return link.isTenant === false;
      }
    });
  }, [userRoles, subdomain]);

  // 2. Extract unique Groups
  const uniqueGroups = useMemo(() => {
    const g = Array.from(new Set(allowedLinks.map((l) => l.group)));
    return g.sort();
  }, [allowedLinks]);

  // 3. Filter displayed links based on Search
  const filteredLinks = useMemo(() => {
    return allowedLinks.filter((link) => {
      // Translate the href to search against the display name
      const displayName = t(link.href) || link.href;
      return displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  }, [allowedLinks, searchQuery, t]);

  // Pages in the active selected group
  const groupPages = useMemo(() => {
    if (!selectedGroup) return [];
    return allowedLinks.filter((link) => link.group === selectedGroup);
  }, [allowedLinks, selectedGroup]);

  const currentGroupInfo = groupsInfo[selectedGroup || ""] || {
    en: selectedGroup || "",
    ar: selectedGroup || "",
    descEn: "",
    descAr: "",
    icon: LayoutGrid,
    color: "from-slate-500/10 to-gray-500/10 text-slate-500 border-slate-500/20"
  };

  const CurrentGroupIcon = currentGroupInfo.icon;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header with Search */}
      <PageHeader
        title={t("dashboard")}
        description={
          user?.email ? `${t("profile")} : ${user.username}` : undefined
        }
        icon={<LayoutGrid className="w-6 h-6" />}
        className="mb-8"
      >
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={strings.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-white/50 border-white/20 dark:bg-black/20 dark:border-white/10 rounded-xl focus:ring-primary/50"
          />
        </div>
      </PageHeader>

      {/* Search View */}
      {searchQuery ? (
        <div className="space-y-6">
          <div className="text-sm font-medium text-secondary">
            {strings.allPages} ({filteredLinks.length})
          </div>
          
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredLinks.map(({ href, icon: Icon, group }) => {
              const matchedGroupInfo = groupsInfo[group] || {
                en: group,
                ar: group,
                color: "text-slate-500 bg-slate-500/10",
              };
              return (
                <GlassCard
                  key={href}
                  className="group relative overflow-hidden border-transparent hover:border-primary/20 bg-surface/50 hover:bg-surface/80"
                  hover
                  padding="none"
                >
                  <Link href={`/dashboard/${href}/`} className="block p-6 h-full">
                    <div className="flex flex-col items-center justify-center gap-4 h-full">
                      <div
                        className={cn(
                          "p-4 rounded-2xl transition-all duration-300",
                          "bg-primary/5 group-hover:bg-primary/10 group-hover:scale-110",
                          "text-primary shadow-sm group-hover:shadow-md shadow-primary/10",
                        )}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="text-center space-y-1">
                        <h3 className="font-semibold text-main group-hover:text-primary transition-colors line-clamp-2">
                          {t(href)}
                        </h3>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-secondary/10 text-[10px] text-secondary font-medium uppercase tracking-wider">
                          {matchedGroupInfo[locale === "en" ? "en" : "ar"]}
                        </span>
                      </div>
                    </div>
                  </Link>
                </GlassCard>
              );
            })}
          </div>

          {filteredLinks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in mx-auto">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-secondary">
                <Search className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-secondary font-medium">
                {strings.noResults} &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-primary hover:underline text-sm"
              >
                {strings.clearFilters}
              </button>
            </div>
          )}
        </div>
      ) : selectedGroup ? (
        /* Selected Application View */
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedGroup(null)}
              className="flex items-center gap-2 hover:bg-primary/5 text-secondary hover:text-primary transition-all rounded-xl px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{strings.backToApps}</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-surface to-surface/80 border border-border shadow-sm">
            <div className={cn(
              "p-4 rounded-xl bg-gradient-to-br w-fit",
              currentGroupInfo.color
            )}>
              <CurrentGroupIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-main">
                {currentGroupInfo[locale === "en" ? "en" : "ar"]}
              </h2>
              <p className="text-sm text-secondary">
                {currentGroupInfo[locale === "en" ? "descEn" : "descAr"]}
              </p>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {groupPages.map(({ href, icon: Icon }) => (
              <GlassCard
                key={href}
                className="group relative overflow-hidden border-transparent hover:border-primary/20 bg-surface/50 hover:bg-surface/80"
                hover
                padding="none"
              >
                <Link href={`/dashboard/${href}/`} className="block p-6 h-full">
                  <div className="flex flex-col items-center justify-center gap-4 h-full">
                    <div
                      className={cn(
                        "p-4 rounded-2xl transition-all duration-300",
                        "bg-primary/5 group-hover:bg-primary/10 group-hover:scale-110",
                        "text-primary shadow-sm group-hover:shadow-md shadow-primary/10",
                      )}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-main group-hover:text-primary transition-colors line-clamp-2">
                        {t(href)}
                      </h3>
                    </div>
                  </div>
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      ) : (
        /* Applications List View */
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {uniqueGroups.map((group) => {
            const groupInfo = groupsInfo[group] || {
              icon: LayoutGrid,
              en: group,
              ar: group,
              descEn: "View tools and pages.",
              descAr: "عرض الأدوات والصفحات الخاصة بهذا القسم.",
              color: "from-slate-500/10 to-gray-500/10 text-slate-500 border-slate-500/20",
            };
            const GroupIcon = groupInfo.icon;
            const pagesCount = allowedLinks.filter((l) => l.group === group).length;

            return (
              <GlassCard
                key={group}
                className="group relative overflow-hidden border-transparent hover:border-primary/20 bg-surface/50 hover:bg-surface/80 cursor-pointer"
                hover
                padding="none"
              >
                <div onClick={() => setSelectedGroup(group)} className="block p-6 h-full">
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "p-3 rounded-xl bg-gradient-to-br transition-all duration-300",
                          "group-hover:scale-110",
                          groupInfo.color
                        )}
                      >
                        <GroupIcon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/10">
                        {strings.pagesCount(pagesCount)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-main group-hover:text-primary transition-colors text-lg">
                        {groupInfo[locale === "en" ? "en" : "ar"]}
                      </h3>
                      <p className="text-xs text-secondary line-clamp-2">
                        {groupInfo[locale === "en" ? "descEn" : "descAr"]}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
