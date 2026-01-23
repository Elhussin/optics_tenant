"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/shared/api/axios";
import { Role, Permission } from "../types";
import { useMemo } from "react";

/**
 * Hook for managing roles and permissions
 */
export function useRoles() {
    const queryClient = useQueryClient();

    // Fetching Roles
    const rolesQuery = useQuery({
        queryKey: ["users_roles_list"],
        queryFn: () => api.customRequest("users_roles_list"),
    });

    const roles = useMemo(() => {
        if (!rolesQuery.data) return [];
        const data = rolesQuery.data;
        return Array.isArray(data) ? data : data.results || [];
    }, [rolesQuery.data]);

    // Fetching Permissions
    const permissionsQuery = useQuery({
        queryKey: ["users_permissions_list"],
        queryFn: () => api.customRequest("users_permissions_list"),
    });

    const permissions = useMemo(() => {
        if (!permissionsQuery.data) return [];
        const data = permissionsQuery.data;
        return Array.isArray(data) ? data : data.results || [];
    }, [permissionsQuery.data]);

    // Mutations
    const deleteRoleMutation = useMutation({
        mutationFn: (id: number) => api.customRequest("users_roles_destroy", { id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users_roles_list"] });
        },
    });

    const updatePermissionsMutation = useMutation({
        mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
            api.customRequest("users_roles_partial_update", {
                id: roleId,
                permission_ids: permissionIds,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users_roles_list"] });
        },
    });

    return {
        roles,
        permissions,
        isLoading: rolesQuery.isLoading || permissionsQuery.isLoading,
        deleteRole: deleteRoleMutation.mutateAsync,
        updatePermissions: updatePermissionsMutation.mutateAsync,
        rolesQuery,
        permissionsQuery,
    };
}
