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
  ShoppingCart,
  Warehouse,
  BarChart3,
} from "lucide-react";

export default function DashboardLinks() {
  const { user } = useUser();

  const t = useTranslations("formsConfig");

  const subdomain = getSubdomain();
  const userRoles = user?.roles?.map((r: any) => r.name) || [];
  console.log(user, userRoles);
  const allowedLinks = links.filter((link) => {
    // 1. فلترة حسب الصلاحية
    const hasAccess = link.roles.some((role) => userRoles.includes(role));
    if (!hasAccess) return false;

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
    roles: ["TenantOwner"],
    group: "Tenant",
    isTenant: false,
    icon: Users,
  },
  {
    href: "register-tenants",
    roles: ["TenantOwner"],
    group: "Tenant",
    isTenant: false,
    icon: UserPlus,
  },
  {
    href: "domain",
    roles: ["TenantOwner"],
    group: "Tenant",
    isTenant: false,
    icon: Globe,
  },
  {
    href: "payments",
    roles: ["TenantOwner"],
    group: "Billing",
    isTenant: false,
    icon: CreditCard,
  },
  // Billing
  {
    href: "subscription-plans",
    roles: ["TenantOwner"],
    group: "Billing",
    isTenant: false,
    icon: LayoutList,
  },
  // Access Control
  {
    href: "roles",
    roles: ["TenantOwner", "TenantAdmin"],
    group: "Access Control",
    isTenant: true,
    icon: Shield,
  },
  {
    href: "users",
    roles: ["TenantOwner", "TenantAdmin"],
    group: "Access Control",
    isTenant: true,
    icon: Users,
  },
  {
    href: "permissions",
    roles: ["TenantOwner", "TenantAdmin"],
    group: "Access Control",
    isTenant: true,
    icon: Key,
  },
  {
    href: "role-permissions",
    roles: ["TenantOwner", "TenantAdmin"],
    group: "Access Control",
    isTenant: true,
    icon: ShieldCheck,
  },
  // Support & Settings
  {
    href: "contact-us",
    roles: ["TenantOwner", "TenantAdmin"],
    group: "Support",
    isTenant: true,
    icon: Headphones,
  },
  {
    href: "tenant-settings",
    roles: ["TenantOwner", "TenantAdmin"],
    group: "Settings",
    isTenant: true,
    icon: Settings,
  },
  // CRM
  {
    href: "customers",
    roles: ["TenantOwner", "TenantAdmin", "CRMSpecialist", "SalesClerk"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-interactions",
    roles: ["TenantOwner", "TenantAdmin", "CRMSpecialist"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "partners",
    roles: ["TenantOwner", "TenantAdmin", "CRMSpecialist", "FinanceOfficer"],
    group: "Customer",
    isTenant: true,
    icon: Building2,
  },
  {
    href: "crm-complaints",
    roles: [
      "TenantOwner",
      "TenantAdmin",
      "CRMSpecialist",
      "CustomerServiceRep",
    ],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-opportunities",
    roles: ["TenantOwner", "TenantAdmin", "CRMSpecialist"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-tasks",
    roles: ["TenantOwner", "TenantAdmin", "CRMSpecialist"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-campaigns",
    roles: ["TenantOwner", "TenantAdmin", "CRMSpecialist"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-documents",
    roles: ["TenantOwner", "TenantAdmin", "CRMSpecialist"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-subscriptions",
    roles: ["TenantOwner", "TenantAdmin", "CRMSpecialist"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  {
    href: "crm-customer-groups",
    roles: ["TenantOwner", "TenantAdmin", "CRMSpecialist"],
    group: "Customer",
    isTenant: true,
    icon: Smile,
  },
  // HRM
  {
    href: "hrm-departments",
    roles: ["TenantOwner", "TenantAdmin", "HRManager"],
    group: "Hrm",
    isTenant: true,
    icon: Building2,
  },
  {
    href: "hrm-employees",
    roles: ["TenantOwner", "TenantAdmin", "HRManager"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-employee-leave",
    roles: ["TenantOwner", "TenantAdmin", "HRManager"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-attendance",
    roles: ["TenantOwner", "TenantAdmin", "HRManager"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-performance-review",
    roles: ["TenantOwner", "TenantAdmin", "HRManager"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-payroll",
    roles: ["TenantOwner", "TenantAdmin", "HRManager", "FinanceOfficer"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-tasks",
    roles: ["TenantOwner", "TenantAdmin", "HRManager"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  {
    href: "hrm-notifications",
    roles: ["TenantOwner", "TenantAdmin", "HRManager"],
    group: "Hrm",
    isTenant: true,
    icon: Briefcase,
  },
  // Prescriptions
  {
    href: "prescriptions",
    roles: ["TenantOwner", "TenantAdmin", "Optometrist"],
    group: "Prescriptions",
    isTenant: true,
    icon: FileText,
  },
  // Branch
  {
    href: "branch-users",
    roles: ["TenantOwner", "TenantAdmin", "BranchManager"],
    group: "Branch",
    isTenant: true,
    icon: UserCog,
  },
  {
    href: "branches",
    roles: ["TenantOwner", "TenantAdmin", "BranchManager"],
    group: "Branch",
    isTenant: true,
    icon: Store,
  },
  {
    href: "branches-shift",
    roles: ["TenantOwner", "TenantAdmin", "BranchManager"],
    group: "Branch",
    isTenant: true,
    icon: Store,
  },
  // Product
  {
    href: "attributes",
    roles: ["TenantOwner", "TenantAdmin", "InventoryManager"],
    group: "Product",
    isTenant: true,
    icon: Grid,
  },
  {
    href: "attribute-values",
    roles: ["TenantOwner", "TenantAdmin", "InventoryManager"],
    group: "Product",
    isTenant: true,
    icon: List,
  },
  {
    href: "suppliers",
    roles: ["TenantOwner", "TenantAdmin", "InventoryManager"],
    group: "Product",
    isTenant: true,
    icon: Truck,
  },
  {
    href: "manufacturers",
    roles: ["TenantOwner", "TenantAdmin", "InventoryManager"],
    group: "Product",
    isTenant: true,
    icon: Factory,
  },
  {
    href: "brands",
    roles: ["TenantOwner", "TenantAdmin", "InventoryManager"],
    group: "Product",
    isTenant: true,
    icon: Star,
  },
  {
    href: "categories",
    roles: ["TenantOwner", "TenantAdmin", "InventoryManager"],
    group: "Product",
    isTenant: true,
    icon: Layers,
  },
  {
    href: "product",
    roles: [
      "TenantOwner",
      "TenantAdmin",
      "InventoryManager",
      "BranchManager",
      "SalesClerk",
    ],
    group: "Product",
    isTenant: true,
    icon: Package,
  },
  {
    href: "product-images",
    roles: ["TenantOwner", "TenantAdmin", "InventoryManager"],
    group: "Product",
    isTenant: true,
    icon: ImageIcon,
  },
  {
    href: "flexible-prices",
    roles: ["TenantOwner", "TenantAdmin", "InventoryManager", "BranchManager"],
    group: "Product",
    isTenant: true,
    icon: DollarSign,
  },
  {
    href: "pages",
    roles: ["TenantOwner", "TenantAdmin"],
    group: "Pages",
    isTenant: true,
    icon: FileText,
  },
  // Orders & Sales
  {
    href: "orders",
    roles: ["TenantOwner", "TenantAdmin", "SalesClerk", "BranchManager"],
    group: "Sales",
    isTenant: true,
    icon: ShoppingCart,
  },
  // Wholesale
  {
    href: "wholesale",
    roles: ["TenantOwner", "TenantAdmin", "SalesClerk", "BranchManager"],
    group: "Sales",
    isTenant: true,
    icon: Truck,
  },
  // Inventory
  {
    href: "inventory",
    roles: ["TenantOwner", "TenantAdmin", "InventoryManager", "BranchManager"],
    group: "Inventory",
    isTenant: true,
    icon: Warehouse,
  },
  // Reports
  {
    href: "reports",
    roles: ["TenantOwner", "TenantAdmin", "BranchManager", "FinanceOfficer"],
    group: "Reports",
    isTenant: true,
    icon: BarChart3,
  },
  // Accounting
  {
    href: "accounting",
    roles: ["TenantOwner", "TenantAdmin", "FinanceOfficer"],
    group: "Accounting",
    isTenant: true,
    icon: DollarSign,
  },
];
