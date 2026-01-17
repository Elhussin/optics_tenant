// features/reports/components/ReportChart.tsx
/**
 * مكونات الرسوم البيانية للتقارير
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";

// Simple Bar Chart (CSS-based)
interface BarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  title?: string;
  height?: number;
}

export function BarChart({ data, title, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const defaultColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
  ];

  return (
    <div>
      {title && <h4 className="font-semibold mb-4">{title}</h4>}
      <div className="flex items-end gap-2 justify-between" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const color =
            item.color || defaultColors[index % defaultColors.length];

          return (
            <div key={item.label} className="flex flex-col items-center flex-1">
              <div className="w-full relative flex flex-col justify-end h-full">
                <div
                  className={`w-full rounded-t ${color} transition-all duration-500 hover:opacity-80`}
                  style={{
                    height: `${barHeight}%`,
                    minHeight: item.value > 0 ? 4 : 0,
                  }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                    {item.value.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2 truncate max-w-full text-center">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple Line Chart (CSS-based)
interface LineChartProps {
  data: number[];
  labels: string[];
  title?: string;
  height?: number;
  color?: string;
}

export function LineChart({
  data,
  labels,
  title,
  height = 200,
  color = "text-primary",
}: LineChartProps) {
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue;

  return (
    <div>
      {title && <h4 className="font-semibold mb-4">{title}</h4>}
      <div className="relative" style={{ height }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-500 w-12">
          <span>{maxValue.toLocaleString()}</span>
          <span>{Math.round(maxValue / 2).toLocaleString()}</span>
          <span>{minValue.toLocaleString()}</span>
        </div>

        {/* Chart Area */}
        <div className="mr-14 h-full pb-6 relative">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="border-b border-gray-100 dark:border-gray-800"
              />
            ))}
          </div>

          {/* Line */}
          <svg
            className="absolute inset-0 overflow-visible"
            viewBox={`0 0 ${data.length * 100} ${height - 24}`}
            preserveAspectRatio="none"
          >
            {/* Area Fill */}
            <path
              d={`
                M 0 ${height - 24}
                ${data
                  .map((value, i) => {
                    const x = i * 100 + 50;
                    const y =
                      range > 0
                        ? height -
                          24 -
                          ((value - minValue) / range) * (height - 24)
                        : height / 2;
                    return `L ${x} ${y}`;
                  })
                  .join(" ")}
                L ${data.length * 100 - 50} ${height - 24}
                Z
              `}
              fill="url(#gradient)"
              opacity="0.2"
            />

            {/* Line */}
            <path
              d={data
                .map((value, i) => {
                  const x = i * 100 + 50;
                  const y =
                    range > 0
                      ? height -
                        24 -
                        ((value - minValue) / range) * (height - 24)
                      : height / 2;
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={color}
            />

            {/* Dots */}
            {data.map((value, i) => {
              const x = i * 100 + 50;
              const y =
                range > 0
                  ? height - 24 - ((value - minValue) / range) * (height - 24)
                  : height / 2;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="currentColor"
                  className={color}
                />
              );
            })}

            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" className={color} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-14 right-0 flex justify-between text-xs text-gray-500">
          {labels.map((label, i) => (
            <span key={i} className="text-center">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Donut Chart (CSS-based)
interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  title?: string;
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  title,
  size = 160,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="flex flex-col items-center">
      {title && <h4 className="font-semibold mb-4">{title}</h4>}
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, index) => {
            const percent = total > 0 ? (item.value / total) * 100 : 0;
            const offset = cumulativePercent;
            cumulativePercent += percent;

            const strokeDasharray = `${percent} ${100 - percent}`;
            const strokeDashoffset = -offset;

            return (
              <circle
                key={item.label}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={item.color}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-2xl font-bold">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-gray-500">{centerLabel}</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600 dark:text-gray-400">
              {item.label}
            </span>
            <span className="font-medium mr-auto">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BarChart;
