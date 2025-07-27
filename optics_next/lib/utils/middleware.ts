import { NextResponse,NextRequest } from 'next/server';

// export function getRequiredPermission(pathname: string): string | null {

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

// export function unauthorizedResponse(target: string, message: string, redirect?: string) {
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

export function getRequiredPermission(pathname: string): string | null {
  // Clean the path by removing the language prefix
  const cleanPath = pathname.replace(/^\/(ar|en)/, '') || '/';
  
  // The root path does not require permission
  if (cleanPath === '/') return null;
  
  // Public paths that do not require special permissions
  const publicPaths = [
    '/about',
    '/contact', 
    '/services',
    '/pricing',
    '/help',
    '/terms',
    '/privacy',
    '/unauthorized',
    '/auth/login',
    '/auth/register',
    '/auth/activate',
    '/auth/forget-password',
    '/auth/reset-password'
  ];
  
  if (publicPaths.includes(cleanPath)) return null;
  
  const routeMap: [RegExp, string][] = [
    [/^\/admin/, 'admin_access'],
    [/^\/dashboard/, 'view_dashboard'],
    // [/^\/profile/, 'view_profile'],
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
    if (regex.test(cleanPath)) return permission;
  }
  
  // By default, unknown paths require login but without special permissions
  return 'authenticated_user';
}

export function unauthorizedResponse(request: NextRequest, target: string, message: string) {
  // Using the request to get the correct URL
  const redirectUrl = new URL(target, request.url);
  
  // Add redirect information
  redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
  // redirectUrl.searchParams.set('message', encodeURIComponent(message));
  
  const response = NextResponse.redirect(redirectUrl);
  
  // Set cookies with better options
  response.cookies.set('alert_message', message, { 
    path: '/', 
    maxAge: 30, // 30 seconds
    httpOnly: false, // allow JavaScript to read it
    secure: process.env.NODE_ENV === 'production' 
  });
  
  response.cookies.set('alert_type', 'error', { 
    path: '/', 
    maxAge: 30,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production'
  });
  
  return response;
}
