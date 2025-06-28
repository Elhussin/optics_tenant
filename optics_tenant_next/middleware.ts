// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import { jwtVerify } from 'jose'

// const PUBLIC_ROUTES = ['/login', '/register', '/'];

// export async function middleware(request: NextRequest) {
//   const token = request.cookies.get('access_token')?.value;
//   const pathname = request.nextUrl.pathname;

//   // allow access to public routes
//   if (PUBLIC_ROUTES.includes(pathname)) {
//     return NextResponse.next();
//   }

//   // if no token, redirect to login page
//   if (!token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   try {
//     // check if JWT_SECRET is defined in environment variables
//     if (!process.env.JWT_SECRET) {
//       console.error('JWT_SECRET is not defined in environment variables!');
//       return NextResponse.redirect(new URL('/login', request.url));
//     }

//     // verify token and decode
//     const { payload } = await jwtVerify(
//       token,
//       new TextEncoder().encode(process.env.JWT_SECRET)
//     );

//     const role = payload.role;
//     console.log(payload)
//     // example of access restriction based on role
//     if (pathname.startsWith('/dashboard')||pathname.startsWith('/admin')  && role !== 'ADMIN') {
//       return NextResponse.redirect(new URL('/unauthorized', request.url));
//     }

//     // allow access to the page
//     return NextResponse.next();

//   } catch (err) {
//     // in case of error like token expiration or invalid token
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
// }
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_ROUTES = ['/login', '/register', '/'];

const ROLE_PERMISSIONS: Record<string, string[] | '__all__'> = {
  ADMIN: '__all__',
  TECHNICIAN: ['create_prescription', 'edit_prescription'],
  SALESPERSON: ['create_invoice'],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const pathname = request.nextUrl.pathname;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );

    const role = payload.role as string;

    console.log("👤 Current Role:", role);
    console.log("🔐 Requested Path:", pathname);

    // تحديد الصلاحيات المسموحة بناءً على الدور
    const allowed = ROLE_PERMISSIONS[role];

    if (allowed === '__all__') {
      return NextResponse.next();
    }

    // مثال: لو المسار يتطلب create_invoice
    const requiredPermission = 'create_invoice'; // ← اجعلها ديناميكية لو تحب

    if (!allowed?.includes(requiredPermission)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();

  } catch (err) {
    console.error("JWT Error:", err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
