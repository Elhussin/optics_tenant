import { ActionButton } from "@/components/ui/buttons";
export default function DashboardLinks() {
  const links = [
    // Produact
    { href: "/dashboard/supplier?action=viewAll", label: "Suppliers" },
    { href: "/dashboard/category?action=viewAll", label: "Categories" },
    { href: "/dashboard/product?action=viewAll", label: "Products" },

    // Hrm
    { href: "/dashboard/department?action=viewAll", label: "Departments" },
    { href: "/dashboard/employees?action=viewAll", label: "Employees" },

    // branch
    { href: "/dashboard/branch?action=viewAll", label: "Branches" },

    // user
    { href: "/dashboard/user?action=viewAll", label: "Users" },
    { href: "/dashboard/tenant_settings?action=viewAll", label: "Tenant Setting" },


    // subscription
    { href: "/dashboard/subscription?action=viewAll", label: "Subscription Plans" },

    // manufacturer
    { href: "/dashboard/manufacturer?action=viewAll", label: "Manufacturers" },

    // CRM
    { href: "/dashboard/customer?action=viewAll", label: "Customers" },

    // Sales
    { href: "/dashboard/order?action=viewAll", label: "Orders" },
  
    { href: "/dashboard/invoice?action=viewAll", label: "Invoices" },

    // Tenant
    { href: "/dashboard/tenant?action=viewAll", label: "Tenants" },
    { href: "/dashboard/role?action=viewAll", label: "Roles" },


    // Content
    { href: "/dashboard/page?action=viewAll", label: "Pages" },
    { href: "/dashboard/pagecontent?action=viewAll", label: "Page Content" },

    { href: "/dashboard/setting?action=viewAll", label: "Settings" }
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
