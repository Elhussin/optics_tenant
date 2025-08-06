import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './app/i18n/routing';
import { getRequiredPermission,unauthorizedResponse } from './lib/utils/middleware';
// تحديد المسارات التي يتم تطبيق الوسيط عليها
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    // '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)' 
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
  ],
};

const intl = createIntlMiddleware(routing);


export async function middleware(request: NextRequest) {
  /*
    Middleware for authentication and authorization
  */
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host') || '';
  let subdomain = host.split('.')[0];
  if(subdomain === 'localhost' || subdomain === 'localhost:3000') {
    subdomain='public';
  }
  const token = request.cookies.get('access_token')?.value;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') || // static files
    pathname.startsWith('/auth/') // authentication routes
    
  ) {
    return NextResponse.next();
  }
  
  // Check for language prefix in the path
  const hasLocalePrefix = /^\/(ar|en)\//.test(pathname);

  // If the root path, apply intl middleware for language redirection
  if (pathname === '/') {
    return intl(request);
  }
  

  const requiredPermission = getRequiredPermission(pathname);
  console.log('Required permission for', pathname, ':', requiredPermission);
  
  // If the path is public (no permission required), apply intl middleware if needed
  if (!requiredPermission) {
    if (!hasLocalePrefix) {
      return intl(request);
    }
    return NextResponse.next();
  }
  
  
  // If the path requires authentication
  if (!token) {
    // If there is no language prefix, add the default language
    if (!hasLocalePrefix) {
      const defaultLocale = 'en'; // أو حسب إعداداتك
      const loginPath = `/${defaultLocale}/auth/login`;
      return unauthorizedResponse(request, loginPath, 'You need to login to access this page');
    }
    
    // If there is a language prefix, use it
    const locale = pathname.split('/')[1];
    const loginPath = `/${locale}/auth/login`;
    return unauthorizedResponse(request, loginPath, 'You need to login to access this page1');
  }
  
  try {
    // Verify the token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    console.log('User:', payload);
    const userTenant = payload.tenant as string;
    const userRole = payload.role as string;
    const permissions = payload.permissions as string[];
    console.log('User:', payload);
    console.log('User tenant:', userTenant); // للتتبع
    console.log('User role:', userRole); // للتتبع
    console.log('User permissions:', permissions); // للتتبع
    
    // Check for tenant mismatch
    if (userTenant !== subdomain) {
      console.log('Tenant mismatch',userTenant,subdomain);
      
      const locale = hasLocalePrefix ? pathname.split('/')[1] : 'en';
      const unauthorizedPath = `/${locale}/unauthorized`;
      if (locale === 'ar') {
        return unauthorizedResponse(request, unauthorizedPath, 'تم انتقالك لصفحة غير مصرح بها');
      }
      return unauthorizedResponse(request, unauthorizedPath, 'Tenant mismatch, access denied');
    }

    const hasPermission = permissions.includes('__all__') || 
                         permissions.includes(requiredPermission) ||
                         (requiredPermission === 'authenticated_user'); // paths that require authentication only
    
    

    console.log('Required permission:', requiredPermission);
    console.log('User permissions:', permissions);
    console.log('Has permission:', hasPermission);
    
    if (hasPermission) {
      // تطبيق middleware الدولي إذا لم تكن هناك بادئة لغة
      if (!hasLocalePrefix) {
        return intl(request);
      }
      return NextResponse.next();
    }
    
    const locale = hasLocalePrefix ? pathname.split('/')[1] : 'en';
    const unauthorizedPath = `/${locale}/unauthorized`;
    if (locale === 'ar') {
      return unauthorizedResponse(request, unauthorizedPath, 'تم انتقالك لصفحة غير مصرح بها');
    }
    return unauthorizedResponse(request, unauthorizedPath, 'You do not have permission to access this page');
    
  } catch (error) {
    console.error('JWT verification failed:', error);
    

    const locale = hasLocalePrefix ? pathname.split('/')[1] : 'en';
    const loginPath = `/${locale}/auth/login`;
    if (locale === 'ar') {
      return unauthorizedResponse(request, loginPath, 'فشل تسجيل الدخول أو انتهاء الجلسة');
    }
    
    const response = unauthorizedResponse(request, loginPath, 'Login failed or session expired');
    response.cookies.delete('access_token');
    return response;
  }
}