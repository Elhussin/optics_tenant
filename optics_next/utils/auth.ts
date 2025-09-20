// utils/auth.ts
export function hasPermission(user: any, permission: string) {
    if (!user) return false;
    console.log(user);
    if (user.role.name === 'ADMIN' || user.role.name === 'OWNER') return true;
    return user.permissions.includes(permission);
  }
  


  
  // lib/hooks/usePermission.ts
  import { useUser } from '../lib/contexts/userContext';
  
  const ROLE_PERMISSIONS: Record<string, string[] | '__all__'> = {
    ADMIN: '__all__',
    TECHNICIAN: ['create_prescription', 'edit_prescription', 'view_prescriptions'],
    SALESPERSON: ['create_invoice', 'view_invoices', 'edit_invoice'],
  };
  
  export function UsePermission(permission: string): boolean {
    const userContext = useUser();
    
    // During SSR, userContext will be undefined
    if (typeof window === 'undefined') return false;
    
    if (!userContext || userContext.loading || !userContext.user) return false;
  
    // Get the actual user role instead of hardcoding
    const userRole = userContext.user?.role.name || 'GUEST';
    const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  
    if (!permissions) return false;
    if (permissions === '__all__') return true;
  
    return permissions.includes(permission);
  }
  