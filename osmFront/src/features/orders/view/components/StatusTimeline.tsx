import React from "react";
import { Check, Clock, Package, Truck, Calendar } from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";

interface TimelineEvent {
  label: string;
  date: string | null;
  icon: React.ReactNode;
  completed: boolean;
}

interface StatusTimelineProps {
  createdAt: string;
  confirmedAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
  status: string;
}

export function StatusTimeline({
  createdAt,
  confirmedAt,
  readyAt,
  deliveredAt,
  status,
}: StatusTimelineProps) {
  const events: TimelineEvent[] = [
    {
      label: "تم الإنشاء",
      date: createdAt,
      icon: <Calendar size={18} />,
      completed: true,
    },
    {
      label: "تم التأكيد",
      date: confirmedAt || null,
      icon: <Check size={18} />,
      completed:
        !!confirmedAt || ["confirmed", "ready", "delivered"].includes(status),
    },
    {
      label: "جاهز للتسليم",
      date: readyAt || null,
      icon: <Package size={18} />,
      completed: !!readyAt || ["ready", "delivered"].includes(status),
    },
    {
      label: "تم التسليم",
      date: deliveredAt || null,
      icon: <Truck size={18} />,
      completed: !!deliveredAt || status === "delivered",
    },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <GlassCard className="border-border-main/50" hover>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-main mb-6 flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          مراحل الطلب
        </h3>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute right-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-border-main" />

          {/* Events */}
          <div className="space-y-6">
            {events.map((event, index) => (
              <div
                key={index}
                className="relative flex items-start gap-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon Circle */}
                <div
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    event.completed
                      ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30"
                      : "bg-surface border-2 border-border-main text-secondary"
                  }`}
                >
                  {event.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <p
                    className={`font-semibold mb-1 transition-colors ${
                      event.completed ? "text-main" : "text-secondary"
                    }`}
                  >
                    {event.label}
                  </p>
                  {event.date && (
                    <p className="text-sm text-secondary font-mono">
                      {formatDate(event.date)}
                    </p>
                  )}
                  {!event.date && event.completed && (
                    <p className="text-xs text-secondary italic">قيد التنفيذ</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
