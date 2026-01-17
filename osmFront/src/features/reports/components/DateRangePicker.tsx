// features/reports/components/DateRangePicker.tsx
/**
 * محدد نطاق التاريخ
 */

"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import type { DateRange, ReportPeriod } from "../types/reports.types";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onApply?: () => void;
}

const presetPeriods: {
  id: ReportPeriod;
  label: string;
  getRange: () => DateRange;
}[] = [
  {
    id: "today",
    label: "اليوم",
    getRange: () => {
      const today = new Date().toISOString().split("T")[0];
      return { start_date: today, end_date: today };
    },
  },
  {
    id: "week",
    label: "هذا الأسبوع",
    getRange: () => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      return {
        start_date: start.toISOString().split("T")[0],
        end_date: now.toISOString().split("T")[0],
      };
    },
  },
  {
    id: "month",
    label: "هذا الشهر",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start_date: start.toISOString().split("T")[0],
        end_date: now.toISOString().split("T")[0],
      };
    },
  },
  {
    id: "quarter",
    label: "هذا الربع",
    getRange: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      return {
        start_date: start.toISOString().split("T")[0],
        end_date: now.toISOString().split("T")[0],
      };
    },
  },
  {
    id: "year",
    label: "هذه السنة",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return {
        start_date: start.toISOString().split("T")[0],
        end_date: now.toISOString().split("T")[0],
      };
    },
  },
];

export function DateRangePicker({
  value,
  onChange,
  onApply,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("month");

  const handlePresetSelect = (preset: (typeof presetPeriods)[0]) => {
    setSelectedPeriod(preset.id);
    onChange(preset.getRange());
    if (onApply) onApply();
  };

  const handleCustomChange = (
    field: "start_date" | "end_date",
    date: string
  ) => {
    setSelectedPeriod("custom");
    onChange({ ...value, [field]: date });
  };

  // Format display
  const formatDisplay = () => {
    if (value.start_date === value.end_date) {
      return value.start_date;
    }
    return `${value.start_date} - ${value.end_date}`;
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDisplay()}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-gray-900 rounded-xl shadow-xl border p-4 min-w-[320px]">
            {/* Presets */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">
                فترات سريعة
              </label>
              <div className="flex flex-wrap gap-2">
                {presetPeriods.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={
                      selectedPeriod === preset.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="border-t pt-4">
              <label className="text-xs text-gray-500 mb-2 block">
                تاريخ مخصص
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-400">من</label>
                  <Input
                    type="date"
                    value={value.start_date}
                    onChange={(e) =>
                      handleCustomChange("start_date", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400">إلى</label>
                  <Input
                    type="date"
                    value={value.end_date}
                    onChange={(e) =>
                      handleCustomChange("end_date", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {onApply && (
                <Button
                  className="w-full mt-4"
                  onClick={() => {
                    onApply();
                    setIsOpen(false);
                  }}
                >
                  تطبيق
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DateRangePicker;
