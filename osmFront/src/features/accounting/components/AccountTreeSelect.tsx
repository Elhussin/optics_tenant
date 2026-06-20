"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FileText, Check } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export interface AccountNode {
  id: number;
  account_code: string;
  name: string;
  account_type?: string;
  is_active: boolean;
  children: AccountNode[];
}

interface AccountTreeSelectProps {
  data: AccountNode[];
  selectedId: number | null;
  onSelect: (id: number, name: string) => void;
}

export function AccountTreeSelect({ data, selectedId, onSelect }: AccountTreeSelectProps) {
  return (
    <div className="border border-border-main rounded-xl p-2 bg-surface max-h-[400px] overflow-y-auto">
      {data.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          level={0}
        />
      ))}
      {data.length === 0 && (
        <p className="text-sm text-secondary text-center py-4">لا توجد حسابات</p>
      )}
    </div>
  );
}

interface TreeNodeProps {
  node: AccountNode;
  selectedId: number | null;
  onSelect: (id: number, name: string) => void;
  level: number;
}

function TreeNode({ node, selectedId, onSelect, level }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors group",
          isSelected && "bg-primary/10"
        )}
        style={{ paddingRight: `${level * 1.5 + 0.5}rem` }} // RTL support: paddingRight instead of paddingLeft
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          } else {
            onSelect(node.id, node.name);
          }
        }}
      >
        {/* Toggle Icon */}
        <div className="w-5 flex items-center justify-center text-secondary">
          {hasChildren && (
            expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </div>

        {/* Icon based on folder vs leaf */}
        <div className={cn("text-primary/70", isSelected && "text-primary")}>
          {hasChildren ? <Folder className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        </div>

        {/* Text */}
        <div className="flex-1 flex items-center gap-2 text-sm text-main font-medium">
          <span className="text-secondary text-xs">{node.account_code}</span>
          <span>{node.name}</span>
        </div>

        {/* Action / Select Icon */}
        {!hasChildren && (
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(node.id, node.name);
            }}
          >
            {isSelected ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <span className="text-xs text-primary hover:underline">اختيار</span>
            )}
          </div>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="mt-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
