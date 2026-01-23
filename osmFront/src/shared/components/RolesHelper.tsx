"use client";

import React from "react";
import { GlassCard } from "./ui/GlassCard";
import Badge from "./ui/Badge";
import {
  ShieldCheck,
  UserCog,
  Store,
  Package,
  BadgeDollarSign,
  Stethoscope,
  Users,
  HeartHandshake,
  UserMinus,
  UserCircle,
  FileText,
  CreditCard,
  Target,
} from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

/**
 * Roles Helper Component
 * دليل مساعد للأدوار والصلاحيات
 */

interface RoleInfo {
  role: string;
  description: string;
  scope: string;
  icon: React.ReactNode;
  variant:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "neutral";
}

const rolesData: RoleInfo[] = [
  {
    role: "TenantOwner",
    description: "مالك النظام للـ Tenant",
    scope: "كل الصلاحيات، التحكم الكامل بالـ Tenant + إعدادات المتجر والفروع",
    icon: <ShieldCheck className="w-5 h-5" />,
    variant: "primary",
  },
  {
    role: "TenantAdmin",
    description: "مدير العمليات داخل الـ Tenant",
    scope: "معظم الصلاحيات إلا التحكم بالـ Tenant-level settings",
    icon: <UserCog className="w-5 h-5" />,
    variant: "info",
  },
  {
    role: "BranchManager",
    description: "مسؤول فرع",
    scope: "إدارة فرع محدد: المبيعات، الموظفين داخل الفرع، المخزون داخل الفرع",
    icon: <Store className="w-5 h-5" />,
    variant: "success",
  },
  {
    role: "InventoryManager",
    description: "مسؤول المخزون عبر جميع الفروع",
    scope:
      "إدارة المخزون وعمليات النقل بين الفروع، الاطلاع على الطلبات للتحقق من المخزون",
    icon: <Package className="w-5 h-5" />,
    variant: "warning",
  },
  {
    role: "SalesClerk / Receptionist",
    description: "موظف المبيعات أو الاستقبال",
    scope: "إدارة المبيعات، الفواتير، العملاء، دعم العملاء",
    icon: <BadgeDollarSign className="w-5 h-5" />,
    variant: "secondary",
  },
  {
    role: "FinanceOfficer / Accountant",
    description: "مسؤول المالية",
    scope: "إدارة المدفوعات، الفواتير، التقارير المالية",
    icon: <CreditCard className="w-5 h-5" />,
    variant: "danger",
  },
  {
    role: "Optometrist / Assistant",
    description: "طبيب بصري / مساعد",
    scope: "إجراء الفحوصات، إنشاء الوصفات الطبية، طباعة الكروت",
    icon: <Stethoscope className="w-5 h-5" />,
    variant: "info",
  },
  {
    role: "HRManager",
    description: "إدارة شؤون الموظفين",
    scope: "إدارة الموظفين، حضور وغياب، جداول الرواتب",
    icon: <Users className="w-5 h-5" />,
    variant: "primary",
  },
  {
    role: "CRM Specialist",
    description: "إدارة العملاء",
    scope: "إدارة العملاء، متابعة الشراء والسجل الطبي، التسويق الداخلي",
    icon: <HeartHandshake className="w-5 h-5" />,
    variant: "success",
  },
  {
    role: "Guest",
    description: "مستخدم مؤقت",
    scope: "عرض محدود جدًا (قراءة فقط)",
    icon: <UserMinus className="w-5 h-5" />,
    variant: "neutral",
  },
  {
    role: "Customer",
    description: "مستخدم بوابة العملاء",
    scope: "وصول محدود إلى بياناته الشخصية والفواتير والخدمات",
    icon: <UserCircle className="w-5 h-5" />,
    variant: "info",
  },
];

const RolesHelper = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          دليل الأدوار والصلاحيات
        </h2>
        <p className="text-muted-foreground text-sm">
          توضيح لكافة الأدوار المتاحة في النظام ونطاق صلاحيات كل منها لضمان
          كفاءة العمل.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rolesData.map((item, index) => (
          <GlassCard
            key={index}
            hover
            animate="slide-up"
            className="flex flex-col h-full border-white/20 dark:border-white/5 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-start gap-4 mb-5">
              <div
                className={cn(
                  "p-3 rounded-2xl shrink-0 opacity-80",
                  item.variant === "primary" && "bg-primary/20 text-primary",
                  item.variant === "info" && "bg-blue-500/20 text-blue-500",
                  item.variant === "success" &&
                    "bg-green-500/20 text-green-500",
                  item.variant === "warning" &&
                    "bg-yellow-500/20 text-yellow-500",
                  item.variant === "danger" && "bg-red-500/20 text-red-500",
                  item.variant === "secondary" &&
                    "bg-indigo-500/20 text-indigo-500",
                  item.variant === "neutral" &&
                    "bg-slate-500/20 text-slate-400",
                )}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-lg leading-tight truncate mb-1">
                  {item.role}
                </h3>
                <Badge
                  variant={item.variant}
                  size="sm"
                  outline
                  className="font-arabic font-normal"
                >
                  {item.description}
                </Badge>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5 px-1">
                <FileText className="w-3 h-3" />
                SCOPE / النطاق
              </h4>
              <div className="text-sm leading-relaxed text-main/80 bg-white/5 dark:bg-black/20 p-3 rounded-xl border border-white/5">
                {item.scope}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default RolesHelper;
