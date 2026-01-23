"use client";
import React, { useState, useMemo } from "react";
import { useRoles } from "@/src/features/roles/hooks/useRoles";
import { Role, Permission } from "../types";
import { PermissionList } from "./PermissionList";
import { RoleDialog } from "./RoleDialog";
import { HasPermission } from "@/src/shared/components/auth/HasPermission";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Badge } from "@/src/shared/components/ui/Badge";
import {
  Plus,
  Settings,
  Shield,
  Trash2,
  Edit3,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const RolesManager = () => {
  const {
    roles,
    permissions,
    isLoading,
    deleteRole,
    updatePermissions,
    rolesQuery,
  } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [permSearchQuery, setPermSearchQuery] = useState("");

  const rolesLoading = isLoading;

  const selectedRole = useMemo(
    () => roles.find((r: Role) => r.id === selectedRoleId) || null,
    [roles, selectedRoleId],
  );

  const handleCreateRole = () => {
    setEditRole(null);
    setIsDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditRole(role);
    setIsDialogOpen(true);
  };

  const handleDeleteRole = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      await deleteRole(id);
      if (selectedRoleId === id) setSelectedRoleId(null);
    }
  };

  const handleTogglePermission = async (permissionId: number) => {
    if (!selectedRole) return;

    const currentPermIds = selectedRole.permissions.map(
      (p: Permission) => p.id,
    );
    const newPermIds = currentPermIds.includes(permissionId)
      ? currentPermIds.filter((id: number) => id !== permissionId)
      : [...currentPermIds, permissionId];

    await updatePermissions({
      roleId: selectedRole.id,
      permissionIds: newPermIds,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Roles List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-main flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            System Roles
          </h3>
          <HasPermission permission="change_role">
            <ActionButton
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              label="New"
              onClick={handleCreateRole}
            />
          </HasPermission>
        </div>

        <div className="space-y-3">
          {rolesLoading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-elevated animate-pulse rounded-2xl"
                />
              ))
            : roles.map((role:any) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <GlassCard
                    padding="none"
                    className={`
                    cursor-pointer transition-all border-l-4
                    ${
                      selectedRoleId === role.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg translate-x-1"
                        : "border-transparent border-l-border-main/20 hover:border-l-primary/50"
                    }
                  `}
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-main truncate">
                            {role.name}
                          </span>
                          {!role.is_active && (
                            <Badge variant="danger" size="lg">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-secondary truncate mt-1">
                          {role.permissions?.length || 0} Permissions assigned
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditRole(role);
                          }}
                          className="p-2 hover:bg-primary/10 rounded-lg text-secondary hover:text-primary transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(role.id);
                          }}
                          className="p-2 hover:bg-danger/10 rounded-lg text-secondary hover:text-danger transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight
                          size={18}
                          className={
                            selectedRoleId === role.id
                              ? "text-primary"
                              : "text-border-main/50"
                          }
                        />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
        </div>
      </div>

      {/* Permissions Editor */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {selectedRole ? (
            <motion.div
              key={selectedRole.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard className="min-h-[500px] shadow-xl border-primary/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-main">
                        {selectedRole.name}
                      </h3>
                      <Badge
                        variant={selectedRole.is_active ? "success" : "danger"}
                      >
                        {selectedRole.is_active ? (
                          <ShieldCheck size={14} />
                        ) : (
                          <ShieldAlert size={14} />
                        )}
                        {selectedRole.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-secondary mt-1 max-w-xl italic">
                      {selectedRole.description ||
                        "No description provided for this role."}
                    </p>
                  </div>
                </div>

                <PermissionList
                  permissions={permissions}
                  selectedIds={selectedRole.permissions.map((p:any) => p.id)}
                  onToggle={handleTogglePermission}
                  searchQuery={permSearchQuery}
                  onSearchChange={setPermSearchQuery}
                />
              </GlassCard>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-border-main/30 rounded-3xl bg-elevated/20">
              <div className="text-center">
                <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4 text-primary">
                  <Shield size={48} />
                </div>
                <h3 className="text-xl font-bold text-main mb-2">
                  Manage Permissions
                </h3>
                <p className="text-secondary max-w-xs mx-auto">
                  Select a role from the list on the left to manage its specific
                  access rights.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <RoleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        role={editRole}
        onSuccess={() => rolesQuery.refetch()}
      />
    </div>
  );
};
