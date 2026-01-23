// /home/hussin/code/optics_tenant/osmFront/src/shared/utils/middlewareHelper.ts

import { NextResponse, NextRequest } from "next/server";

export function getRequiredPermission(pathname: string): string | null {
  const cleanPath = pathname.replace(/^\/(ar|en)/, "") || "/";

  if (cleanPath === "/") return null;

  const publicPaths = [
    "/about", "/contact", "/services", "/pricing", "/faq", "/terms",
    "/views", "/privacy", "/support", "/careers", "/blog",
    "/unauthorized", "/auth/login", "/auth/register", "/auth/activate",
    "/auth/forgot-password", "/auth/reset-password", "/api/geo",
  ];

  if (publicPaths.some(path => cleanPath === path || cleanPath.startsWith(`${path}/`))) {
    return null;
  }

  if (cleanPath === "/dashboard") {
    return "authenticated_user";
  }

  // 🔹 التحديث ليتطابق مع الـ Backend Permissions (Singular)
  const groupPermissions: [RegExp, string][] = [
    // المستخدمين والأدوار
    [/^\/dashboard\/users/, "view_user"],
    [/^\/dashboard\/roles/, "view_role"],
    [/^\/dashboard\/permissions/, "view_permission"],

    // التقارير والمالية
    [/^\/dashboard\/reports/, "view_accounting"],
    [/^\/dashboard\/payments/, "view_accounting"],
    [/^\/dashboard\/accounting/, "view_accounting"],

    // المتجر والمخزون
    [/^\/dashboard\/products/, "view_product"],
    [/^\/dashboard\/inventory/, "view_inventory"],

    // المبيعات والطلبات
    [/^\/dashboard\/sales/, "view_sale"],
    [/^\/dashboard\/orders/, "view_sale"],

    // الموارد البشرية والعملاء
    [/^\/dashboard\/hrm/, "view_employee"],
    [/^\/dashboard\/crm/, "view_customer"],

    // فحوصات النظر (Prescriptions)
    [/^\/prescriptions\/(create|new)/, "create_prescription"],
    [/^\/prescriptions\/edit/, "edit_prescription"],
    [/^\/prescriptions(\/|$)/, "view_prescription"],

    // الفواتير
    [/^\/invoices\/(create|new)/, "view_invoice"],
    [/^\/invoices\/edit/, "view_invoice"],
    [/^\/invoices(\/|$)/, "view_invoice"],

    // إعدادات المتجر
    [/^\/dashboard\/settings/, "view_tenant_settings"],
    [/^\/dashboard\/subscription/, "view_tenant_settings"],
  ];

  for (const [regex, permission] of groupPermissions) {
    if (regex.test(cleanPath)) return permission;
  }

  return "authenticated_user";
}

export const dashboardPermissions: Record<string, string[]> = {
  "/dashboard": ["authenticated_user"],

  // الإعدادات المتقدمة (Owner)
  "/dashboard/settings": ["manage_tenant_settings"],
  "/dashboard/subscription": ["manage_tenant_settings"],

  // الإدارة
  "/dashboard/users": ["view_user"],
  "/dashboard/roles": ["manage_roles"],
  "/dashboard/reports": ["view_financial_reports"],

  // العمليات اليومية
  "/dashboard/inventory": ["view_inventory"],
  "/dashboard/sales": ["view_sale"],
  "/dashboard/prescriptions": ["view_prescription"],
  "/dashboard/invoices": ["view_invoice"],

  // Super Admin (Global)
  "/super-admin/tenants": ["manage_all_tenants"],
};

export function unauthorizedResponse(
  request: NextRequest,
  target: string,
  message: string
) {
  const redirectUrl = new URL(target, request.url);
  redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set("alert_message", message, {
    path: "/",
    maxAge: 30,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });

  response.cookies.set("alert_type", "error", {
    path: "/",
    maxAge: 30,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}