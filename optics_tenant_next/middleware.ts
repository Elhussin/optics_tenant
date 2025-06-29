// // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { jwtVerify } from 'jose';

// // ✅ تحديد المسارات المحمية
// export const config = {
//   matcher: [
//     '/dashboard/:path*', 
//     '/admin/:path*',
//     '/prescriptions/:path*',
//     '/invoices/:path*',
//     '/reports/:path*'
//   ],
// };

// // المسارات العامة التي لا تحتاج مصادقة
// const PUBLIC_ROUTES = ['/login', '/register', '/', '/about', '/contact'];

// // أذونات الأدوار
// const ROLE_PERMISSIONS: Record<string, string[] | '__all__'> = {
//   ADMIN: '__all__',
//   TECHNICIAN: ['create_prescription', 'edit_prescription', 'view_prescriptions'],
//   SALESPERSON: ['create_invoice', 'view_invoices', 'edit_invoice'],
// };

// // ربط المسارات بالأذونات المطلوبة
// const ROUTE_PERMISSIONS: Record<string, string> = {
//   '/dashboard': 'view_dashboard',
//   '/admin': 'admin_access',
//   '/prescriptions/create': 'create_prescription',
//   '/prescriptions/edit': 'edit_prescription',
//   '/prescriptions': 'view_prescriptions',
//   '/invoices/create': 'create_invoice',
//   '/invoices/edit': 'edit_invoice',
//   '/invoices': 'view_invoices',
//   '/reports': 'view_reports',
// };

// // دالة للحصول على الإذن المطلوب حسب المسار
// function getRequiredPermission(pathname: string): string | null {
//   // البحث عن مطابقة دقيقة أولاً
//   if (ROUTE_PERMISSIONS[pathname]) {
//     return ROUTE_PERMISSIONS[pathname];
//   }
  
//   // البحث عن مطابقة جزئية للمسارات الفرعية
//   for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
//     if (pathname.startsWith(route)) {
//       return permission;
//     }
//   }
  
//   // إذا كان المسار يبدأ بـ /admin فهو يحتاج إذن admin
//   if (pathname.startsWith('/admin')) {
//     return 'admin_access';
//   }
  
//   // إذا كان المسار يبدأ بـ /dashboard فهو يحتاج إذن dashboard
//   if (pathname.startsWith('/dashboard')) {
//     return 'view_dashboard';
//   }
  
//   // افتراضي: لا يحتاج إذن خاص
//   return null;
// }

// // دالة للتحقق من وجود الإذن
// function hasPermission(userRole: string, requiredPermission: string): boolean {
//   const rolePermissions = ROLE_PERMISSIONS[userRole];
  
//   if (!rolePermissions) {
//     return false;
//   }
  
//   // إذا كان للمستخدم جميع الأذونات
//   if (rolePermissions === '__all__') {
//     return true;
//   }
  
//   // التحقق من وجود الإذن المطلوب
//   return rolePermissions.includes(requiredPermission);
// }

// export async function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;
//   const token = request.cookies.get('access_token')?.value;
  
//   console.log("🧪 Middleware activated for path:", pathname);
  
//   // السماح بالمسارات العامة
//   if (PUBLIC_ROUTES.includes(pathname)) {
//     console.log("✅ Public route, allowing access");
//     return NextResponse.next();
//   }
  
//   // التحقق من وجود التوكن
//   if (!token) {
//     console.log("❌ No token found, redirecting to login");
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
  
//   try {
//     // التحقق من صحة التوكن
//     const { payload } = await jwtVerify(
//       token,
//       new TextEncoder().encode(process.env.JWT_SECRET!)
//     );
    
//     console.log("✅ Token verified, user role:", payload.role);
    
//     const userRole = payload.role as string;
//     const requiredPermission = getRequiredPermission(pathname);
    
//     console.log("🔍 Required permission for", pathname, ":", requiredPermission);
    
//     // إذا لم يكن هناك إذن مطلوب، السماح بالوصول
//     if (!requiredPermission) {
//       console.log("✅ No specific permission required, allowing access");
//       return NextResponse.next();
//     }
    
//     // التحقق من الأذونات
//     if (hasPermission(userRole, requiredPermission)) {
//       console.log("✅ User has required permission, allowing access");
//       return NextResponse.next();
//     } else {
//       console.log("❌ User lacks required permission, redirecting to unauthorized");
//       return NextResponse.redirect(new URL('/unauthorized', request.url));
//     }
    
//   } catch (error) {
//     console.error("❌ JWT verification failed:", error);
    
//     // حذف التوكن التالف وإعادة التوجيه لتسجيل الدخول
//     const response = NextResponse.redirect(new URL('/login', request.url));
//     response.cookies.delete('access_token');
//     return response;
//   }
// }

// // دالة مساعدة لتحديث أذونات المستخدم (اختيارية)
// export function updateUserPermissions(role: string, permissions: string[]) {
//   if (role && permissions) {
//     ROLE_PERMISSIONS[role] = permissions;
//   }
// }

// middleware.ts (يجب أن يكون في المجلد الجذر للمشروع، ليس في app أو src)
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { jwtVerify } from 'jose';

// // ⚠️ مهم جداً: هذا الملف يجب أن يكون في الجذر الرئيسي للمشروع
// // ليس في مجلد app أو src

// export const config = {
//   // تحديد المسارات التي سيتم تطبيق middleware عليها
//   matcher: [
//     // حماية جميع المسارات التي تبدأ بـ /dashboard
//     '/dashboard/:path*',
//     // حماية جميع المسارات التي تبدأ بـ /admin  
//     '/admin/:path*',
//     // حماية مسارات محددة أخرى
//     '/prescriptions/:path*',
//     '/invoices/:path*',
//     '/reports/:path*',
//     '/profile/:path*'
//   ],
// };

// // المسارات العامة (لا تحتاج مصادقة)
// const PUBLIC_ROUTES = [
//   '/', 
//   '/login', 
//   '/register', 
//   '/about', 
//   '/contact',
//   '/forgot-password',
//   '/reset-password'
// ];

// // تعريف الأدوار والأذونات
// const ROLE_PERMISSIONS: Record<string, string[]> = {
//   ADMIN: ['*'], // جميع الأذونات
//   TECHNICIAN: [
//     'view_dashboard',
//     'create_prescription', 
//     'edit_prescription', 
//     'view_prescriptions',
//     'view_profile'
//   ],
//   SALESPERSON: [
//     'view_dashboard',
//     'create_invoice', 
//     'view_invoices', 
//     'edit_invoice',
//     'view_profile'
//   ],
//   USER: [
//     'view_profile'
//   ]
// };

// // ربط المسارات بالأذونات المطلوبة
// function getRequiredPermission(pathname: string): string | null {
//   console.log("🔍 Checking permission for path:", pathname);
  
//   // مسارات الإدارة تحتاج صلاحية admin
//   if (pathname.startsWith('/admin')) {
//     return 'admin_access';
//   }
  
//   // مسارات الوصفات
//   if (pathname.includes('/prescriptions')) {
//     if (pathname.includes('/create') || pathname.includes('/new')) {
//       return 'create_prescription';
//     }
//     if (pathname.includes('/edit')) {
//       return 'edit_prescription';
//     }
//     return 'view_prescriptions';
//   }
  
//   // مسارات الفواتير
//   if (pathname.includes('/invoices')) {
//     if (pathname.includes('/create') || pathname.includes('/new')) {
//       return 'create_invoice';
//     }
//     if (pathname.includes('/edit')) {
//       return 'edit_invoice';
//     }
//     return 'view_invoices';
//   }
  
//   // مسارات التقارير
//   if (pathname.startsWith('/reports')) {
//     return 'view_reports';
//   }
  
//   // مسار الملف الشخصي
//   if (pathname.startsWith('/profile')) {
//     return 'view_profile';
//   }
  
//   // لوحة التحكم العامة
//   if (pathname.startsWith('/dashboard')) {
//     return 'view_dashboard';
//   }
  
//   return null;
// }

// // التحقق من الأذونات
// function hasPermission(userRole: string, requiredPermission: string): boolean {
//   console.log("🔐 Checking permission:", { userRole, requiredPermission });
  
//   const rolePermissions = ROLE_PERMISSIONS[userRole];
  
//   if (!rolePermissions) {
//     console.log("❌ No permissions found for role:", userRole);
//     return false;
//   }
  
//   // إذا كان المستخدم admin أو لديه جميع الأذونات
//   if (rolePermissions.includes('*')) {
//     console.log("✅ User has all permissions (admin)");
//     return true;
//   }
  
//   // التحقق من وجود الإذن المحدد
//   const hasAccess = rolePermissions.includes(requiredPermission);
//   console.log("🔍 Permission check result:", hasAccess);
  
//   return hasAccess;
// }

// export async function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;
  
//   console.log("\n🚀 ===== MIDDLEWARE EXECUTED =====");
//   console.log("📍 Path:", pathname);
//   console.log("🌐 URL:", request.url);
  
//   // تجاهل الملفات الثابتة
//   if (
//     pathname.startsWith('/_next/') ||
//     pathname.startsWith('/api/') ||
//     pathname.includes('.') // ملفات مثل .css, .js, .ico
//   ) {
//     return NextResponse.next();
//   }
  
//   // السماح بالمسارات العامة
//   if (PUBLIC_ROUTES.includes(pathname)) {
//     console.log("✅ Public route - Access granted");
//     return NextResponse.next();
//   }
  
//   // الحصول على التوكن
//   const token = request.cookies.get('access_token')?.value;
//   console.log("🔑 Token exists:", !!token);
  
//   if (!token) {
//     console.log("❌ No token - Redirecting to login");
//     const loginUrl = new URL('/login', request.url);
//     loginUrl.searchParams.set('redirect', pathname); // حفظ المسار للعودة إليه
//     return NextResponse.redirect(loginUrl);
//   }
  
//   try {
//     // التحقق من صحة التوكن
//     const { payload } = await jwtVerify(
//       token,
//       new TextEncoder().encode(process.env.JWT_SECRET!)
//     );
    
//     console.log("✅ Token valid - User:", payload.sub, "Role:", payload.role);
    
//     const userRole = payload.role as string;
//     const requiredPermission = getRequiredPermission(pathname);
    
//     console.log("🔍 Required permission:", requiredPermission);
    
//     // إذا لم يكن هناك إذن مطلوب محدد، السماح بالوصول
//     if (!requiredPermission) {
//       console.log("✅ No specific permission required - Access granted");
//       return NextResponse.next();
//     }
    
//     // التحقق من الأذونات
//     if (hasPermission(userRole, requiredPermission)) {
//       console.log("✅ Permission granted - Access allowed");
//       return NextResponse.next();
//     } else {
//       console.log("❌ Permission denied - Redirecting to unauthorized");
//       return NextResponse.redirect(new URL('/unauthorized', request.url));
//     }
    
//   } catch (error) {
//     console.error("❌ Token verification failed:", error);
    
//     // حذف التوكن الفاسد
//     const loginUrl = new URL('/login', request.url);
//     const response = NextResponse.redirect(loginUrl);
//     response.cookies.delete('access_token');
//     return response;
//   }
// }

// // دالة للتحقق من تشغيل middleware في development
// // console.log("🔧 Middleware file loaded successfully!");

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// // import { jwtVerify } from 'jose';

// export function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;
  
//   // طباعة كل طلب
//   console.log("🔍 REQUEST:", {
//     pathname,
//     method: request.method,
//     headers: Object.fromEntries(request.headers.entries()),
//     cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value]))
//   });
  
//   return NextResponse.next();
// }


// middleware.ts (في الجذر الرئيسي)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🔥 حل للـ App Router - إعداد مختلف
export function middleware(request: NextRequest) {
  console.log('🚀 MIDDLEWARE EXECUTED - App Router Version')
  console.log('📍 Current Path:', request.nextUrl.pathname)
  console.log('🌐 Full URL:', request.url)
  
  const { pathname } = request.nextUrl
  
  // تجاهل الملفات الثابتة والـ API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // قائمة المسارات المحمية
  const protectedPaths = ['/dashboard', '/admin', '/profile']
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )
  
  console.log('🔒 Is Protected Path:', isProtectedPath)
  
  if (isProtectedPath) {
    const token = request.cookies.get('access_token')?.value
    console.log('🔑 Token exists:', !!token)
    
    if (!token) {
      console.log('❌ No token found - Redirecting to login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // هنا يمكنك إضافة التحقق من JWT
    console.log('✅ Token found - Access granted')
  }
  
  return NextResponse.next()
}

// 🎯 تكوين matcher للـ App Router
export const config = {
  matcher: [
    /*
     * تطبيق على جميع المسارات عدا:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}