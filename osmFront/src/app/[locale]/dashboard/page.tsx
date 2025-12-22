"use client";
import { useTranslations } from "next-intl";
import { getSubdomain } from "@/src/shared/utils/getSubdomain";
import { Link } from "@/src/app/i18n/navigation";
import { useUser } from "@/src/features/auth/hooks/UserContext";
import {
  Users,
  UserPlus,
  Globe,
  CreditCard,
  LayoutList,
  Shield,
  Key,
  ShieldCheck,
  Headphones,
  Settings,
  Building2,
  Briefcase,
  UserCog,
  Store,
  Smile,
  FileText,
  Grid,
  List,
  Truck,
  Factory,
  Star,
  Layers,
  Eye,
  Package,
  Tags,
  Image as ImageIcon,
  DollarSign,
} from "lucide-react";

export default function DashboardLinks() {
  const { user } = useUser();
  const t = useTranslations("formsConfig");

  const subdomain = getSubdomain();
  const userRole = user?.role?.name?.toUpperCase();

  const allowedLinks = links.filter((link) => {
    // 1. فلترة حسب الصلاحية
    if (userRole && !link.roles.includes(userRole)) return false;
    // إذا لم يتم تحميل المستخدم بعد، نخفي الروابط أو ننتظر (هنا نخفيها مؤقتاً)
    if (!userRole) return false;

    // 2. فلترة حسب النطاق (Subdomain)
    if (subdomain) {
      // نحن في نطاق فرعي (متجر) -> نظهر فقط ما يخص المستأجر
      return link.isTenant === true;
    } else {
      // نحن في النطاق الرئيسي (لوحة الإدارة) -> نظهر فقط ما يخص إدارة النظام
      return link.isTenant === false;
    }
  });

  const groupedLinks = allowedLinks.reduce((acc, link) => {
    if (!acc[link.group]) acc[link.group] = [];
    acc[link.group].push(link);
    return acc;
  }, {} as Record<string, typeof links>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedLinks).map(([group, links]) => (
        <div key={group}>
          <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            {group}
          </h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {links.map(({ href, icon: Icon }) => (
              <Link
                href={`/dashboard/${href}/`}
                key={href}
                className="group flex flex-col items-center justify-center p-6 bg-surface hover:bg-body border border-transparent hover:border-primary/20 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-3 mb-3 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-primary text-center">
                  {t(href)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


export const links = [
    // Tenant
    {
      href: "clients",
      roles: ["OWNER"],
      group: "Tenant",
      isTenant: false,
      icon: Users,
    },
    {
      href: "register-tenants",
      roles: ["OWNER"],
      group: "Tenant",
      isTenant: false,
      icon: UserPlus,
    },
    {
      href: "domains",
      roles: ["OWNER"],
      group: "Tenant",
      isTenant: false,
      icon: Globe,
    },
    {
      href: "payments",
      roles: ["OWNER"],
      group: "Billing",
      isTenant: false,
      icon: CreditCard,
    },
    {
      href: "subscription-plans",
      roles: ["OWNER"],
      group: "Billing",
      isTenant: false,
      icon: LayoutList,
    },
    // Users
    {
      href: "roles",
      roles: ["OWNER"],
      group: "Access Control",
      isTenant: true,
      icon: Shield,
    },
    {
      href: "users",
      roles: ["OWNER"],
      group: "Access Control",
      isTenant: true,
      icon: Users,
    },
    {
      href: "permissions",
      roles: ["OWNER"],
      group: "Access Control",
      isTenant: true,
      icon: Key,
    },
    {
      href: "role-permissions",
      roles: ["OWNER"],
      group: "Access Control",
      isTenant: true,
      icon: ShieldCheck,
    },
    {
      href: "contact-us",
      roles: ["OWNER"],
      group: "Support",
      isTenant: true,
      icon: Headphones,
    },
    {
      href: "tenant-settings",
      roles: ["OWNER"],
      group: "Settings",
      isTenant: true,
      icon: Settings,
    },
    {
      href: "departments",
      roles: ["OWNER"],
      group: "Settings",
      isTenant: true,
      icon: Building2,
    },
    {
      href: "employees",
      roles: ["OWNER"],
      group: "Branch",
      isTenant: true,
      icon: Briefcase,
    },
    {
      href: "customers",
      roles: ["OWNER"],
      group: "Customer",
      isTenant: true,
      icon: Smile,
    },
    {
      href: "prescriptions",
      roles: ["OWNER"],
      group: "Prescriptions",
      isTenant: true,
      icon: FileText,
    },
    {
      href: "branch-users",
      roles: ["OWNER"],
      group: "Branch",
      isTenant: true,
      icon: UserCog,
    },
    {
      href: "branches",
      roles: ["OWNER"],
      group: "Branch",
      isTenant: true,
      icon: Store,
    },
    {
      href: "attributes",
      roles: ["OWNER"],
      group: "Product",
      isTenant: true,
      icon: Grid,
    },
    {
      href: "attribute-values",
      roles: ["OWNER"],
      group: "Product",
      isTenant: true,
      icon: List,
    },
    {
      href: "suppliers",
      roles: ["OWNER"],
      group: "Product",
      isTenant: true,
      icon: Truck,
    },
    {
      href: "manufacturers",
      roles: ["OWNER"],
      group: "Product",
      isTenant: true,
      icon: Factory,
    },
    {
      href: "brands",
      roles: ["OWNER"],
      group: "Product",
      isTenant: true,
      icon: Star,
    },
    {
      href: "categories",
      roles: ["OWNER"],
      group: "Product",
      isTenant: true,
      icon: Layers,
    },
    {
      href: "lens-coatings",
      roles: ["OWNER"],
      group: "Product",
      isTenant: true,
      icon: Eye,
    },
    {
      href: "products",
      roles: ["OWNER"],
      group: "Product",
      isTenant: true,
      icon: Package,
    },
    {
      href: "product-variants",
      roles: ["OWNER"],
      group: "Product",
      isTenant: true,
      icon: Tags,
    },
    {
      href: "product-images",
      roles: ["OWNER"],
      group: "Product",
      isTenant: true,
      icon: ImageIcon,
    },
    {
      href: "flexible-prices",
      roles: ["OWNER"],
      group: "Product",
      isTenant: true,
      icon: DollarSign,
    },
  ];
