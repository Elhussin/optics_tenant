// import { NextRequest, NextResponse } from 'next/server';
// import { jwtVerify } from 'jose';
// import createMiddleware from 'next-intl/middleware';
// import createIntlMiddleware from 'next-intl/middleware';
// import { routing } from './app/i18n/routing';


// // export const config = {
// //   // matcher: ['/', '/(en|ar)/:path*']
// //   matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
// // };
// // تحديد المسارات التي يتم تطبيق الوسيط عليها
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


// const intl = createIntlMiddleware(routing);

// function getRequiredPermission(pathname: string): string | null {

//   let routeMap: [RegExp, string][] = [
//     [/^\/admin/, 'admin_access'],
//     [/^\/dashboard/, 'view_dashboard'],
//     [/^\/profile/, 'view_profile'],
//     [/^\/reports/, 'view_reports'],
//     [/^\/users/, 'view_users'],
//     [/\/prescriptions\/(create|new)/, 'create_prescription'],
//     [/\/prescriptions\/edit/, 'edit_prescription'],
//     [/^\/prescriptions/, 'view_prescriptions'],
//     [/\/invoices\/(create|new)/, 'create_invoice'],
//     [/\/invoices\/edit/, 'edit_invoice'],
//     [/^\/invoices/, 'view_invoices'],
//   ];



//   for (const [regex, permission] of routeMap) {
//     if (regex.test(pathname)) return permission;
//   }
//   return null;
// }

// function unauthorizedResponse(target: string, message: string, redirect?: string) {
//   const url = new URL(target, 'http://' + process.env.NEXT_PUBLIC_BASE_DOMAIN);

//   if (redirect) {
//     url.searchParams.set('redirect', redirect);
//     // sessionStorage.setItem('redirect', redirect);
//   }

//   const response = NextResponse.redirect(url);

//   response.cookies.set('alert_message', message+" " + redirect, { path: '/', maxAge: 5 });
//   response.cookies.set('alert_type', 'error', { path: '/', maxAge: 5 });


//   return response;
// }



// export async function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;
//   const intlRes = intl(request);
//   if (intlRes) return intlRes;
//   const host = request.headers.get('host') || '';
//   const subdomain = host.split('.')[0]; 
//   const token = request.cookies.get('access_token')?.value;
  

//   // تخطي بعض المسارات العامة
//   if (
//     pathname.startsWith('/_next/') ||
//     pathname.startsWith('/api/') ||
//     pathname.includes('.') // للملفات الثابتة

//   ) {
//     return NextResponse.next();
//   }


//   if (!token) {
//     return unauthorizedResponse('/auth/login', 'You need to login to access this page ',pathname);
//   }

//   try {
//     const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
//     const userTenant = payload.tenant as string;
//     const permissions = payload.permissions as string[];
    
//     if (userTenant !== subdomain) {
//       return unauthorizedResponse('/unauthorized', 'Tenant mismatch, access denied to ',pathname);
//     }

//     // Allow profile page
//     if (pathname.startsWith('/profile')) {return NextResponse.next(); }

//     const requiredPermission = getRequiredPermission(pathname);
//     if (permissions.includes('__all__') || permissions.includes(requiredPermission!)) {
//       return NextResponse.next();
//     }

//     return unauthorizedResponse('/unauthorized', 'You do not have permission to access this page ',pathname);
//   } catch (error) {
//     // const loginUrl = new URL('/auth/login', request.url);
//     // loginUrl.searchParams.set('redirect', pathname);

//     // const response = NextResponse.redirect(loginUrl);
//     // response.cookies.delete('access_token');
//     return unauthorizedResponse('/auth/login', 'Login failed or session expired ',pathname);

//   }
// }

// import { NextRequest, NextResponse } from 'next/server';
// import { jwtVerify } from 'jose';
// import createIntlMiddleware from 'next-intl/middleware';
// import { routing } from './app/i18n/routing';
// import { getRequiredPermission,unauthorizedResponse } from './lib/utils/middleware';
// // تحديد المسارات التي يتم تطبيق الوسيط عليها
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public folder files
//      */
//     // '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)' 
//     '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
//   ],
// };

// const intl = createIntlMiddleware(routing);


// export async function middleware(request: NextRequest) {
//   /*
//     Middleware for authentication and authorization
//   */
//   const pathname = request.nextUrl.pathname;
//   const host = request.headers.get('host') || '';
//   let subdomain = host.split('.')[0];
//   if(subdomain === 'localhost' || subdomain === 'localhost:3000') {
//     subdomain='public';
//   }
//   const token = request.cookies.get('access_token')?.value;

//   if (
//     pathname.startsWith('/api/') ||
//     pathname.startsWith('/_next/') ||
//     pathname.startsWith('/favicon.ico') ||
//     pathname.includes('.') || // static files
//     pathname.startsWith('/auth/') // authentication routes
    
//   ) {
//     return NextResponse.next();
//   }
  
//   // Check for language prefix in the path
//   const hasLocalePrefix = /^\/(ar|en)\//.test(pathname);

//   // If the root path, apply intl middleware for language redirection
//   if (pathname === '/') {
//     return intl(request);
//   }
  

//   const requiredPermission = getRequiredPermission(pathname);
//   console.log('Required permission for', pathname, ':', requiredPermission);
  
//   // If the path is public (no permission required), apply intl middleware if needed
//   if (!requiredPermission) {
//     if (!hasLocalePrefix) {
//       return intl(request);
//     }
//     return NextResponse.next();
//   }
  
  
//   // If the path requires authentication
//   if (!token) {
//     // If there is no language prefix, add the default language
//     if (!hasLocalePrefix) {
//       const defaultLocale = 'en'; // أو حسب إعداداتك
//       const loginPath = `/${defaultLocale}/auth/login`;
//       return unauthorizedResponse(request, loginPath, 'You need to login to access this page');
//     }
    
//     // If there is a language prefix, use it
//     const locale = pathname.split('/')[1];
//     const loginPath = `/${locale}/auth/login`;
//     return unauthorizedResponse(request, loginPath, 'You need to login to access this page1');
//   }
  
//   try {
//     // Verify the token
//     const secret = process.env.JWT_SECRET;
//     if (!secret) {
//       throw new Error('JWT_SECRET not configured');
//     }
    
//     const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
//     console.log('User:', payload);
//     const userTenant = payload.tenant as string;
//     const userRole = payload.role as string;
//     const permissions = payload.permissions as string[];
//     console.log('User:', payload);
//     console.log('User tenant:', userTenant); // للتتبع
//     console.log('User role:', userRole); // للتتبع
//     console.log('User permissions:', permissions); // للتتبع
    
//     // Check for tenant mismatch
//     if (userTenant !== subdomain) {
//       console.log('Tenant mismatch',userTenant,subdomain);
      
//       const locale = hasLocalePrefix ? pathname.split('/')[1] : 'en';
//       const unauthorizedPath = `/${locale}/unauthorized`;
//       if (locale === 'ar') {
//         return unauthorizedResponse(request, unauthorizedPath, 'تم انتقالك لصفحة غير مصرح بها');
//       }
//       return unauthorizedResponse(request, unauthorizedPath, 'Tenant mismatch, access denied');
//     }

//     const hasPermission = permissions.includes('__all__') || 
//                          permissions.includes(requiredPermission) ||
//                          (requiredPermission === 'authenticated_user'); // paths that require authentication only
    
    

//     console.log('Required permission:', requiredPermission);
//     console.log('User permissions:', permissions);
//     console.log('Has permission:', hasPermission);
    
//     if (hasPermission) {
//       // تطبيق middleware الدولي إذا لم تكن هناك بادئة لغة
//       if (!hasLocalePrefix) {
//         return intl(request);
//       }
//       return NextResponse.next();
//     }
    
//     const locale = hasLocalePrefix ? pathname.split('/')[1] : 'en';
//     const unauthorizedPath = `/${locale}/unauthorized`;
//     if (locale === 'ar') {
//       return unauthorizedResponse(request, unauthorizedPath, 'تم انتقالك لصفحة غير مصرح بها');
//     }
//     return unauthorizedResponse(request, unauthorizedPath, 'You do not have permission to access this page');
    
    
//   } catch (error) {
//     console.error('JWT verification failed:', error);
    

//     const locale = hasLocalePrefix ? pathname.split('/')[1] : 'en';
//     const loginPath = `/${locale}/auth/login`;
//     if (locale === 'ar') {
//       return unauthorizedResponse(request, loginPath, 'فشل تسجيل الدخول أو انتهاء الجلسة');
//     }
    
//     const response = unauthorizedResponse(request, loginPath, 'Login failed or session expired');
//     response.cookies.delete('access_token');
//     return response;
//   }
// }

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

  // Root path: redirect to locale
  if (pathname === '/') {
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
