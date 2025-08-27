import { ActionButton } from "@/components/ui/buttons";
export default function DashboardLinks() {
  const links = [
    // Produact
    { href: "/dashboard/supplier", label: "Suppliers" },
    { href: "/dashboard/category", label: "Categories" },
    { href: "/dashboard/product", label: "Products" },

    // Hrm
    { href: "/dashboard/department", label: "Departments" },
    { href: "/dashboard/employees", label: "Employees" },

    // branch
    { href: "/dashboard/branch", label: "Branches" },

    // user
    { href: "/dashboard/user", label: "Users" },
    { href: "/dashboard/tenant_settings", label: "Tenant Setting" },


    // subscription
    { href: "/dashboard/subscription", label: "Subscription Plans" },

    // manufacturer
    { href: "/dashboard/manufacturer", label: "Manufacturers" },

    // CRM
    { href: "/dashboard/customer", label: "Customers" },

    // Sales
    { href: "/dashboard/order", label: "Orders" },
  
    { href: "/dashboard/invoice", label: "Invoices" },

    // Tenant
    { href: "/dashboard/tenant", label: "Tenants" },
    { href: "/dashboard/role", label: "Roles" },


    // Content
    { href: "/dashboard/page", label: "Pages" },
    { href: "/dashboard/pagecontent", label: "Page Content" },

    { href: "/dashboard/setting", label: "Settings" }
  ];

  return (

    <div className="flex flex-wrap gap-2 p-4 ">
      {links.map(({ href, label }) => (
        <div className="flex flex-wrap gap-2 p-4 card" key={href}>
          <ActionButton  label={label} navigateTo={href} variant="outline" />
        </div>
      ))}
    </div>
  );
}
