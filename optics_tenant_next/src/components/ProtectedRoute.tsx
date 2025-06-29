// "use client";

// import { useUser } from '@/src/lib/hooks/useCurrentUser';
// import { useRouter, usePathname } from 'next/navigation';
// import { useEffect } from 'react';
// import { toast } from 'react-toastify';

// const PUBLIC_ROUTES = ['/login', '/register', '/', '/about', '/contact'];

// const ROLE_PERMISSIONS: Record<string, string[] | '__all__'> = {
//   ADMIN: '__all__',
//   TECHNICIAN: ['create_prescription', 'edit_prescription', 'view_prescriptions'],
//   SALESPERSON: ['create_invoice', 'view_invoices', 'edit_invoice'],
// };

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

// function getRequiredPermission(pathname: string): string | null {
//   if (ROUTE_PERMISSIONS[pathname]) {
//     return ROUTE_PERMISSIONS[pathname];
//   }

//   for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
//     if (pathname.startsWith(route)) {
//       return permission;
//     }
//   }

//   if (pathname.startsWith('/admin')) return 'admin_access';
//   if (pathname.startsWith('/dashboard')) return 'view_dashboard';

//   return null;
// }

// function hasPermission(userRole: string, requiredPermission: string): boolean {
//   const rolePermissions = ROLE_PERMISSIONS[userRole];
//   if (!rolePermissions) return false;
//   if (rolePermissions === '__all__') return true;
//   return rolePermissions.includes(requiredPermission);
// }

// export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { user } = useUser();
//   const router = useRouter();
//   const pathname = usePathname();
//   const requiredPermission = getRequiredPermission(pathname);

//   const isAllowed =
//     !requiredPermission || (user?.role && hasPermission(user.role, requiredPermission));

//   useEffect(() => {
//     if (!user) {
//       toast.error('You are not logged in');
//       router.push('/auth/login');
//     } else if (!isAllowed) {
//       router.push('/unauthorized');
//     }
//   }, [user, isAllowed, router]);

//   if (!user || !isAllowed) {
//     return null;
//   }

//   return <>{children}</>;
// }
