import React from "react";
import { Eye, Activity, Sparkles } from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";

type LensData = {
  SPH: string;
  CY?: string;
  ADD: string;
  "Exact SPH": string;
  "Exact CY"?: string;
  AX: string;
  BV: number;
};

type Props = {
  leftSphere: LensData;
  rightSphere: LensData;
  leftToric: LensData;
  rightToric: LensData;
};

const ContactLensViewer: React.FC<Props> = ({
  rightSphere,
  leftSphere,
  rightToric,
  leftToric,
}) => {
  const renderSection = (
    title: string,
    data: LensData,
    side: "right" | "left",
    variant: "info" | "success"
  ) => {
    return (
      <div className="relative group">
        {/* Subtle glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

        <GlassCard
          className="h-full hover:shadow-lg transition-all duration-300"
          padding="none"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-main/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-primary" />
              <h3 className="font-semibold text-sm text-main">{title}</h3>
            </div>
            <Badge variant={variant} size="sm">
              {side === "right" ? "OD" : "OS"}
            </Badge>
          </div>

          {/* Data */}
          <div className="p-4 space-y-2">
            {Object.entries(data).map(([key, value], index) => (
              <div
                key={key}
                className="flex justify-between items-center p-2 rounded-lg bg-elevated/30 hover:bg-elevated/50 transition-colors"
              >
                <span className="text-secondary font-medium text-xs uppercase tracking-wide">
                  {key}
                </span>
                <span className="font-mono font-semibold text-main">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-main flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Calculated Contact Lens Values
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderSection("Right Sphere", rightSphere, "right", "info")}
        {renderSection("Left Sphere", leftSphere, "left", "success")}
        {renderSection("Right Toric", rightToric, "right", "info")}
        {renderSection("Left Toric", leftToric, "left", "success")}
      </div>
    </div>
  );
};

export default ContactLensViewer;
