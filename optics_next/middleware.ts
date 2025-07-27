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
  const pathname = request.nextUrl.pathname;
  
  console.log('Middleware executing for:', pathname);
  
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];
  const token = request.cookies.get('access_token')?.value;


  console.log('Token exists:', !!token);
  console.log('Subdomain:', subdomain);
  
  // تخطي مسارات API والملفات الثابتة والمسارات الخاصة
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') || // الملفات الثابتة
    pathname.startsWith('/auth/') // مسارات التوثيق
    
  ) {
    return NextResponse.next();
  }
  
  // فحص وجود بادئة اللغة في المسار
  const hasLocalePrefix = /^\/(ar|en)\//.test(pathname);
  console.log('Has locale prefix:', hasLocalePrefix);
  
  // إذا كان المسار الرئيسي فقط، تطبيق intl middleware للإعادة توجيه للغة
  if (pathname === '/') {
    console.log('Root path, applying intl middleware');
    return intl(request);
  }
  

  const requiredPermission = getRequiredPermission(pathname);
  console.log('Required permission for', pathname, ':', requiredPermission);
  
  // إذا كان المسار عام (لا يحتاج صلاحية)، تطبيق intl middleware إذا لزم الأمر
  if (!requiredPermission) {
    if (!hasLocalePrefix) {
      return intl(request);
    }
    return NextResponse.next();
  }
  
  
  // الآن نحن نعرف أن المسار يحتاج مصادقة
  // فحص وجود التوكن أولاً
  if (!token) {
    console.log('No token found, redirecting to login');
    
    // إذا لم تكن هناك بادئة لغة، إضافة اللغة الافتراضية
    if (!hasLocalePrefix) {
      const defaultLocale = 'en'; // أو حسب إعداداتك
      const loginPath = `/${defaultLocale}/auth/login`;
      return unauthorizedResponse(request, loginPath, 'You need to login to access this page');
    }
    
    // إذا كانت هناك بادئة لغة، استخدمها
    const locale = pathname.split('/')[1];
    const loginPath = `/${locale}/auth/login`;
    return unauthorizedResponse(request, loginPath, 'You need to login to access this page');
  }
  
  try {
    // التحقق من صحة التوكن
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const userTenant = payload.tenant as string;
    const permissions = payload.permissions as string[];
    
    console.log('User tenant:', userTenant); // للتتبع
    console.log('User permissions:', permissions); // للتتبع
    
    // فحص مطابقة المستأجر
    if (userTenant !== subdomain) {
      console.log('Tenant mismatch');
      
      const locale = hasLocalePrefix ? pathname.split('/')[1] : 'en';
      const unauthorizedPath = `/${locale}/unauthorized`;
      if (locale === 'ar') {
        return unauthorizedResponse(request, unauthorizedPath, 'تم انتقالك لصفحة غير مصرح بها');
      }
      return unauthorizedResponse(request, unauthorizedPath, 'Tenant mismatch, access denied');
    }

    // فحص الصلاحيات
    const hasPermission = permissions.includes('__all__') || 
                         permissions.includes(requiredPermission) ||
                         (requiredPermission === 'authenticated_user'); // المسارات التي تحتاج مصادقة فقط
    
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
    
    // حذف التوكن التالف وإعادة التوجيه للتسجيل
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