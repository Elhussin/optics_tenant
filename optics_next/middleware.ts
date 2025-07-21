import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './app/i18n/routing';
import { jwtVerify } from 'jose';
import { getSubdomain } from './lib/utils/getSubdomain';
import { getRequiredPermission,unauthorizedResponse } from './lib/utils/middleware';

// إعداد i18n
const intl = createIntlMiddleware(routing);


export async function middleware(request: NextRequest) {
  const intlRes = intl(request);
  if (intlRes) return intlRes;

  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }


  const host = request.headers.get('host') || '';
  const subdomain = getSubdomain(host);
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    return unauthorizedResponse('/auth/login', 'You need to login to access this page ',pathname);
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
 
    if (payload.tenant !== subdomain) {
        return unauthorizedResponse('/unauthorized', 'Tenant mismatch, access denied to ',pathname);
    }

    if (!pathname.startsWith('/profile')) {
        const required = getRequiredPermission(pathname);
        const permissions = payload.permissions as string[];
        if (required && !permissions.includes(required)) {
            return unauthorizedResponse('/unauthorized', 'You do not have permission to access this page ',pathname);
        }
      }
    return NextResponse.next();
  } catch {
    return unauthorizedResponse('/auth/login', 'Login failed or session expired ',pathname);
  }
}

export const config = {
  matcher: '/((?!api|_next|.*\\..*).*)'
};
