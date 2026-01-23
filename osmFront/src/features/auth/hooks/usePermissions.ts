"use client";
import { useUser } from "./UserContext";
import { useMemo } from "react";

/**
 * Hook to check if the current user has a specific permission.
 */
export function usePermissions() {
    const { user } = useUser();

    const userPermissions = useMemo(() => {
        if (!user) return new Set<string>();

        const perms = new Set<string>();

        // Check main role
        if (user.role?.permissions) {
            user.role.permissions.forEach((p: any) => perms.add(p.code));
        }

        // Support for multiple roles if it exists in the user object
        if (user.roles && Array.isArray(user.roles)) {
            user.roles.forEach((role: any) => {
                role.permissions?.forEach((p: any) => perms.add(p.code));
            });
        }

        return perms;
    }, [user]);

    const hasPermission = (permissionCode: string) => {
        if (user?.is_staff) return true; // Admins have all permissions
        return userPermissions.has(permissionCode);
    };

    const hasAnyPermission = (permissionCodes: string[]) => {
        if (user?.is_staff) return true;
        return permissionCodes.some((code) => userPermissions.has(code));
    };

    const hasAllPermissions = (permissionCodes: string[]) => {
        if (user?.is_staff) return true;
        return permissionCodes.every((code) => userPermissions.has(code));
    };

    return {
        permissions: Array.from(userPermissions),
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isStaff: user?.is_staff || false,
        isAdmin: user?.is_staff || false,
    };
}
