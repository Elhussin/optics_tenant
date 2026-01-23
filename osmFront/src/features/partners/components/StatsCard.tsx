"use client";

import { GlassCard } from "@/src/shared/components/ui/GlassCard";

interface StatsCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange" | "yellow" | "red";
}

export function StatsCard({
  title,
  value,
  suffix = "",
  icon,
  color,
}: StatsCardProps) {
  const gradients = {
    blue: "from-blue-500/10 to-blue-600/5 text-blue-600",
    green: "from-emerald-500/10 to-emerald-600/5 text-emerald-600",
    purple: "from-violet-500/10 to-violet-600/5 text-violet-600",
    orange: "from-amber-500/10 to-amber-600/5 text-amber-600",
    yellow: "from-yellow-500/10 to-yellow-600/5 text-yellow-600",
    red: "from-red-500/10 to-red-600/5 text-red-600",
  };

  return (
    <GlassCard className="relative overflow-hidden border-none" padding="sm">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[color]} opacity-50`}
      />
      <div className="relative z-10 flex items-center gap-4">
        <div
          className={`p-3 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm ${gradients[color]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-secondary">{title}</p>
          <p className="text-2xl font-bold text-main mt-0.5">
            {value}
            <span className="text-sm font-normal text-secondary ml-1">
              {suffix}
            </span>
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
