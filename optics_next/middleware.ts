import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';


export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/prescriptions/:path*',
    '/invoices/:path*',
    '/reports/:path*',
    '/profile/:path*'
  ],
};

// define public routes
const PUBLIC_ROUTES = [
  '/', 
  '/login', 
  '/register', 
  '/about', 
  '/contact',
  '/forgot-password',
  '/reset-password',
  '/unauthorized',
  '/auth/:path*'

];

// define roles and permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'],
  TECHNICIAN: ['view_dashboard', 'create_prescription', 'edit_prescription', 'view_prescriptions', 'view_profile'],
  SALESPERSON: ['view_dashboard', 'create_invoice', 'view_invoices', 'edit_invoice', 'view_profile'],
  USER: ['view_profile'],
  RECEPTIONIST: ['view_profile'],
};

// Get Required Permission
function getRequiredPermission(pathname: string): string | null {
  if (pathname.startsWith('/admin')) return 'admin_access';
  if (pathname.includes('/prescriptions')) {
    if (pathname.includes('/create') || pathname.includes('/new')) return 'create_prescription';
    if (pathname.includes('/edit')) return 'edit_prescription';
    return 'view_prescriptions';
  }
  if (pathname.includes('/invoices')) {
    if (pathname.includes('/create') || pathname.includes('/new')) return 'create_invoice';
    if (pathname.includes('/edit')) return 'edit_invoice';
    return 'view_invoices';
  }
  if (pathname.startsWith('/reports')) return 'view_reports';
  if (pathname.startsWith('/profile')) return 'view_profile';
  if (pathname.startsWith('/dashboard')) return 'view_dashboard';
  return null;
}


// Has Permission
function hasPermission(userRole: string, requiredPermission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;
  if (rolePermissions.includes('*')) return true;
  return rolePermissions.includes(requiredPermission);
}



export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    PUBLIC_ROUTES.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.set('alert_message', 'You need to login to access this page ' + pathname, {
      path: '/',
      maxAge: 5,
    });
    response.cookies.set('alert_type', 'warning', {
      path: '/',
      maxAge: 5,
    });
    return response;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    const userRole = payload.role as string;
    const requiredPermission = getRequiredPermission(pathname);

    if (!requiredPermission) {
      return NextResponse.next();
    }

    if (hasPermission(userRole, requiredPermission)) {
      return NextResponse.next();
    } else {
      const response = NextResponse.redirect(new URL('/unauthorized', request.url));
      response.cookies.set('alert_message', 'You do not have permission to access this page ' + pathname, {
        path: '/',
        maxAge: 5,
      });
      response.cookies.set('alert_type', 'error', {
        path: '/',
        maxAge: 5,
      });
      return response;
    }
  } catch (error) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('access_token');
    response.cookies.set('alert_message', 'Login failed or session expired ' + pathname, {
      path: '/',
      maxAge: 5,
    });
    response.cookies.set('alert_type', 'error', {
      path: '/',
      maxAge: 5,
    });
    return response;
  }
}


export function updateUserPermissions(role: string, permissions: string[]) {
  if (role && permissions) {
    ROLE_PERMISSIONS[role] = permissions;
  }
}
