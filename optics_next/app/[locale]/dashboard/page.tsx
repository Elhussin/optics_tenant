"use client";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/ui/buttons";

export default function DashboardLinks() {
  const t = useTranslations("hrefs");
  console.log(t)
  const links = [
    // Produact
    { href: "client", role: "Suppliers" },
    { href: "register_tenant", role: "Categories" },


    // Hrm
    { href: "domain", role: "Departments" },
    { href: "payment", role: "Employees" },

    // branch
    { href: "subscription_plan", role: "Branches" },
    { href: "roles", role: "Tenant Setting" },
    // user
    { href: "users", role: "Users" },

    // subscription
    { href: "permissions", role: "Manufacturers" },

    // CRM
    { href: "role_permission", role: "Customers" },

    // Sales
    { href: "tenant_settings", role: "Orders" },
    { href: "contact_us", role: "Invoices" },
  ];



  return (
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {links.map(({ href, role }) => (

          <ActionButton  label={t(href)} navigateTo={`/dashboard/${href}/`} variant="outline" title={t(href)} className=" card" key={href} />
      ))}
    </div>
  );
}
