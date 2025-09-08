// "use client";
// import { useTranslations } from "next-intl";
// import { ActionButton } from "@/components/ui/buttons";
// import {Link} from "@/app/i18n/navigation";
// import { useUser } from "@/lib/contexts/userContext";

// export default function DashboardLinks() {
//   const {user} =useUser()
//   console.log(user)
//   const t = useTranslations("hrefs");
//   const links = [
//     { href: "client", role: "OWNER" },
//     { href: "register_tenant", role: "OWNER" },
//     { href: "domain", role: "OWNER" },
//     { href: "payment", role: "OWNER" },
//     { href: "subscription_plan", role: "OWNER" },
//     { href: "roles", role: "OWNER" },
//     { href: "users", role: "OWNER" },
//     { href: "permissions", role: "OWNER" },
//     { href: "role_permission", role: "OWNER" },
//     { href: "tenant_settings", role: "OWNER" },
//     { href: "contact_us", role: "OWNER" },
//   ];



//   return (
//       <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//       {links.map(({ href, role }) => (
//         <Link href={`/dashboard/${href}/`} key={href} className="card">
//           {t(href)}
//         </Link>
//       ))}
//     </div>
//   );
// }



          // <ActionButton  label={t(href)} navigateTo={`/dashboard/${href}/`} variant="outline" title={t(href)} className=" card" key={href} />


"use client";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/ui/buttons";
import {Link} from "@/app/i18n/navigation";
import { useUser } from "@/lib/contexts/userContext";

export default function DashboardLinks() {
  const {user} =useUser()
  console.log(user)
  const t = useTranslations("hrefs");
  const links = [
    { href: "client", roles: ["OWNER"], group: "Tenant" },
    { href: "register_tenant", roles: ["OWNER"], group: "Tenant" },
    { href: "domain", roles: ["OWNER"], group: "Tenant" },
    
    { href: "payment", roles: ["OWNER"], group: "Billing" },
    { href: "subscription_plan", roles: ["OWNER"], group: "Billing" },
    
    { href: "roles", roles: ["OWNER"], group: "Access Control" },
    { href: "users", roles: ["OWNER"], group: "Access Control" },
    { href: "permissions", roles: ["OWNER"], group: "Access Control" },
    { href: "role_permission", roles: ["OWNER"], group: "Access Control" },
    
    { href: "tenant_settings", roles: ["OWNER"], group: "Settings" },
    { href: "contact_us", roles: ["OWNER"], group: "Support" },
  ];
  
  const userRole = user?.role?.name?.toUpperCase(); // "OWNER"

  const allowedLinks = links.filter(link => link.roles.includes(userRole));
  

  const groupedLinks = allowedLinks.reduce((acc, link) => {
    if (!acc[link.group]) acc[link.group] = [];
    acc[link.group].push(link);
    return acc;
  }, {} as Record<string, typeof links>);
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedLinks).map(([group, links]) => (
        <div key={group}>
          <h2 className="text-lg font-bold mb-2">{group}</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {links.map(({ href }) => (
              <Link href={`/dashboard/${href}/`} key={href} className="card ">
                {t(href)}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
  
}

