import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// تحديد المسارات التي يتم تطبيق الوسيط عليها
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/prescriptions/:path*',
    '/invoices/:path*',
    '/reports/:path*',
  ],
};

// // صلاحيات الأدوار
// const ROLE_PERMISSIONS: Record<string, string[]> = {
//   ADMIN: ['__all__'],
//   TECHNICIAN: [
//     'view_dashboard',
//     'create_prescription',
//     'edit_prescription',
//     'view_prescriptions',
//     'view_profile',
//   ],
//   SALESPERSON: [
//     'view_dashboard',
//     'create_invoice',
//     'view_invoices',
//     'edit_invoice',
//     'view_profile',
//   ],
//   USER: ['view_profile'],
//   RECEPTIONIST: ['view_profile'],
// };

// استخراج الصلاحية المطلوبة بناءً على المسار
function getRequiredPermission(pathname: string): string | null {
  const routeMap: [RegExp, string][] = [
    [/^\/admin/, 'admin_access'],
    [/^\/dashboard/, 'view_dashboard'],
    [/^\/profile/, 'view_profile'],
    [/^\/reports/, 'view_reports'],
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

// دالة مساعدة لإنشاء رد غير مصرح به مع رسالة
function unauthorizedResponse(target: string, message: string) {
  const response = NextResponse.redirect(new URL(target, 'http://' + process.env.NEXT_PUBLIC_BASE_DOMAIN));
  response.cookies.set('alert_message', message, { path: '/', maxAge: 5 });
  response.cookies.set('alert_type', 'error', { path: '/', maxAge: 5 });
  return response;
}

// الوسيط الرئيسي
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0]; // store1.localhost → store1
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
    return unauthorizedResponse('/auth/login', 'You need to login to access this page ' + pathname);
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    const userTenant = payload.tenant as string;
    const permissions = payload.permissions as string[];

    if (userTenant !== subdomain) {
      return unauthorizedResponse('/unauthorized', 'Tenant mismatch, access denied to ' + pathname);
    }

    const requiredPermission = getRequiredPermission(pathname);
    if (permissions.includes('__all__') || permissions.includes(requiredPermission!)) {
      return NextResponse.next();
    }

    return unauthorizedResponse('/unauthorized', 'You do not have permission to access this page ' + pathname);
  } catch (error) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('access_token');
    return unauthorizedResponse('/auth/login', 'Login failed or session expired ' + pathname);

  }
}
