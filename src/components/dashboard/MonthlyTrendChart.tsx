"use client";

import type { JSX } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface MonthlyTrendChartProps {
  data: { label: string; total: number }[];
  loading: boolean;
}

function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function MonthlyTrendChart({ data, loading }: MonthlyTrendChartProps): JSX.Element {
  if (loading) {
    return <div className="h-[300px] animate-pulse rounded-xl bg-gray-200" />;
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Monthly Trend</h3>
      {data.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-gray-400">
          No trend data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `₹${v}`}
            />
            <Tooltip formatter={(value) => [formatINR(value as number), "Spending"]} />
            <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
