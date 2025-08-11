// 'use client';
// import { useRouter } from '@/app/i18n/navigation';

import {Link} from "@/app/i18n/navigation";

export default function DashboardLinks() {
  const links = [
    { href: "/dashboard/supplier?action=viewAll", label: "Suppliers" },
    { href: "/dashboard/department?action=viewAll", label: "Departments" },
    { href: "/dashboard/branch?action=viewAll", label: "Branches" },
    { href: "/dashboard/user?action=viewAll", label: "Users" },
    { href: "/dashboard/subscription?action=viewAll", label: "Subscription Plans" },
    { href: "/dashboard/manufacturer?action=viewAll", label: "Manufacturers" },
    { href: "/dashboard/customer?action=viewAll", label: "Customers" },
    { href: "/dashboard/order?action=viewAll", label: "Orders" },
    { href: "/dashboard/tenant?action=viewAll", label: "Tenants" },
    { href: "/dashboard/page?action=viewAll", label: "Pages" },
    { href: "/dashboard/pagecontent?action=viewAll", label: "Page Content" },
    { href: "/dashboard/role?action=viewAll", label: "Roles" },
    { href: "/dashboard/category?action=viewAll", label: "Categories" },
    { href: "/dashboard/product?action=viewAll", label: "Products" },
    { href: "/dashboard/employees?action=viewAll", label: "Employees" },
    { href: "/dashboard/expense?action=viewAll", label: "Expenses" },
    { href: "/dashboard/invoice?action=viewAll", label: "Invoices" },
    { href: "/dashboard/notification?action=viewAll", label: "Notifications" },
    { href: "/dashboard/setting?action=viewAll", label: "Settings" }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ href, label }) => (
        <Link key={href} href={href} className="btn">
          {label}
        </Link>
      ))}
    </div>
  );
}
