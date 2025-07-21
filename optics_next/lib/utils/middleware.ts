import { NextResponse } from 'next/server';

export function getRequiredPermission(pathname: string): string | null {

  let routeMap: [RegExp, string][] = [
    [/^\/admin/, 'admin_access'],
    [/^\/dashboard/, 'view_dashboard'],
    [/^\/profile/, 'view_profile'],
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
    if (regex.test(pathname)) return permission;
  }
  return null;
}

export function unauthorizedResponse(target: string, message: string, redirect?: string) {
  const url = new URL(target, 'http://' + process.env.NEXT_PUBLIC_BASE_DOMAIN);

  if (redirect) {
    url.searchParams.set('redirect', redirect);
    // sessionStorage.setItem('redirect', redirect);
  }

  const response = NextResponse.redirect(url);

  response.cookies.set('alert_message', message+" " + redirect, { path: '/', maxAge: 5 });
  response.cookies.set('alert_type', 'error', { path: '/', maxAge: 5 });


  return response;
}

