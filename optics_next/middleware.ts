// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ✅ تحديد المسارات المحمية
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*',
    '/prescriptions/:path*',
    '/invoices/:path*',
    '/reports/:path*'
  ],
};

// المسارات العامة التي لا تحتاج مصادقة
const PUBLIC_ROUTES = ['/login', '/register', '/', '/about', '/contact'];

// أذونات الأدوار
const ROLE_PERMISSIONS: Record<string, string[] | '__all__'> = {
  ADMIN: '__all__',
  TECHNICIAN: ['create_prescription', 'edit_prescription', 'view_prescriptions'],
  SALESPERSON: ['create_invoice', 'view_invoices', 'edit_invoice'],
};

// ربط المسارات بالأذونات المطلوبة
const ROUTE_PERMISSIONS: Record<string, string> = {
  '/dashboard': 'view_dashboard',
  '/admin': 'admin_access',
  '/prescriptions/create': 'create_prescription',
  '/prescriptions/edit': 'edit_prescription',
  '/prescriptions': 'view_prescriptions',
  '/invoices/create': 'create_invoice',
  '/invoices/edit': 'edit_invoice',
  '/invoices': 'view_invoices',
  '/reports': 'view_reports',
};

// دالة للحصول على الإذن المطلوب حسب المسار
function getRequiredPermission(pathname: string): string | null {
  // البحث عن مطابقة دقيقة أولاً
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }
  
  // البحث عن مطابقة جزئية للمسارات الفرعية
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return permission;
    }
  }
  
  // إذا كان المسار يبدأ بـ /admin فهو يحتاج إذن admin
  if (pathname.startsWith('/admin')) {
    return 'admin_access';
  }
  
  // إذا كان المسار يبدأ بـ /dashboard فهو يحتاج إذن dashboard
  if (pathname.startsWith('/dashboard')) {
    return 'view_dashboard';
  }
  
  // افتراضي: لا يحتاج إذن خاص
  return null;
}

// دالة للتحقق من وجود الإذن
function hasPermission(userRole: string, requiredPermission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  
  if (!rolePermissions) {
    return false;
  }
  
  // إذا كان للمستخدم جميع الأذونات
  if (rolePermissions === '__all__') {
    return true;
  }
  
  // التحقق من وجود الإذن المطلوب
  return rolePermissions.includes(requiredPermission);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('access_token')?.value;
  console.log("🧪 Middleware activated for path:", pathname);
  console.log("🧪 Middleware activated for token:", token);
  
  // السماح بالمسارات العامة
  if (PUBLIC_ROUTES.includes(pathname)) {
    console.log("✅ Public route, allowing access");
    return NextResponse.next();
  }
  
  // التحقق من وجود التوكن
  if (!token) {
    
    console.log("❌ No token found, redirecting to login");
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  try {
    // التحقق من صحة التوكن
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    
    console.log("✅ Token verified, user role:", payload.role);
    
    const userRole = payload.role as string;
    const requiredPermission = getRequiredPermission(pathname);
    
    console.log("🔍 Required permission for", pathname, ":", requiredPermission);
    
    // إذا لم يكن هناك إذن مطلوب، السماح بالوصول
    if (!requiredPermission) {
      console.log("✅ No specific permission required, allowing access");
      return NextResponse.next();
    }
    
    // التحقق من الأذونات
    if (hasPermission(userRole, requiredPermission)) {
      console.log("✅ User has required permission, allowing access");
      return NextResponse.next();
    } else {
      console.log("❌ User lacks required permission, redirecting to unauthorized");
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
  } catch (error) {
    console.error("❌ JWT verification failed:", error);
    
    // حذف التوكن التالف وإعادة التوجيه لتسجيل الدخول
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('access_token');
    return response;
  }
}

// دالة مساعدة لتحديث أذونات المستخدم (اختيارية)
export function updateUserPermissions(role: string, permissions: string[]) {
  if (role && permissions) {
    ROLE_PERMISSIONS[role] = permissions;
  }
}