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

interface CategoryPieChartProps {
  data: { category: string; total: number }[];
  loading: boolean;
}

function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CategoryPieChart({ data, loading }: CategoryPieChartProps): JSX.Element {
  if (loading) {
    return <div className="h-[300px] animate-pulse rounded-xl bg-gray-200" />;
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Spending by Category</h3>
      {data.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-gray-400">
          No spending data this month
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
