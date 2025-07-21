import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';


export default createMiddleware(routing);

export const config = {
  // matcher: ['/', '/(en|ar)/:path*']
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
// تحديد المسارات التي يتم تطبيق الوسيط عليها
// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/admin/:path*',
//     '/prescriptions/:path*',
//     '/invoices/:path*',
//     '/reports/:path*',
//     '/profile/:path*',

//   ],

// };




function getRequiredPermission(pathname: string): string | null {

  let routeMap: [RegExp, string][] = [
    [/^\/admin/, 'admin_access'],
    [/^\/dashboard/, 'view_dashboard'],
    [/^\/profile/, 'view_profile'],
    [/^\/reports/, 'view_reports'],
    [/^\/users/, 'view_users'],
    [/\/prescriptions\/(create|new)/, 'create_prescription'],
    [/\/prescriptions\/edit/, 'edit_prescription'],
    [/^\/prescriptions/, 'view_prescriptions'],
    [/\/invoices\/(create|new)/, 'create_invoice'],
    [/\/invoices\/edit/, 'edit_invoice'],
    [/^\/invoices/, 'view_invoices'],
  ];



  for (const [regex, permission] of routeMap) {
    if (regex.test(pathname)) return permission;
  }
  return null;
}

function unauthorizedResponse(target: string, message: string, redirect?: string) {
  const url = new URL(target, 'http://' + process.env.NEXT_PUBLIC_BASE_DOMAIN);

  if (redirect) {
    url.searchParams.set('redirect', redirect);
    // sessionStorage.setItem('redirect', redirect);
  }

  const response = NextResponse.redirect(url);

  response.cookies.set('alert_message', message+" " + redirect, { path: '/', maxAge: 5 });
  response.cookies.set('alert_type', 'error', { path: '/', maxAge: 5 });


  return response;
}



export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // Set the locale Leng
  // const intlResponse = intlMiddleware(request);
  // if (intlResponse) return intlResponse;

  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0]; 
  const token = request.cookies.get('access_token')?.value;
  

  // تخطي بعض المسارات العامة
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // للملفات الثابتة

  ) {
    return NextResponse.next();
  }


  if (!token) {
    return unauthorizedResponse('/auth/login', 'You need to login to access this page ',pathname);
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    const userTenant = payload.tenant as string;
    const permissions = payload.permissions as string[];
    
    if (userTenant !== subdomain) {
      return unauthorizedResponse('/unauthorized', 'Tenant mismatch, access denied to ',pathname);
    }

    // Allow profile page
    if (pathname.startsWith('/profile')) {return NextResponse.next(); }

    const requiredPermission = getRequiredPermission(pathname);
    if (permissions.includes('__all__') || permissions.includes(requiredPermission!)) {
      return NextResponse.next();
    }

    return unauthorizedResponse('/unauthorized', 'You do not have permission to access this page ',pathname);
  } catch (error) {
    // const loginUrl = new URL('/auth/login', request.url);
    // loginUrl.searchParams.set('redirect', pathname);

    // const response = NextResponse.redirect(loginUrl);
    // response.cookies.delete('access_token');
    return unauthorizedResponse('/auth/login', 'Login failed or session expired ',pathname);

  }
}

