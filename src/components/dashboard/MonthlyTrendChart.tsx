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
import { Skeleton } from "@/components/ui/Skeleton";

interface MonthlyTrendChartProps {
  data: { label: string; total: number }[];
  loading: boolean;
}

function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function MonthlyTrendChart({ data, loading }: MonthlyTrendChartProps): JSX.Element {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow">
        <Skeleton className="mb-4 h-4 w-28" />
        <div className="flex h-[260px] items-end gap-2 px-4">
          {[60, 85, 45, 70, 90, 55].map((h, i) => (
            <div key={i} className="flex-1 animate-pulse rounded-t bg-gray-200" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Monthly Trend</h3>
      {data.length === 0 ? (
        <div className="flex h-[260px] flex-col items-center justify-center gap-3">
          <div className="rounded-full bg-gray-100 p-3">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">No trend data yet</p>
            <p className="mt-0.5 text-xs text-gray-500">Add expenses to see your spending history</p>
          </div>
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
