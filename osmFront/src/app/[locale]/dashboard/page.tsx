"use client";
import { useTranslations } from "next-intl";
import { getSubdomain } from "@/src/shared/utils/getSubdomain";
import { Link } from "@/src/app/i18n/navigation";
import { useUser } from "@/src/features/auth/hooks/UserContext";

import {dashboardLink} from "@/src/features/dashboard/constants";
export default function DashboardLinks() {
  const { user } = useUser();

  const t = useTranslations("dashboardLinks");

  const subdomain = getSubdomain();
  const userRoles = user?.roles?.map((r: any) => r.name) || [];
  console.log(user, userRoles);
  const allowedLinks = dashboardLink.filter((link) => {
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
  }, {} as Record<string, typeof dashboardLink>);

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

