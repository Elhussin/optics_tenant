
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './app/i18n/routing';
import { getRequiredPermission, unauthorizedResponse } from './lib/utils/middleware';

const DEFAULT_LOCALE = 'en';
const LOCALE_REGEX = /^\/(ar|en)\//;
const PUBLIC_SUBDOMAIN = 'public';

export const config = {
  matcher: [
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
  ],
};

const intl = createIntlMiddleware(routing);

function extractLocale(pathname: string): string {
  const match = pathname.match(/^\/(ar|en)(?=\/|$)/);
  return match ? match[1] : DEFAULT_LOCALE;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  let subdomain = host.split('.')[0];
  if (subdomain.startsWith('localhost')) subdomain = PUBLIC_SUBDOMAIN;

  const token = request.cookies.get('access_token')?.value;
  const hasLocalePrefix = LOCALE_REGEX.test(pathname);
  const locale = extractLocale(pathname);

  // Skip middleware for static, API, or auth routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    pathname.startsWith('/auth/')
  ) {
    return NextResponse.next();
  }

  /* Root path: redirect to locale */
  if (pathname === '/') {
    return intl(request);
  }

  // Handle /auth/login with redirect param: allow access without auth
  if (pathname === `/${locale}/auth/login`) {
    return NextResponse.next();
  } if (pathname === '/') {
    return intl(request);
  }

  const requiredPermission = getRequiredPermission(pathname);

  // Public path: just ensure locale
  if (!requiredPermission) {
    return hasLocalePrefix ? NextResponse.next() : intl(request);
  }

  // Auth required
  if (!token) {
    const loginPath = `/${locale}/auth/login`;
    return unauthorizedResponse(request, loginPath, locale === 'ar'
      ? 'تحتاج لتسجيل الدخول للوصول لهذه الصفحة'
      : 'You need to login to access this page');
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const userTenant = payload.tenant as string;
    const permissions = payload.permissions as string[] || [];

    // Tenant check
    if (userTenant !== subdomain) {
      const unauthorizedPath = `/${locale}/unauthorized`;
      return unauthorizedResponse(request, unauthorizedPath, locale === 'ar'
        ? 'تم انتقالك لصفحة غير مصرح بها'
        : 'Tenant mismatch, access denied');
    }

    // Permission check
    const hasPermission =
      permissions.includes('__all__') ||
      permissions.includes(requiredPermission) ||
      requiredPermission === 'authenticated_user';

    if (hasPermission) {
      return hasLocalePrefix ? NextResponse.next() : intl(request);
    }

    const unauthorizedPath = `/${locale}/unauthorized`;
    return unauthorizedResponse(request, unauthorizedPath, locale === 'ar'
      ? 'تم انتقالك لصفحة غير مصرح بها'
      : 'You do not have permission to access this page');
  } catch {
    const loginPath = `/${locale}/auth/login`;
    const response = unauthorizedResponse(request, loginPath, locale === 'ar'
      ? 'فشل تسجيل الدخول أو انتهاء الجلسة'
      : 'Login failed or session expired');
    response.cookies.delete('access_token');
    return response;
  }
}
