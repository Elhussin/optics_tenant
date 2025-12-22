import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./app/i18n/routing";
import {
  getRequiredPermission,
  unauthorizedResponse,
} from "./shared/utils/middlewareHelper";

const PUBLIC_SUBDOMAIN = "public";
const DEFAULT_LOCALE = "en";
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost";

export const config = {
  // Matches all paths except api, static files, images, etc.
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};

const intl = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes to avoid locale/auth interference
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") || "";

  // -----------------------------------------------------------------------------
  // 1. Tenant Resolution (Robust)
  // -----------------------------------------------------------------------------
  let subdomain = PUBLIC_SUBDOMAIN;
  if (host !== BASE_DOMAIN && host !== `www.${BASE_DOMAIN}`) {
    // Remove port if present
    const hostname = host.split(':')[0];

    // Check if it ends with base domain
    if (hostname.endsWith(`.${BASE_DOMAIN}`)) {
      const candidate = hostname.replace(`.${BASE_DOMAIN}`, "");
      if (candidate !== "www") {
        subdomain = candidate;
      }
    } else if (BASE_DOMAIN === 'localhost' && hostname.endsWith('.localhost')) {
      // Fallback for local dev if env is not set perfectly
      subdomain = hostname.split('.')[0];
    }
  }

  // -----------------------------------------------------------------------------
  // 2. Auth & Locale Discovery
  // -----------------------------------------------------------------------------
  const token = request.cookies.get("access_token")?.value;
  // Simple extraction: /en/..., /ar/..., or default
  const pathLocale = pathname.match(/^\/(ar|en)/)?.[1];
  const locale = pathLocale || DEFAULT_LOCALE;

  // -----------------------------------------------------------------------------
  // 3. Guest Optimization (Skip Auth Pages if Logged In)
  // -----------------------------------------------------------------------------
  // Faster check than Regex
  const isAuthPage = pathname.includes('/auth/');

  if (token && isAuthPage) {
    const homeUrl = new URL(`/${locale}`, request.url);
    const response = NextResponse.redirect(homeUrl);
    // Ensure tenant cookie is set correctly even on redirect
    response.cookies.set({
      name: "tenant",
      value: subdomain,
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return response;
  }

  // -----------------------------------------------------------------------------
  // 4. Authorization & Security Checks
  // -----------------------------------------------------------------------------
  const requiredPermission = getRequiredPermission(pathname);

  if (requiredPermission) {
    // A. Check for Token Presence
    if (!token) {
      const loginPath = `/${locale}/auth/login`;
      const msg = locale === "ar"
        ? "تحتاج لتسجيل الدخول للوصول لهذه الصفحة"
        : "You need to login to access this page";
      return unauthorizedResponse(request, loginPath, msg);
    }

    // B. Verify Token & Claims
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT_SECRET is not defined");

      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      const userTenant = payload.tenant as string;
      const permissions = (payload.permissions as string[]) || [];

      // Guard: Tenant Isolation
      // Allow 'public' tenant users to access public/root domain logic if needed,
      // but usually strict comparison is safer.
      if (userTenant !== subdomain) {
        // Special case: If user is "owner"/platform admin, they might access tenant domains? 
        // Usually NO, they should login to the tenant context.
        // Sticking to strict isolation for security.
        throw new Error("Tenant mismatch");
      }

      // Guard: Permissions
      const hasPermission =
        permissions.includes("__all__") ||
        permissions.includes(requiredPermission) ||
        requiredPermission === "authenticated_user";

      if (!hasPermission) {
        throw new Error("Insufficient permissions");
      }

    } catch (error: any) {
      const isMismatch = error.message === "Tenant mismatch" || error.message === "Insufficient permissions";
      const unauthorizedPath = `/${locale}/unauthorized`;

      const msg = locale === "ar"
        ? (isMismatch ? "تم انتقالك لصفحة غير مصرح بها" : "فشل تسجيل الدخول أو انتهاء الجلسة")
        : (isMismatch ? "Access denied" : "Login failed or session expired");

      const res = unauthorizedResponse(
        request,
        isMismatch ? unauthorizedPath : `/${locale}/auth/login`,
        msg
      );

      // Only clear token if it wasn't a logic mismatch (i.e., only clear if token is invalid/expired)
      if (!isMismatch) {
        res.cookies.delete("access_token");
      }
      return res;
    }
  }

  // -----------------------------------------------------------------------------
  // 5. Final Response Handling (i18n + Cookies)
  // -----------------------------------------------------------------------------
  const response = intl(request);

  // set tenant cookie only if changed logic could be optimization, but setting it always is safer for consistency
  response.cookies.set({
    name: "tenant",
    value: subdomain,
    path: "/",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 Days
  });

  return response;
}
