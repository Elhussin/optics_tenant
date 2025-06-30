import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export const config = {
  // matcher: ['/dashboard/:path*', '/admin/:path*', '/prescriptions/:path*', '/invoices/:path*', '/reports/:path*'],
  matcher: '/:path*',

};

const PUBLIC_ROUTES = ['/login', '/register', '/', '/about', '/contact'];

const ROLE_PERMISSIONS: Record<string, string[] | '__all__'> = {
  ADMIN: '__all__',
  TECHNICIAN: ['create_prescription', 'edit_prescription', 'view_prescriptions'],
  SALESPERSON: ['create_invoice', 'view_invoices', 'edit_invoice'],
};

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

function getRequiredPermission(pathname: string): string | null {
  if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname];
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) return permission;
  }
  return null;
}

function hasPermission(userRole: string, requiredPermission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;
  if (rolePermissions === '__all__') return true;
  return rolePermissions.includes(requiredPermission);
}

export async function middleware(request: NextRequest) {
  console.log("🔥 Middleware triggered for", request.nextUrl.pathname);
  console.log("middleware")
  const pathname = request.nextUrl.pathname;
  console.log("pathname",pathname)
  const token = request.cookies.get('access_token')?.value;
  console.log("token",token)
  const host = request.headers.get('host') || '';
  console.log("host",host)
  const subdomain = host.split('.')[0]; // store1.domain.com → store1
  console.log("subdomain",subdomain)
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    const userTenant = payload.tenant as string;
    const userRole = payload.role as string;

    if (userTenant !== subdomain) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    const requiredPermission = getRequiredPermission(pathname);
    if (!requiredPermission || hasPermission(userRole, requiredPermission)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/unauthorized', request.url));
  } catch (err) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('access_token');
    return response;
  }
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/prescriptions/:path*',
    '/invoices/:path*',
    '/reports/:path*'
  ],
}

const PUBLIC_ROUTES = ['/login', '/register', '/', '/about', '/contact']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('access_token')?.value

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(
      token,

      new TextEncoder().encode(process.env.JWT_SECRET!)
    )
    console.log("🔑 JWT payload:", payload)
    // ...rest of your logic
    
    return NextResponse.next()
  } catch (err) {
    console.error("❌ JWT verification failed:", err)
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('access_token')
    return response
  }
}