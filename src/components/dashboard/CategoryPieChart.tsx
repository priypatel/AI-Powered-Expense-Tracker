"use client";

import type { JSX } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { CATEGORY_COLORS } from "@/types/index";
import type { Category } from "@/types/index";
import { Skeleton } from "@/components/ui/Skeleton";

interface CategoryPieChartProps {
  data: { category: string; total: number }[];
  loading: boolean;
}

function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CategoryPieChart({ data, loading }: CategoryPieChartProps): JSX.Element {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow">
        <Skeleton className="mb-4 h-4 w-36" />
        <div className="flex h-[260px] items-center justify-center">
          <Skeleton className="h-44 w-44 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Spending by Category</h3>
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
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No spending this month</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={90}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category as Category] ?? "#94a3b8"}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatINR(value as number), "Spent"]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
