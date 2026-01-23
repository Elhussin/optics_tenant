"use client";
import React from "react";
import { usePermissions } from "@/src/features/auth/hooks/usePermissions";

interface HasPermissionProps {
  /** The code of the permission to check (e.g., 'view_products') */
  permission?: string;
  /** A list of permission codes, requires any of them */
  anyOf?: string[];
  /** A list of permission codes, requires all of them */
  allOf?: string[];
  /** Children to render if permission is granted */
  children: React.ReactNode;
  /** What to render if permission is NOT granted. Default is null. */
  fallback?: React.ReactNode;
  /** If true, will render children but disabled (if they support disabled prop) */
  disabledOnly?: boolean;
}

/**
 * A wrapper component to conditionally render parts of the UI based on user permissions.
 */
export const HasPermission: React.FC<HasPermissionProps> = ({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
  disabledOnly = false,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  let isAllowed = false;

  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (anyOf) {
    isAllowed = hasAnyPermission(anyOf);
  } else if (allOf) {
    isAllowed = hasAllPermissions(allOf);
  } else {
    // If no permission specified, allow by default or handle as error
    isAllowed = true;
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  if (disabledOnly) {
    return (
      <div className="opacity-50 cursor-not-allowed pointer-events-none filter grayscale">
        {children}
      </div>
    );
  }

  return <>{fallback}</>;
};

export default HasPermission;
