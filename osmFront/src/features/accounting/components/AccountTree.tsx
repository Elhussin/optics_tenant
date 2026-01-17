// features/accounting/components/AccountTree.tsx
/**
 * شجرة دليل الحسابات
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Edit,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
} from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import type { ChartOfAccount, AccountType } from "../types/accounting.types";

interface AccountTreeProps {
  accounts: ChartOfAccount[];
  onSelect?: (account: ChartOfAccount) => void;
  onEdit?: (account: ChartOfAccount) => void;
  onAdd?: (parentId?: number) => void;
  selectedId?: number;
}

const accountTypeConfig: Record<
  AccountType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  asset: {
    icon: <Wallet className="w-4 h-4" />,
    color: "text-blue-600 bg-blue-100",
    label: "أصول",
  },
  liability: {
    icon: <TrendingDown className="w-4 h-4" />,
    color: "text-red-600 bg-red-100",
    label: "خصوم",
  },
  equity: {
    icon: <PiggyBank className="w-4 h-4" />,
    color: "text-purple-600 bg-purple-100",
    label: "حقوق ملكية",
  },
  revenue: {
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-green-600 bg-green-100",
    label: "إيرادات",
  },
  expense: {
    icon: <DollarSign className="w-4 h-4" />,
    color: "text-orange-600 bg-orange-100",
    label: "مصروفات",
  },
};

// Build tree from flat accounts
function buildTree(accounts: ChartOfAccount[]): ChartOfAccount[] {
  const map = new Map<number, ChartOfAccount>();
  const roots: ChartOfAccount[] = [];

  // First pass: create map
  accounts.forEach((acc) => {
    map.set(acc.id, { ...acc, children: [] });
  });

  // Second pass: build tree
  accounts.forEach((acc) => {
    const node = map.get(acc.id)!;
    if (acc.parent && map.has(acc.parent)) {
      const parent = map.get(acc.parent)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// Tree Node Component
function TreeNode({
  account,
  level = 0,
  onSelect,
  onEdit,
  onAdd,
  selectedId,
}: {
  account: ChartOfAccount;
  level?: number;
  onSelect?: (account: ChartOfAccount) => void;
  onEdit?: (account: ChartOfAccount) => void;
  onAdd?: (parentId?: number) => void;
  selectedId?: number;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = account.children && account.children.length > 0;
  const isSelected = selectedId === account.id;
  const config = accountTypeConfig[account.account_type];

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isSelected ? "bg-primary/10 border-r-4 border-primary" : ""
        }`}
        style={{ paddingRight: `${level * 20 + 12}px` }}
        onClick={() => onSelect?.(account)}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Icon */}
        <div className={`p-1.5 rounded ${config.color}`}>
          {hasChildren ? (
            expanded ? (
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )
          ) : (
            <FileText className="w-4 h-4" />
          )}
        </div>

        {/* Code & Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">
              {account.code}
            </span>
            <span className="font-medium truncate">{account.name}</span>
          </div>
        </div>

        {/* Balance */}
        <div className="text-sm font-medium text-left min-w-[100px]">
          {parseFloat(account.current_balance).toLocaleString()} ر.س
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && !account.is_system && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(account);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <Edit className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(account.id);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {account.children!.map((child) => (
            <TreeNode
              key={child.id}
              account={child}
              level={level + 1}
              onSelect={onSelect}
              onEdit={onEdit}
              onAdd={onAdd}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountTree({
  accounts,
  onSelect,
  onEdit,
  onAdd,
  selectedId,
}: AccountTreeProps) {
  const tree = useMemo(() => buildTree(accounts), [accounts]);

  // Group by account type
  const groupedTree = useMemo(() => {
    const groups: Record<AccountType, ChartOfAccount[]> = {
      asset: [],
      liability: [],
      equity: [],
      revenue: [],
      expense: [],
    };

    tree.forEach((acc) => {
      if (groups[acc.account_type]) {
        groups[acc.account_type].push(acc);
      }
    });

    return groups;
  }, [tree]);

  return (
    <div className="space-y-4">
      {Object.entries(groupedTree).map(([type, items]) => {
        if (items.length === 0) return null;
        const config = accountTypeConfig[type as AccountType];

        return (
          <div key={type} className="border rounded-lg overflow-hidden">
            <div
              className={`flex items-center gap-2 px-4 py-3 ${config.color}`}
            >
              {config.icon}
              <span className="font-semibold">{config.label}</span>
              <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <div className="p-2 space-y-0.5 group">
              {items.map((account) => (
                <TreeNode
                  key={account.id}
                  account={account}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onAdd={onAdd}
                  selectedId={selectedId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AccountTree;
