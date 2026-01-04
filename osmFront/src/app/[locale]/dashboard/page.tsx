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
  const userRole = user?.role?.name?.toLowerCase();
  console.log(user, userRole);
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


const links = [
  // Tenant
  {
    href: "clients",
    roles: ["owner"],
    group: "Tenant",
    isTenant: false,
    icon: Users,
  },
  {
    href: "register-tenants",
    roles: ["owner"],
    group: "Tenant",
    isTenant: false,
    icon: UserPlus,
  },
  {
    href: "domain",
    roles: ["owner"],
    group: "Tenant",
    isTenant: false,
    icon: Globe,
  },
  {
    href: "payments",
    roles: ["owner"],
    group: "Billing",
    isTenant: false,
    icon: CreditCard,
  },
  // Billing
  {
    href: "subscription-plans",
    roles: ["owner"],
    group: "Billing",
    isTenant: false,
    icon: LayoutList,
  },
  // Users
  {
    href: "roles",
    roles: ["owner", "admin"],
    group: "Access Control",
    isTenant: true,
    icon: Shield,
  },
  {
    href: "users",
    roles: ["owner", "admin"],
    group: "Access Control",
    isTenant: true,
    icon: Users,
  },
  {
    href: "permissions",
    roles: ["owner", "admin"],
    group: "Access Control",
    isTenant: true,
    icon: Key,
  },
  {
    href: "role-permissions",
    roles: ["owner", "admin"],
    group: "Access Control",
    isTenant: true,
    icon: ShieldCheck,
  },
  {
    href: "contact-us",
    roles: ["owner", "admin"],
    group: "Support",
    isTenant: true,
    icon: Headphones,
  },
  {
    href: "tenant-settings",
    roles: ["owner", "admin"],
    group: "Settings",
    isTenant: true,
    icon: Settings,
  },
  // CRM
  {
    href: "customers",
    roles: ["owner", "admin", "crm"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-interactions",
    roles: ["owner", "admin", "crm"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-complaints",
    roles: ["owner", "admin", "crm"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-opportunities",
    roles: ["owner", "admin", "crm"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-tasks",
    roles: ["owner", "admin", "crm"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-campaigns",
    roles: ["owner", "admin", "crm"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-documents",
    roles: ["owner", "admin", "crm"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-subscriptions",
    roles: ["owner", "admin", "crm"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-customer-groups",
    roles: ["owner", "admin", "crm"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-contacts",
    roles: ["owner", "admin", "crm"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  // HRM
  {
    href: "hrm-departments",
    roles: ["owner", "admin", "hrm"],
    group: "Hrm",
    isTenant: true,
    icon: Building2,
  },
  {
    href: "hrm-employees",
    roles: ["owner", "admin", "hrm"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-employees",
    roles: ["owner", "admin", "hrm"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-employee-leave",
    roles: ["owner", "admin", "hrm"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-attendance",
    roles: ["owner", "admin", "hrm"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-performance-review",
    roles: ["owner", "admin", "hrm"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-payroll",
    roles: ["owner", "admin", "hrm"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-tasks",
    roles: ["owner", "admin", "hrm"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-notifications",
    roles: ["owner", "admin", "hrm"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  // Prescriptions
  {
    href: "prescriptions",
    roles: ["owner", "admin", "prescriptions"],
    group: "Prescriptions",
    isTenant: true,
    icon: FileText,
  },
  // Branch
  {
    href: "branch-users",
    roles: ["owner", "admin", "branch"],
    group: "Branch",
    isTenant: true,
    icon: UserCog,
  },
  {
    href: "branches",
    roles: ["owner", "admin", "branch"],
    group: "Branch",
    isTenant: true,
    icon: Store,
  },
  {
    href: "branches-shift",
    roles: ["owner", "admin", "branch"],
    group: "Branch",
    isTenant: true,
    icon: Store,
  },
  // Product
  {
    href: "attributes",
    roles: ["owner"],
    group: "Product",
    isTenant: true,
    icon: Grid,
  },
  {
    href: "attribute-values",
    roles: ["owner"],
    group: "Product",
    isTenant: true,
    icon: List,
  },
  {
    href: "suppliers",
    roles: ["owner"],
    group: "Product",
    isTenant: true,
    icon: Truck,
  },
  {
    href: "manufacturers",
    roles: ["owner"],
    group: "Product",
    isTenant: true,
    icon: Factory,
  },
  {
    href: "brands",
    roles: ["owner"],
    group: "Product",
    isTenant: true,
    icon: Star,
  },
  {
    href: "categories",
    roles: ["owner"],
    group: "Product",
    isTenant: true,
    icon: Layers,
  },
  // {
  //   href: "lens-coatings",
  //   roles: ["owner"],
  //   group: "Product",
  //   isTenant: true,
  //   icon: Eye,
  // },
  {
    href: "products",
    roles: ["owner"],
    group: "Product",
    isTenant: true,
    icon: Package,
  },
  // {
  //   href: "product-variants",
  //   roles: ["owner"],
  //   group: "Product",
  //   isTenant: true,
  //   icon: Tags,
  // },
  {
    href: "product-images",
    roles: ["owner"],
    group: "Product",
    isTenant: true,
    icon: ImageIcon,
  },
  {
    href: "flexible-prices",
    roles: ["owner"],
    group: "Product",
    isTenant: true,
    icon: DollarSign,
  },
  {
    href: "pages",
    roles: ["owner", "admin"],
    group: "Pages",
    isTenant: true,
    icon: FileText,
  },
];
