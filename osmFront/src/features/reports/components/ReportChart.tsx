// features/reports/components/ReportChart.tsx
/**
 * مكونات الرسوم البيانية للتقارير باستخدام Recharts
 */

"use client";

import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const DEFAULT_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f97316", "#ec4899", "#06b6d4"];

// Simple Bar Chart
interface BarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  title?: string;
  height?: number;
}

export function BarChart({ data, title, height = 300 }: BarChartProps) {
  return (
    <div className="w-full">
      {title && <h4 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">{title}</h4>}
      <div style={{ height, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Simple Line Chart
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
  height = 300,
  color = "#3b82f6",
}: LineChartProps) {
  const chartData = labels.map((label, index) => ({
    label,
    value: data[index] || 0,
  }));

  return (
    <div className="w-full">
      {title && <h4 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">{title}</h4>}
      <div style={{ height, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: color }}
              activeDot={{ r: 6 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Donut Chart
interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  title?: string;
  height?: number;
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, title, height, size, centerLabel, centerValue }: DonutChartProps) {
  const chartHeight = height ?? size ?? 300;
  return (
    <div className="w-full relative">
      {title && <h4 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">{title}</h4>}
      <div style={{ height: chartHeight, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              nameKey="label"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
          {centerValue && <span className="text-2xl font-bold">{centerValue}</span>}
          {centerLabel && <span className="text-xs text-gray-500">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}
