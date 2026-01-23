"use client";
import React from "react";
import { Permission } from "../types";
import { Checkbox } from "@/src/shared/components/ui/Checkbox";
import { Search, Shield } from "lucide-react";
import { getPermissionDetails } from "@/src/shared/utils/permissionMapping";

interface PermissionListProps {
  permissions: Permission[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const PermissionList = ({
  permissions,
  selectedIds,
  onToggle,
  searchQuery,
  onSearchChange,
}: PermissionListProps) => {
  const filteredPermissions = permissions.filter(
    (p) =>
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group permissions using the new mapping
  const grouped = filteredPermissions.reduce((acc, p) => {
    const details = getPermissionDetails(p.code);
    const group = details.category || "General";
    if (!acc[group]) acc[group] = [];
    acc[group].push({ ...p, details });
    return acc;
  }, {} as Record<string, (Permission & { details: any })[]>);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
          size={18}
        />
        <input
          type="text"
          placeholder="Search permissions (e.g. Products, View)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-elevated border border-border-main/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-main transition-all"
        />
      </div>

      <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {Object.entries(grouped).map(([group, groupPermissions]) => (
          <div key={group} className="space-y-3">
            <h4 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2 px-1">
              <Shield size={14} className="text-primary" />
              {group}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groupPermissions.map((permission) => (
                <div
                  key={permission.id}
                  onClick={() => onToggle(permission.id)}
                  title={permission.code}
                  className={`
                    p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 group
                    ${
                      selectedIds.includes(permission.id)
                        ? "bg-primary/10 border-primary/30 shadow-sm ring-1 ring-primary/10"
                        : "bg-elevated border-border-main/50 hover:border-primary/20 hover:bg-elevated-hover"
                    }
                  `}
                >
                  <Checkbox
                    checked={selectedIds.includes(permission.id)}
                    onChange={() => {}} // onClick handles it
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-main truncate group-hover:text-primary transition-colors">
                      {permission.details.name}
                    </p>
                    <p className="text-xs text-secondary line-clamp-2 mt-0.5 leading-relaxed">
                      {permission.details.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary">
              No permissions found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
