import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./app/i18n/routing";
import {
  getRequiredPermission,
  unauthorizedResponse,
} from "./lib/utils/middleware";

const DEFAULT_LOCALE = "en";
const LOCALE_REGEX = /^\/(ar|en)\//;
const PUBLIC_SUBDOMAIN = "public";

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};

const intl = createIntlMiddleware(routing);

function extractLocale(pathname: string): string | null {
  const match = pathname.match(/^\/(ar|en)(?=\/|$)/);
  return match ? match[1] : null; // null لو مش مدعوم
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  let subdomain = host.split(".")[0];

  if (subdomain.startsWith("localhost")) subdomain = PUBLIC_SUBDOMAIN;

  // الرد الافتراضي اللي هنستخدمه بعدين
  const response = NextResponse.next();

  // 📝 حفظ الـ tenant في كوكي
  response.cookies.set({
    name: "tenant",
    value: subdomain,
    path: "/",
    httpOnly: false, // لو عايز تستخدمه من الـ client
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // شهر
  });

  const token = request.cookies.get("access_token")?.value;
  const hasLocalePrefix = LOCALE_REGEX.test(pathname);
  const locale = extractLocale(pathname);

  if (!locale) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url));

  }

  // تخطي بعض المسارات
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") ||
    pathname.startsWith("/auth/")
  ) {
    return response;
  }

  if (pathname === "/") {
    return intl(request);
  }

  if (pathname === `/${locale}/auth/login`) {
    return response;
  }

  const requiredPermission = getRequiredPermission(pathname);

  // لو المسار عام
  if (!requiredPermission) {
    return hasLocalePrefix ? response : intl(request);
  }

  // لو لازم تسجيل دخول
  if (!token) {
    const loginPath = `/${locale}/auth/login`;
    return unauthorizedResponse(
      request,
      loginPath,
      locale === "ar"
        ? "تحتاج لتسجيل الدخول للوصول لهذه الصفحة"
        : "You need to login to access this page"
    );
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    const userTenant = payload.tenant as string;
    const permissions = (payload.permissions as string[]) || [];

    // تحقق من التينانت
    if (userTenant !== subdomain) {
      const unauthorizedPath = `/${locale}/unauthorized`;
      return unauthorizedResponse(
        request,
        unauthorizedPath,
        locale === "ar"
          ? "تم انتقالك لصفحة غير مصرح بها"
          : "Tenant mismatch, access denied"
      );
    }
    // console.log(requiredPermission);
    console.log("requiredPermission",payload);
    console.log("permissions",permissions);
    // تحقق من الصلاحيات
    const hasPermission =
      permissions.includes("__all__") ||
      permissions.includes(requiredPermission) ||
      requiredPermission === "authenticated_user";

    if (hasPermission) {
      return hasLocalePrefix ? response : intl(request);
    }

    const unauthorizedPath = `/${locale}/unauthorized`;
    return unauthorizedResponse(
      request,
      unauthorizedPath,
      locale === "ar"
        ? "تم انتقالك لصفحة غير مصرح بها"
        : "You do not have permission to access this page"
    );
  } catch {
    const loginPath = `/${locale}/auth/login`;
    const res = unauthorizedResponse(
      request,
      loginPath,
      locale === "ar"
        ? "فشل تسجيل الدخول أو انتهاء الجلسة"
        : "Login failed or session expired"
    );
    res.cookies.delete("access_token");
    return res;
  }
}
