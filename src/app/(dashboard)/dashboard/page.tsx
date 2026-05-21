"use client";

import { useEffect } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { BudgetAlertBanner } from "@/components/dashboard/BudgetAlertBanner";

export default function DashboardPage(): JSX.Element {
  const { stats, loading, fetchStats } = useDashboard();

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const now = new Date();
  const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">{monthYear}</p>
      </div>

      <BudgetAlertBanner alerts={stats?.budgetAlerts ?? []} />

      <StatsCards
        totalThisMonth={stats?.totalThisMonth ?? 0}
        expenseCount={stats?.expenseCount ?? 0}
        loading={loading}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CategoryPieChart data={stats?.categoryBreakdown ?? []} loading={loading} />
        <MonthlyTrendChart data={stats?.monthlyTrend ?? []} loading={loading} />
      </div>
    </div>
  );
}
